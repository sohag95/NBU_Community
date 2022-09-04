const CampusGroup = require("../models/CampusGroup")
const OfficialUsers = require("../models/OfficialUsers")
const StudentDataHandle = require("../models/StudentDataHandle")

exports.campusGroups=async function(req,res){
  try{
    let campusGroups=await OfficialUsers.getAllCampusGroupData()
    let groups={
      research:{
        total:campusGroups.research.allGroups.length,
        completed:campusGroups.research.completedGroups.length
      },
      social_Work:{
        total:campusGroups.social_Work.allGroups.length,
        completed:campusGroups.social_Work.completedGroups.length
      },
      cultural:{
        total:campusGroups.cultural.allGroups.length,
        completed:campusGroups.cultural.completedGroups.length
      },
      skill_Development:{
        total:campusGroups.skill_Development.allGroups.length,
        completed:campusGroups.skill_Development.completedGroups.length
      },
      business:{
        total:campusGroups.business.allGroups.length,
        completed:campusGroups.business.completedGroups.length
      }
    }
    res.render("campus-groups-types-page",{
      allCampusGroups:groups
    })
  }catch{
    res.render("404")
  }
  
}

exports.campusGroupCreationForm=function(req,res){
  res.render("campus-group-creation-form")
}



exports.ifValidCampusGroupType=function(req,res,next){
  if (req.params.groupType == "social_Work" || req.params.groupType == "caltural" || req.params.groupType == "business" || req.params.groupType == "skill_Development" || req.params.groupType == "research") {
    next()
  }else{
    req.flash("errors", "Campus group type is not matching!!")
    res.redirect("/campus-groups")
  }
}

exports.allSameTypeGroupsPage=async function(req,res){
  try{
    let allGroups=await CampusGroup.getCompletedAndRunningGroups(req.params.groupType) 
    let groups={
      groupType:req.params.groupType,
      noOfRunningGroups:allGroups.runningGroups.length,
      noOfCompletedGroups:allGroups.completedGroups.length,
      runningGroups:allGroups.runningGroups.slice(0,5),
      completedGroups:allGroups.completedGroups.slice(0,5)
    }
    console.log("Groups:",groups)
    res.render("campus-groups-same-type",{
      groups:groups
    })
  }catch{
    req.flash("errors", "There is some problem!!")
    res.redirect("/campus-groups")
  }
}

exports.ifValidStatus=function(req,res,next){
  if (req.params.status == "running" || req.params.status == "completed" ) {
    next()
  }else{
    req.flash("errors", "Campus group status is not matching!!")
    res.redirect(`/campus-groups/type/${req.params.status}`)
  }
}

exports.allGroupsInSameStatusPage=async function(req,res){
  try{
    let groups
    let allGroups=await CampusGroup.getCompletedAndRunningGroups(req.params.groupType) 
    if(req.params.status=="running"){
      groups=allGroups.runningGroups
    }else{
      groups=allGroups.completedGroups
    }
    let groupsData={
      groupType:req.params.groupType,
      status:req.params.status,
      groups:groups
    }
    res.render("campus-groups-same-type-same-status",{
      groupsData:groupsData
    })
  }catch{
    req.flash("errors", "There is some problem!!")
    res.redirect("/campus-groups")
  }
}


exports.checkIfUserExitGroupLimit=async function(req,res,next){
  try{
    let otherData=await StudentDataHandle.getStudentOtherDataByRegNumber(req.regNumber)
    if(otherData.campusGroupIds.length<=5){
      next()
    }else{
      req.flash("errors", "You can not involve on more then 5 campus groups!!")
      res.redirect("/campus-groups")
    }
  }catch{
    req.flash("errors", "There is some problem!!")
    res.redirect("/campus-groups")
  }
}

exports.createCampusGroup=function(req,res){
  let creatorData={
    regNumber:req.regNumber,
    userName:req.userName,
    departmentName:req.otherData.departmentName
  } 
  let campusGroup=new CampusGroup(req.body,creatorData)
  console.log("Data:",req.body)
  campusGroup.createNewCampusGroup().then((groupId)=>{
    console.log("group id :",groupId)
    req.flash("success", "New Campus Group successfully created!!")
    res.redirect(`/campus-group/${groupId}/details`)
  }).catch((e)=>{
    req.flash("errors", e)
    res.redirect("/create-campus-group-form")
  })
}

