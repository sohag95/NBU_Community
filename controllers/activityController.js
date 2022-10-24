const Activity = require("../models/Activity")
const Department = require("../models/Department")
const Group = require("../models/Group")
const OfficialUsers = require("../models/OfficialUsers")
const OtherOperations = require("../models/OtherOperations")
const SessionBatch = require("../models/SessionBatch")
const TopicVoting = require("../models/TopicVoting")

exports.ifStudentPresentLeader=async function(req,res,next){
  try{
    let from=req.params.from.toLowerCase()
    let sourceId=req.params.sourceId.toUpperCase()
    let isIdPresent=false
    let isCreatorLeader=false
     req.detailsData=null
    if (from == "batch") {
      let batchId=sourceId
      let batchDetails=await SessionBatch.findSessionBatchDetailsByBatchId(batchId)
      if(batchDetails){
        if(batchDetails.presentLeader.regNumber==req.regNumber || batchDetails.previousLeader.regNumber==req.regNumber){
          isIdPresent=true
          isCreatorLeader=true
          req.detailsData=batchDetails
        }
      }
    }else if(from=="department"){
      let departmentCode=sourceId
      let departmetnDetails=await Department.findDepartmentByDepartmentCode(departmentCode)
      if(departmetnDetails){
        if(departmetnDetails.presentLeader.regNumber==req.regNumber || departmetnDetails.previousLeader.regNumber==req.regNumber){
          isIdPresent=true
          isCreatorLeader=true
          req.detailsData=departmetnDetails
        }
      }
    }else if(from=="group"){
      let groupId=sourceId
      let groupDetails=await Group.findGroupByGroupId(groupId)
      if(groupDetails){
        if(groupDetails.presentLeader.regNumber==req.regNumber || groupDetails.previousLeader.regNumber==req.regNumber){
          isIdPresent=true
          isCreatorLeader=true
          req.detailsData=groupDetails
        }
      }
    } else {
      req.flash("errors", "Data manipulation ditected!!")
      req.session.save(()=>res.redirect("/"))
    }
    if(isIdPresent && isCreatorLeader){
      //if present activity is present on source then no activity can be creted
      // if(groupDetails.presentActivities){
      //   req.flash("errors", "You can't create new activity untill finished present activity.")
      //   req.session.save(()=>res.render(`/${req.params.from}/${req.params.id}/details`))
      // }else{
      //   next()
      // }
      next()
    }else{
      req.flash("errors", "You don't have permission to perform that action.")
      req.session.save(()=>res.render("404"))
    }
  }catch{
    res.render("404")
  }
}

exports.getActivityCreationPage=async function(req,res){
  try{
    //topics will be changed with the res.params.form value
    let allTopics=await OfficialUsers.getAllActivityTopics()
    let topics
    if(req.params.from=="batch"){
      topics=allTopics.batchTopics
    }else if(req.params.from=="department"){
      topics=allTopics.departmentTopics
    }else{
      topics=allTopics.groupTopics
    }
    console.log("topics:",topics)
    let activityData={
      from:req.params.from,
      sourceId:req.params.sourceId,
      topics:topics
    }
    
    res.render("activity-creation-form",{
      activityData:activityData
    })
  }catch{
    res.render("404")
  }
}

exports.getExtraDataToCreateActivity=function(req,res,next){
  req.creatorData={
    regNumber:req.regNumber,
    userName:req.userName
  }
  let assistantLead
  if(req.detailsData.previousLeader){
    assistantLead={
      regNumber:req.detailsData.previousLeader.regNumber,
      userName:req.detailsData.previousLeader.userName,
    }
  }else{
    assistantLead=null
  }
  let sourceName=null
  if(req.params.from=="batch" || req.params.from=="department"){
    sourceName=req.detailsData.departmentName
  }else{
    sourceName=req.detailsData.groupName
  }
  req.neededData={
    from:req.params.from,
    sourceId:req.params.sourceId,
    sourceName:sourceName,
    leaders:{
      mainLead:{
        regNumber:req.detailsData.presentLeader.regNumber,
        userName:req.detailsData.presentLeader.userName,
      },
      assistantLead:assistantLead
    }
  }
  next()
}

