const campusGroupCollection = require("../db").db().collection("Campus_groups")
const { ObjectId } = require("mongodb")
const AddCreditPoints = require("./AddCreditPoints")
const Notification = require("./Notification")
const OfficialUsers = require("./OfficialUsers")
const StudentDataHandle = require("./StudentDataHandle")

let CampusGroup=function(data,createdBy){
  this.data=data
  this.createdBy=createdBy
  this.errors=[]
}

CampusGroup.prototype.cleanUp=function(){
  if (typeof this.data.groupType != "string") {
    this.data.groupType=""
  }
  if (typeof this.data.groupName != "string") {
    this.data.groupName=""
  }
  if (typeof this.data.expectedMembers != "string") {
    this.data.expectedMembers=""
  }
  if (typeof this.data.aimOfGroup != "string") {
    this.data.aimOfGroup=""
  }
  let memberData={
    regNumber:this.createdBy.regNumber,
    userName:this.createdBy.userName,
    departmentName:this.createdBy.departmentName,
    aim:null,
    joiningDate:new Date(),
    addedBy:"creator"
    // addedBy:{
    //   regNumber:"",
    //   userName:""
    // }
  }
  let year=this.createdBy.regNumber.slice(2,4)
  let addOnYear=String(Number(year)+1)
  let fullYear="20"+addOnYear
  let expiredDate=new Date(fullYear+"-9-30")
 
  this.data={
    groupName:this.data.groupName,
    groupType:this.data.groupType,
    aimOfTheGroup:{
      aim:this.data.aimOfGroup,
      edited:null
      // {
      //   editBy:{
      //    regNumber:"",
      //    userName:""
      //   },
      //   editDate:new Date()
      // }
    },
    expectedMembers:Number(this.data.expectedMembers),
    createdBy:this.createdBy,
    admins:[{
      regNumber:this.createdBy.regNumber,
      userName:this.createdBy.userName
    }],
    allMembers:[memberData],
    memberRequests:[],
    isCompleted:false,
    expiringDate:expiredDate,
    createdDate:new Date(),
    membersFeedback:[]
  }
}

CampusGroup.prototype.validate=function(){
  if (this.data.groupType == "") {
    this.errors.push("You must select group type.")
  }
  if (this.data.groupName == "") {
    this.errors.push("You must give group name.")
  }
  if (this.data.expectedMembers == "") {
    this.errors.push("You must give the number of members on the group.")
  }
  if (this.data.aimOfTheGroup.aim == "") {
    this.errors.push("You must give aim of the group.")
  }
  if (this.data.expectedMembers >15) {
    this.errors.push("Number of members should be less then 15.")
  }
  if (!(this.data.groupType == "social_Work" || this.data.groupType == "caltural" || this.data.groupType == "business" || this.data.groupType == "skill_Development" || this.data.groupType == "research")) {
    this.errors.push("Group Types are not matched.")
  }
  //group name should be unique ,have to check bellow

}

CampusGroup.prototype.createNewCampusGroup=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      this.cleanUp()
      this.validate()
      console.log("Group data :",this.data)
      if(!this.errors.length){
        let createdGroup= await campusGroupCollection.insertOne(this.data)
        if(createdGroup.acknowledged){
          //add the id on respected places
          await OfficialUsers.addCampusGroupIdOnOfficialAllGroupsStorage(createdGroup.insertedId,this.data.groupType)
          await StudentDataHandle.addCampusGroupIdOnGroupMamberAccount(createdGroup.insertedId,this.createdBy.regNumber)
          await AddCreditPoints.addCreditPointToCampusGroupMember(this.createdBy.regNumber)
          resolve(createdGroup.insertedId)
        }else{
          reject("There is some problem!!")
        }
      }else{
        reject(this.errors)
      }
    }catch{
      reject("there is some problem!!")
    }
  })
}


CampusGroup.getCampusGroupDetailsById=function(id){
  return new Promise(async (resolve, reject) => { 
    try{
      let campusGroupData=await campusGroupCollection.findOne({_id:new ObjectId(id)})
      resolve(campusGroupData)
    }catch{
      reject()
    }
  })
}


CampusGroup.getCompletedAndRunningGroups=function(groupType){
  return new Promise(async (resolve, reject) => { 
    try{
      let runningGroups=[]
      let completedGroups=[]
      let sameTypeGroupIds=await OfficialUsers.getSameTypeCampusGroupIds(groupType)
      if(sameTypeGroupIds.allGroups.length){
        let allGroupDetails=await CampusGroup.getCampusGroupDetailsByIds(sameTypeGroupIds.allGroups)
        allGroupDetails.forEach((group)=>{
          if(sameTypeGroupIds.completedGroups.includes(group._id)){
            completedGroups.push(group)
          }else{
            runningGroups.push(group)
          }
        })
        
      }
      let groups={
        runningGroups:runningGroups,
        completedGroups:completedGroups
      }
      resolve(groups)
    }catch{
      reject()
    }
  })
}


CampusGroup.getCampusGroupDetailsByIds=function(ids){
  return new Promise(async (resolve, reject) => { 
    try{
      let allGroups=await campusGroupCollection.find({_id:{$in:ids}}).toArray()
      allGroups=allGroups.map((group)=>{
        let data={
          _id:group._id,
          groupName:group.groupName,
          expectedMembers:group.expectedMembers,
          presentMembers:group.allMembers.length,
          createdDate:group.createdDate,
          expiringDate:group.expiringDate
        }
        return data
      })
      resolve(allGroups)
    }catch{
      reject()
    }
  })
}