exports.ifCampusGroupExists=async function(req,res,next){
  try{
    let campusGroupDetails=await CampusGroup.getCampusGroupDetailsById(req.params.id)
    if(campusGroupDetails){
      req.campusGroupDetails=campusGroupDetails
      next()
    }else{
      res.render("404")
    }
  }catch{
    req.flash("errors", "There is some problem!!")
    res.redirect("/campus-groups")
  }
}

exports.campusGroupDetails=async function(req,res){
  let checkData={
    isUserLoggedIn:req.isUserLoggedIn,
    isCampusGroupAdmin:false,
    isCampusGroupMember:false,
    memberIndexNumber:null,
    isSentRequest:false,
    allAdmins:[]
  }
  if(checkData.isUserLoggedIn){
    req.campusGroupDetails.admins.forEach((admin)=>{
      if(req.regNumber==admin.regNumber){
        checkData.isCampusGroupAdmin=true
      }
      checkData.allAdmins.push(admin.regNumber)
    })
    req.campusGroupDetails.allMembers.forEach((member,index)=>{
      if(member.regNumber==req.regNumber){
        checkData.isCampusGroupMember=true
        checkData.memberIndexNumber=index
      }
    })
    req.campusGroupDetails.memberRequests.forEach((member)=>{
      if(member.regNumber==req.regNumber){
        checkData.isSentRequest=true
      }
    })
  }
  console.log("Group Details :",req.campusGroupDetails)
  res.render("campus-group-details-page",{
    checkData:checkData,
    campusGroupDetails:req.campusGroupDetails
  })

}

exports.ifGroupMemberFull= function(req,res,next){
    if(req.campusGroupDetails.expectedMembers>req.campusGroupDetails.allMembers.length){
      next()
    }else{
      req.flash("errors", "Members on this group is full!!")
      res.redirect(`/campus-group/${req.params.id}/details`)
    }
}

exports.checkIfUserAlreadyMemberOrSentRequest= function(req,res,next){
  let errMsg=null
  if(req.campusGroupDetails.memberRequests.length){
    req.campusGroupDetails.memberRequests.forEach((member)=>{
      if(member.regNumber==req.regNumber){
        errMsg="You have already sent request on this group!!"
      }
    })
  }
  req.campusGroupDetails.allMembers.forEach((member)=>{
    if(member.regNumber==req.regNumber){
      errMsg="You are already a member on this group!!"
    }
  })
  if(!errMsg){
    next()
  }else{
    req.flash("errors", errMsg)
    res.redirect(`/campus-group/${req.params.id}/details`)
  }
}

exports.sentMembershipRequest= function(req,res){
  let memberData={
    regNumber:req.regNumber,
    userName:req.userName,
    departmentName:req.otherData.departmentName,
    aim:req.body.aim,
    requestedDate:new Date()
  }
  let adminsRegNumbers=req.campusGroupDetails.admins.map((admin)=>{
    return admin.regNumber
  })
  CampusGroup.sentMembershipRequest(req.params.id,memberData,adminsRegNumbers).then(()=>{
    req.flash("success", "Your request has received successfully,wait for acceptance!!")
    res.redirect(`/campus-group/${req.params.id}/details`)
  }).catch((e)=>{
    req.flash("errors", e)
    res.redirect(`/campus-group/${req.params.id}/details`)
  })
}

exports.checkIfUserAdmin= function(req,res,next){
  let isAdmin=false
  req.campusGroupDetails.admins.forEach((admin)=>{
    if(admin.regNumber==req.regNumber){
      isAdmin=true
    }
  })
  if(isAdmin){
    next()
  }else{
    req.flash("errors", "Only admin can accept the request!!")
    res.redirect(`/campus-group/${req.params.id}/details`)
  }
}