exports.createNewActivity=function(req,res){
  let activity=new Activity(req.body,req.creatorData,req.neededData)
  // console.log("body data :",req.body)
  // console.log("Creator data:",req.creatorData)
  // console.log("Needed data :",req.neededData)
  
  //free the space
  req.detailsData=undefined
  req.needeData=undefined
  //##############
  activity.createNewActivity().then((activityId)=>{
    console.log("ActivityId is:",activityId)
    req.flash("success", "Activity successfully created!!")
    res.redirect(`/activity/${activityId}/details`)
  }).catch((e)=>{
    req.flash("errors", e)
    res.redirect(`/activity/${req.params.from}/${req.params.sourceId}/create`)
  })
}

exports.ifActivityPresent=async function(req,res,next){
  try{
    let activityDetails=await Activity.getActivityDetailsById(req.params.id)
    if(activityDetails){
      req.activityDetails=activityDetails
      req.votingDetails=null
      if(req.activityDetails.isTopicByVote && !req.activityDetails.isVoteCompleted){
        req.votingDetails=await TopicVoting.getVotingDetailsById(req.activityDetails.votingId)
      }
      next()
    }else{
      res.render("404")
    }
  }catch{
    req.flash("errors", "There is some problem")
    req.session.save( ()=> {
      res.redirect("/")
    })
  }
}

exports.ifStudentActivityLeader=function(req,res,next){
  if(req.activityDetails.leaders.mainLead.regNumber==req.regNumber ||req.activityDetails.leaders.assistantLead.regNumber==req.regNumber ){
     console.log("passed!!")
     next()
   }else{
     req.flash("errors", "Only activity leader can delete an activity!")
     req.session.save( ()=> {
       res.redirect("/")
     })
   }
}

exports.ifActivityDeleteable=function(req,res,next){
  if(req.activityDetails.status=="created" || req.activityDetails.status=="voted"){
     console.log("passed2!!")
     next()
   }else{
     req.flash("errors", "Activity can't be deleted as activity is already received!")
     req.session.save( ()=> {
       res.redirect("/")
     })
   }
}

exports.deleteActivity=function(req,res){
  let activityData={
    _id:req.activityDetails._id,
    sourceId:req.activityDetails.activitySourceId,
    source:req.activityDetails.activityType,
    votingId:req.activityDetails.votingId
  }
  Activity.deleteActivity(activityData).then(()=>{
    req.flash("success", "Activity successfully deleted!!")
    if(activityData.source=="batch"){
      res.redirect(`/batch/${activityData.sourceId}/details`)
    }else if(activityData.source=="department"){
      res.redirect(`/department/${activityData.sourceId}/details`)
    }else{
      res.redirect(`/group/${activityData.sourceId}/details`)
    }
  }).catch(()=>{
    req.flash("errors", "There is some problem!")
    res.redirect(`/activity/${activityData._id}/details`)
  })
}