CampusGroup.sentMembershipRequest=function(groupId,memberData,adminsRegNumbers){
  return new Promise(async (resolve, reject) => { 
    try{
      await campusGroupCollection.findOneAndUpdate({_id:new ObjectId(groupId)},{
        $push:{
          membersRequest:memberData
        }
      })
      await Notification.campusGroupRequestComeToAdmins(adminsRegNumbers,groupId)
      resolve()
    }catch{
      reject("There is some problem!!")
    }
  })
}


CampusGroup.acceptMembershipRequest=function(groupId,newMemberData,newMembershipRequestArray){
  return new Promise(async (resolve, reject) => { 
    try{
      await campusGroupCollection.findOneAndUpdate({_id:new ObjectId(groupId)},{
        $push:{
          allMembers:newMemberData
        },
        $set:{
          membersRequest:newMembershipRequestArray
        }
      })
      //add the group id on members account
      await StudentDataHandle.addCampusGroupIdOnGroupMamberAccount(new ObjectId(groupId),newMemberData.regNumber)
      //add credit point to members account
      await AddCreditPoints.addCreditPointToCampusGroupMember(newMemberData.regNumber)
      //sent notification as member added on new group
      await Notification.acceptedCampusGroupRequest(newMemberData.regNumber,groupId)
      
      resolve()
    }catch{
      reject("There is some problem!!")
    }
  })
}


CampusGroup.rejectMembershipRequest=function(groupId,newMembershipRequestArray,rejectedRegNumber){
  return new Promise(async (resolve, reject) => { 
    try{
      await campusGroupCollection.findOneAndUpdate({_id:new ObjectId(groupId)},{
        $set:{
          membersRequest:newMembershipRequestArray
        }
      })
      //sent notification as member added on new group
      await Notification.rejectedCampusGroupRequest(rejectedRegNumber,groupId)
      resolve()
    }catch{
      reject("There is some problem!!")
    }
  })
}

CampusGroup.addNewAdmin=function(groupId,newAdminData){
  return new Promise(async (resolve, reject) => { 
    try{
      await campusGroupCollection.findOneAndUpdate({_id:new ObjectId(groupId)},{
        $push:{
          admins:newAdminData
        }
      })
      //sent notification as member added on new group
      await Notification.newCampusGroupAdmin(newAdminData.regNumber,groupId)
      resolve()
    }catch{
      reject("There is some problem!!")
    }
  })
}

CampusGroup.leaveCampusGroup=function(groupId,newData){
  return new Promise(async (resolve, reject) => { 
    try{
      await campusGroupCollection.findOneAndUpdate({_id:new ObjectId(groupId)},{
        $set:{
          admins:newData.admins,
          allMembers:newData.allMembers
        }
      })
      //Remove group id from leaving account holder data
      await StudentDataHandle.removeCampusGroupIdFromGroupMamberAccount(new ObjectId(groupId),newData.leavingAccount.regNumber)
       //deduct credit point from leaving account
      await AddCreditPoints.deductCreditPointFromGroupLeavingAccount(newData.leavingAccount.regNumber,groupId,"member")
      //sent notification as member added on new group
      await Notification.leaveMessageToAllOtherMembers(newData.membersRegNumbers,groupId,newData.leavingAccount)
      resolve()
    }catch{
      reject("There is some problem!!")
    }
  })
}


CampusGroup.setIndividualAim=function(groupId,givenAim,memberIndex){
  return new Promise(async (resolve, reject) => { 
    try{
      if(typeof givenAim != "string"){
        givenAim=null
      }
      if(givenAim){
        let field="allMembers."+String(memberIndex)+".aim"
        await campusGroupCollection.findOneAndUpdate({_id:new ObjectId(groupId)},{
          $set:{
            [field]:givenAim
          }
        })
        resolve()
      }else{
        reject("Write something on your individual aim as a group member!!")
      }
    }catch{
      reject("There is some problem!!")
    }
  })
}



CampusGroup.setCampusGroupAim=function(groupId,groupAim,editorData){
  return new Promise(async (resolve, reject) => { 
    try{
      if(typeof groupAim != "string"){
        groupAim=null
      }
      if(groupAim){
        let aimData={
          aim:groupAim,
          edited:editorData
        }
        await campusGroupCollection.findOneAndUpdate({_id:new ObjectId(groupId)},{
          $set:{
            "aimOfTheGroup":aimData,
          }
        })
        resolve()
      }else{
        reject("Write something on group aim to change the aim!!")
      }
    }catch{
      reject("There is some problem!!")
    }
  })
}


CampusGroup.deleteCampusGroup=function(groupId,creatorRegNumber){
  return new Promise(async (resolve, reject) => { 
    try{
      await campusGroupCollection.deleteOne({_id:new ObjectId(groupId)})
      //Remove group id from leaving account holder data
      await StudentDataHandle.removeCampusGroupIdFromGroupMamberAccount(new ObjectId(groupId),creatorRegNumber)
       //deduct credit point from leaving account
      await AddCreditPoints.deductCreditPointFromGroupLeavingAccount(creatorRegNumber,groupId,"creator")
      resolve()
    }catch{
      reject("There is some problem!!")
    }
  })
}


CampusGroup.updateMemberValue=function(groupId,newValue){
  return new Promise(async (resolve, reject) => { 
    try{
      
        await campusGroupCollection.findOneAndUpdate({_id:new ObjectId(groupId)},{
          $set:{
            "expectedMembers":newValue,
          }
        })
        resolve()
      
    }catch{
      reject("There is some problem!!")
    }
  })
}
module.exports=CampusGroup