exports.ifRequestSent= function(req,res,next){
  req.requestData={
    newMembershipRequestArray:[],
    newMemberData:null
  }
  req.campusGroupDetails.memberRequests.forEach((member)=>{
    if(member.regNumber==req.body.regNumber){
      req.requestData.newMemberData=member
    }else{
      req.requestData.newMembershipRequestArray.push(member)
    }
  })
  if(req.requestData.newMemberData){
    next()
  }else{
    req.flash("errors", "Members request has not found!!")
    res.redirect(`/campus-group/${req.params.id}/details`)
  }
}

exports.acceptMembershipRequest= function(req,res){
  let newMemberData={
    regNumber:req.requestData.newMemberData.regNumber,
    userName:req.requestData.newMemberData.userName,
    departmentName:req.requestData.newMemberData.departmentName,
    aim:req.requestData.newMemberData.aim,
    joiningDate:new Date(),
    addedBy:{
      regNumber:req.regNumber,
      userName:req.userName
    }
  }
  CampusGroup.acceptMembershipRequest(req.params.id,newMemberData,req.requestData.newMembershipRequestArray).then(()=>{
    req.flash("success", "New member successfully added on group!!")
    res.redirect(`/campus-group/${req.params.id}/details`)
  }).catch((e)=>{
    req.flash("errors", e)
    res.redirect(`/campus-group/${req.params.id}/details`)
  })
}


exports.rejectMembershipRequest= function(req,res){
  CampusGroup.rejectMembershipRequest(req.params.id,req.requestData.newMembershipRequestArray,req.requestData.newMemberData.regNumber).then(()=>{
    req.flash("success", "Membership request successfully rejected!!")
    res.redirect(`/campus-group/${req.params.id}/details`)
  }).catch((e)=>{
    req.flash("errors", e)
    res.redirect(`/campus-group/${req.params.id}/details`)
  })
}



exports.checkIfUserGroupCreator= function(req,res,next){
  
  if(req.campusGroupDetails.createdBy.regNumber==req.regNumber){
    next()
  }else{
    req.flash("errors", "Only group creator can add new admin!!")
    res.redirect(`/campus-group/${req.params.id}/details`)
  }
}

exports.checkIfAlreadyAdminOrMemberOrNot= function(req,res,next){
  let errMsg=null
  let isMember=false
    req.campusGroupDetails.admins.forEach((admin)=>{
      if(admin.regNumber==req.body.regNumber){
        errMsg="Member is already an admin of this group!!"
      }
    })
  
  req.campusGroupDetails.allMembers.forEach((member)=>{
    if(member.regNumber==req.body.regNumber){
      isMember=true
      req.newAdminData={
        regNumber:member.regNumber,
        userName:member.userName
      }
    }
  })
  if(!errMsg && isMember){
    next()
  }else{
    if(!isMember){
      errMsg="Requested account holder is not a member on this group!!"
    }
    req.flash("errors", errMsg)
    res.redirect(`/campus-group/${req.params.id}/details`)
  }
}

exports.addNewAdmin = function(req,res){
  CampusGroup.addNewAdmin(req.params.id,req.newAdminData).then(()=>{
    req.flash("success", "New admin successfully added!!")
    res.redirect(`/campus-group/${req.params.id}/details`)
  }).catch((e)=>{
    req.flash("errors", e)
    res.redirect(`/campus-group/${req.params.id}/details`)
  })
}

exports.checkIfCreatorMemberAndAdminOrNot= function(req,res,next){
  let isMember=false
  let isCreator=false
  req.newData={
    allMembers:[],
    admins:[],
    membersRegNumbers:[],//to notify other group members about user leaving
    leavingAccount:null
  }
  req.campusGroupDetails.allMembers.forEach((member)=>{
    if(member.regNumber==req.regNumber){
      isMember=true
      let data={
        regNumber:member.regNumber,
        userName:member.userName
      }
      req.newData.leavingAccount=data
    }else{
      req.newData.allMembers.push(member)
      req.newData.membersRegNumbers.push(member.regNumber)
    }
  })
  req.campusGroupDetails.admins.forEach((admin)=>{
    if(admin.regNumber!=req.regNumber){
      req.newData.admins.push(admin)
    }
  })
  if(req.campusGroupDetails.createdBy.regNumber==req.regNumber){
    isCreator=true
  }
  if(isMember && !isCreator){
    next()
  }else{
    errMsg="You are not a member on this campus group!!"
    if(isCreator){
      errMsg="As a group creator, you can't leave the group!!"
    }
    req.flash("errors", errMsg)
    res.redirect(`/campus-group/${req.params.id}/details`)
  }
}