exports.getActivityDetailsPage=function(req,res){
  let activityDetails=req.activityDetails
  let votingDetails
  let checkData={
    isUserLoggedIn:req.isUserLoggedIn,
    isActivityLeader:false,
    isActivityMember:false,
    isPostController:false,
    isXstudent:req.session.user.otherData.isXstudent
  }
  votingDetails=req.votingDetails
  //freeing space
  if(req.votingDetails){
    req.votingDetails=undefined
  }
  req.activityDetails=undefined
  //leader check
  if(checkData.isUserLoggedIn){
    if(activityDetails.leaders.mainLead.regNumber==req.regNumber){
      checkData.isActivityLeader=true
    }
    if(activityDetails.leaders.assistantLead){
      if(activityDetails.leaders.assistantLead.regNumber==req.regNumber){
        checkData.isActivityLeader=true
      }
    }
    //post controller check
    if(activityDetails.postControllerDetails.regNumber==req.regNumber){
      checkData.isPostController=true
    }
    //activity member or not checking
    let activityMember=OtherOperations.isSourceMemberOrVoter(activityDetails.activityType,activityDetails.activitySourceId,req.regNumber)
    if(activityMember){
      checkData.isActivityMember=true
    }
  }
  // let today=new Date()
  // let lastDate=votingDetails.votingDates.votingLastDate
  // console.log("today:",today)
  // console.log("LastDate:",lastDate)
  // if(today<lastDate){
  //   console.log("You can vote.")
  // }else{
  //   console.log("You can't vote.")
  // }
  console.log("ActivityDetails:",activityDetails)
  console.log("checkData:",checkData)
  // console.log("Voting Details:",votingDetails)
  res.render("activity-details-page",{
    checkData:checkData,
    activityDetails:activityDetails,
    votingDetails:votingDetails
  })
}


exports.editActivityDetails=async function(req,res){
  try{
    let editData={
      topic:req.body.topic,
      title:req.body.title,
      shortDetails:req.body.shortDetails,
      activityDate:req.body.activityDate
    }
    if(req.activityDetails.isTopicByVote && req.activityDetails.topic){
      editData.topic=req.activityDetails.topic
    }
    let editor={
      regNumber:req.regNumber,
      userName:req.userName
    }
    let neededData={
      source:req.activityDetails.activityType,
      sourceId:req.activityDetails.activitySourceId,
    }
    let activity=new Activity(editData,editor,neededData)
    activity.editActivityDetails(req.params.id).then(()=>{
      req.activityDetails=undefined
      req.flash("success", "Activity details successfully updated!!")
      res.redirect(`/activity/${req.params.id}/details`)
    }).catch((e)=>{
      req.flash("errors", e)
      res.redirect(`/activity/${req.params.id}/details`)
    })
  }catch{
    req.flash("errors", "There is some problem.")
    res.redirect(`/activity/${req.params.id}/details`)
  }
}

exports.getAllParticipantPage=function(req,res){
  let activityData={
    _id:req.activityDetails._id,
    from:req.activityDetails.activityType,
    sourceId:req.activityDetails.activitySourceId,
    topic:req.activityDetails.topic,
    sourceName:req.activityDetails.sourceName
  }
  Activity.getAllActivityMember(activityData).then((allMembers)=>{
    console.log("All members:",allMembers)
    req.activityDetails=undefined
    res.render("all-participants-page",{
      activityData:activityData,
      allMembers:allMembers
    })
  }).catch(()=>{
    req.flash("errors", "There is some problem.")
    res.render("404")
  })
}

exports.activitySubmitted=function(req,res){
  let submittedBy={
    regNumber:req.regNumber,
    userName:req.userName
  }
  let neededData={
    sourceId:req.activityDetails.activitySourceId,
    source:req.activityDetails.activityType
  }
  let activityParticipants=JSON.parse(req.body.selectedParticipants)
  console.log("Participants :",activityParticipants)
  Activity.submitActivityByLeader(req.params.id,activityParticipants,submittedBy,neededData).then(()=>{
    req.activityDetails=undefined
    req.flash("success", "Activity state successfully updated!!")
    res.redirect(`/activity/${req.params.id}/details`)
  }).catch((e)=>{
    req.flash("errors", e)
    res.redirect(`/activity/${req.params.id}/details`)
 })
}

exports.activityReceivedByPostController=function(req,res){
  let note=req.body.postControllerNote
  if(!note){
    note="Did not put any note here."
  }
  let neededData={
    sourceId:req.activityDetails.activitySourceId,
    source:req.activityDetails.activityType
  }
 Activity.receiveActivityByPostController(req.params.id,note,neededData).then(()=>{
  req.activityDetails=undefined
  req.flash("success", "Activity successfully received!!")
  res.redirect(`/activity/${req.params.id}/details`)
 }).catch((e)=>{
  req.flash("errors", e)
  res.redirect(`/activity/${req.params.id}/details`)
 })
}