exports.leaveCampusGroup = function(req,res){
  CampusGroup.leaveCampusGroup(req.params.id,req.newData).then(()=>{
    req.flash("success", "You have leaved the group successfully!!")
    res.redirect(`/campus-group/${req.params.id}/details`)
  }).catch((e)=>{
    req.flash("errors", e)
    res.redirect(`/campus-group/${req.params.id}/details`)
  })
}


exports.ifCampusGroupMember= function(req,res,next){
  req.memberIndex=null
  let isMember=false
  req.campusGroupDetails.allMembers.forEach((member,index)=>{
    if(member.regNumber==req.regNumber){
      req.memberIndex=index
      isMember=true
    }
  })
  if(isMember){
    next()
  }else{
    req.flash("errors", "You are not a member of this group!!")
    res.redirect(`/campus-group/${req.params.id}/details`)
  }
}

exports.setIndividualAim = function(req,res){
  CampusGroup.setIndividualAim(req.params.id,req.body.individualAim,req.memberIndex).then(()=>{
    req.flash("success", "Your aim as a group member set successfully!!")
    res.redirect(`/campus-group/${req.params.id}/details`)
  }).catch((e)=>{
    req.flash("errors", e)
    res.redirect(`/campus-group/${req.params.id}/details`)
  })
}

exports.setCampusGroupAim = function(req,res){
  let editorData={
    editBy:{
      userName:req.regNumber,
      userName:req.userName
    },
    editDate:new Date()
  }
  CampusGroup.setCampusGroupAim(req.params.id,req.body.groupAim,editorData).then(()=>{
    req.flash("success", "Group aim changed successfully!!")
    res.redirect(`/campus-group/${req.params.id}/details`)
  }).catch((e)=>{
    req.flash("errors", e)
    res.redirect(`/campus-group/${req.params.id}/details`)
  })
}


exports.checkIfGroupDeletable= function(req,res,next){
  
  if(req.campusGroupDetails.allMembers.length==1){
    next()
  }else{
    req.flash("errors", "All other members should leave the group before delete it!!")
    res.redirect(`/campus-group/${req.params.id}/details`)
  }
}

exports.deleteCampusGroup = function(req,res){
  CampusGroup.deleteCampusGroup(req.params.id,req.regNumber,req.campusGroupDetails.groupType).then(()=>{
    req.flash("success", "Group deleted successfully!!")
    res.redirect("/campus-groups")
  }).catch((e)=>{
    req.flash("errors", e)
    res.redirect(`/campus-group/${req.params.id}/details`)
  })
}


exports.checkNewExpectedMemberValue= function(req,res,next){
  req.givenValue=Number(req.body.expectedMembers)
  let errMsg=null
  if (req.givenValue >15) {
    errMsg="Number of members should be less then 15 on a group."
  }
  if(req.campusGroupDetails.allMembers.length>req.givenValue){
    errMsg="Total number of present members on group are more then your given value."
  }
  if(!errMsg){
    next()
  }else{
    req.flash("errors", errMsg)
    res.redirect(`/campus-group/${req.params.id}/details`)
  }
}

exports.updateMemberValue = function(req,res){
  CampusGroup.updateMemberValue(req.params.id,req.givenValue).then(()=>{
    req.flash("success", "Expected member value changed successfully!!")
    res.redirect(`/campus-group/${req.params.id}/details`)
  }).catch((e)=>{
    req.flash("errors", e)
    res.redirect(`/campus-group/${req.params.id}/details`)
  })
}