exports.assignVideoEditor=function(req,res){
  let neededData={
    sourceId:req.activityDetails.activitySourceId,
    source:req.activityDetails.activityType
  }
 Activity.assignVideoEditor(req.body,req.activityDetails._id,neededData).then(()=>{
  req.activityDetails=undefined
  req.flash("success", "Video editor assigned successfully!!")
  res.redirect(`/activity/${req.params.id}/details`)
 }).catch((e)=>{
  req.flash("errors", e)
  res.redirect(`/activity/${req.params.id}/details`)
 })
}

exports.acceptVideoEditingByEditor=function(req,res){
  let note=req.body.videoEditorNote
  if(!note){
    note="Did not put any note here."
  }
 Activity.acceptVideoEditingByEditor(req.params.id,note).then(()=>{
  req.activityDetails=undefined
  req.flash("success", "Video editing work successfully received!!")
  res.redirect(`/activity/${req.params.id}/details`)
 }).catch((e)=>{
  req.flash("errors", e)
  res.redirect(`/activity/${req.params.id}/details`)
 })
}

exports.videoEditingCompletedByEditor=function(req,res){
  let neededData={
    sourceId:req.activityDetails.activitySourceId,
    source:req.activityDetails.activityType
  } 
 Activity.videoEditingCompletedByEditor(req.activityDetails._id,neededData).then(()=>{
  req.activityDetails=undefined
  req.flash("success", "Video editing work successfully received!!")
  res.redirect(`/activity/${req.params.id}/details`)
 }).catch((e)=>{
  req.flash("errors", e)
  res.redirect(`/activity/${req.params.id}/details`)
 })
}

//this function will be changed completely.Cover photo will be uploaded on AWS bucket later->added
// exports.uploadVideoCoverPhoto=function(req,res){
//   if(req.body.videoCoverPhoto){
//     let link="/images/sponsor-mid-banner.png"
//     Activity.uploadVideoCoverPhoto(req.activityDetails._id,link).then(()=>{
//       req.activityDetails=undefined
//       req.flash("success", "Video cover photo successfully updated!!")
//       res.redirect(`/activity/${req.params.id}/details`)
//     }).catch((e)=>{
//       req.flash("errors", e)
//       res.redirect(`/activity/${req.params.id}/details`)
//     })
//   }else{
//     req.flash("errors", "You should give a photo link.")
//     res.redirect(`/activity/${req.params.id}/details`)
//   }
// }

exports.publishActivity=function(req,res){
  let activity=new Activity(req.body)
  let activityData={
    _id:req.activityDetails._id,
    topic:req.activityDetails.topic,
    title:req.activityDetails.title,
    activityDate:req.activityDetails.activityDates.activityDate,
    publishedDate:new Date()
  }
  let sourceData={
    from:req.activityDetails.activityType,
    sourceId:req.activityDetails.activitySourceId,
    sourceName:req.activityDetails.sourceName,
    leaders:req.activityDetails.leaders
  }
  //to sent notification to video editor
  let editorRegNumber=req.activityDetails.videoEditorDetails.regNumber
  activity.publishActivity(activityData,sourceData,editorRegNumber).then(()=>{
    req.activityDetails=undefined
    req.flash("success", "Video editing work successfully received!!")
    res.redirect(`/activity/${req.params.id}/details`)
  }).catch((e)=>{
    req.flash("errors", e)
    res.redirect(`/activity/${req.params.id}/details`)
  })
}

exports.likeActivity=function(req,res){
  if(!req.activityLiked){
    let neededData={
      sourceId:req.activityDetails.activitySourceId,
      source:req.activityDetails.activityType
    } 
    Activity.likeActivity(req.activityDetails._id,req.regNumber,neededData).then(()=>{
      req.activityDetails=undefined
      req.flash("success", "Activity liked!!")
      res.redirect(`/activity/${req.params.id}/details`)
    }).catch((e)=>{
      req.flash("errors", e)
      res.redirect(`/activity/${req.params.id}/details`)
    })
  }else{
    req.flash("errors", "You have already liked the activity.")
    res.redirect(`/activity/${req.params.id}/details`)
  }
}

exports.dislikeActivity=function(req,res){
  if(req.activityLiked){
    let neededData={
      sourceId:req.activityDetails.activitySourceId,
      source:req.activityDetails.activityType
    } 
    Activity.dislikeActivity(req.activityDetails._id,req.regNumber,neededData).then(()=>{
      req.activityDetails=undefined
      req.flash("success", "Activity disliked!!")
      res.redirect(`/activity/${req.params.id}/details`)
    }).catch((e)=>{
      req.flash("errors", e)
      res.redirect(`/activity/${req.params.id}/details`)
    })
  }else{
    req.flash("errors", "You have not liked the activity yet.")
    res.redirect(`/activity/${req.params.id}/details`)
  }
}


exports.commentOnActivity=function(req,res){
    let commentDetails={
      regNumber:req.regNumber,
      userName:req.userName,
      comment:req.body.comment,
      createdDate:new Date()
    }
    let neededData={
      sourceId:req.activityDetails.activitySourceId,
      source:req.activityDetails.activityType
    } 
    Activity.commentOnActivity(req.activityDetails._id,commentDetails,neededData).then(()=>{
      req.activityDetails=undefined
      req.flash("success", "Comment added successfully!!")
      res.redirect(`/activity/${req.params.id}/details`)
    }).catch((e)=>{
      req.flash("errors", e)
      res.redirect(`/activity/${req.params.id}/details`)
    })
}


exports.getAllActivitiesPage=async function(req,res){
  try{
    let allActivities=[]
    let activities=await OfficialUsers.getAllActivityIds()
    if(activities.allActivities.length){
      allActivities=await Activity.getAllActivityDetailsOfArrayIds(activities.allActivities)
    }
    console.log("All activities :",allActivities)
    res.render("all-activities-page",{
      allActivities:allActivities
    })
  }catch{
    res.render("404")
  }
}

exports.getTopActivitiesPage=async function(req,res){
  try{
    let topActivities=[]
    let activities=await OfficialUsers.getAllActivityIds()
    if(activities.topActivities.length){
      topActivities=await Activity.getAllActivityDetailsOfArrayIds(activities.topActivities)
    }
    console.log("Top activities :",topActivities)
    res.render("top-activities-page",{
      topActivities:topActivities
    })
  }catch{
    res.render("404")
  }
}

exports.getTodaysActivitiesPage=async function(req,res){
  try{
    let activities={
      todaysActivity:[],
      upcommingActivity:[]
    }
    let upcommingActivities=await Activity.getUpcommingActivities()
    if(upcommingActivities.length){
      let today=new Date()
      today.setHours(0,0,0,0)
      var tomorrow = today
      tomorrow.setDate(tomorrow.getDate() + 1);
      upcommingActivities.forEach((activity)=>{
        if(activity.activityDate>today && activity.activityDate<tomorrow){
          activities.todaysActivity.push(activity)
        }else{
          activities.upcommingActivity.push(activity)
        }
      })
    }
    console.log("Upcomming activities :",activities)
    
    res.render("todays-activities-page",{
      activities:activities
    })
  }catch{
    res.render("404")
  }
}

exports.getSourceAllActivities=async function(req,res){
  try{
    let sourceData={
        from:req.sourceData.from,
        sourceId:req.sourceData.sourceId,
        sourceName:req.sourceData.sourceName,
        allActivities:[]
    }
    if(req.sourceData.completedActivities.length){
      sourceData.allActivities=await Activity.getAllActivityDetailsOfArrayIds(req.sourceData.completedActivities)
    }
    console.log("all activities :",sourceData)
    res.render("source-all-activities-page",{
      sourceData:sourceData
    })
  }catch{
    res.render("404")
  }
}