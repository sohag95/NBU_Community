const Activity = require('../models/Activity')
const group=require('../models/Group')
const SourceNotifications = require('../models/SourceNotifications')


exports.isGroupExists = function (req, res, next) {
  group.findGroupByGroupId(req.params.groupId)
  .then((groupDetails)=> {
    req.groupDetails=groupDetails
    next()
  }).catch( ()=> {
    res.render("404")
  })
}

exports.ifPresentGroupLeader = function (req, res, next) {
  if(req.regNumber==req.groupDetails.presentLeader.regNumber || req.regNumber==req.groupDetails.previousLeader.regNumber){
    next()
  }else{
    req.flash("errors", "Only present leaders can change group banner!!")
    req.session.save(function () {
      res.redirect(`/group/${req.params.groupId}/details`)
    })
  }
}

exports.getGroupDetailsPage =async function (req, res) {
  try{

     // get sourceNotifications here
     let sourceNotifications=await SourceNotifications.getNotifications(req.groupDetails.groupId)
     let totalNotifications=sourceNotifications.length
     if(totalNotifications>5){
       sourceNotifications=sourceNotifications.slice(totalNotifications-5,totalNotifications)
       sourceNotifications=sourceNotifications.reverse()
     }
     
     //------------------------------
    let groupDetails=req.groupDetails
    let previousActivityData=null
    let checkData={
      isUserLoggedIn:req.isUserLoggedIn,
      isGroupMember:false,
      isGroupDepartmentMember:false,
      isGroupLeader:false,
      isPresentLeader:false,
      isPreviousLeader:false,
      isXstudent:false
    }

    if(checkData.isUserLoggedIn){
      isXstudent=req.session.user.otherData.isXstudent
      groupDetails.allLeaders.forEach((leader)=>{
        if(leader.regNumber==req.regNumber){
          checkData.isGroupLeader=true
        }
      })

      groupDetails.allPresentMembers.forEach((member)=>{
        if(member.regNumber==req.regNumber){
          checkData.isGroupMember=true
        }
      })

      groupDetails.presentDepartments.forEach((department)=>{
        if(department.departmentCode==req.regNumber.slice(4,9)){
          checkData.isGroupDepartmentMember=true
        }
      })

      if(groupDetails.presentLeader){
        if(groupDetails.presentLeader.regNumber==req.regNumber){
          checkData.isPresentLeader=true
        }
      }
      
      if(groupDetails.previousLeader){
        if(batchDetails.previousLeader.regNumber==req.regNumber){
          checkData.isPreviousLeader=true
        }
      }
    
    }
    if(groupDetails.previousActivity){
      let activityDetails=await Activity.getActivityDetailsById(groupDetails.previousActivity)
      previousActivityData={
        _id:activityDetails._id,
        activityType:activityDetails.activityType,
        sourceName:activityDetails.sourceName,
        activitySourceId:activityDetails.activitySourceId,
        topic:activityDetails.topic,
        title:activityDetails.title,
        videoCoverPhoto:activityDetails.videoCoverPhoto,
        likes:activityDetails.likes.length,
        comments:activityDetails.comments.length,
        activityDate:activityDetails.activityDates.activityDate,
        publishedDate:activityDetails.activityDates.publishedDate,
      }
    }

    console.log("group details :",groupDetails)
    console.log("checkData:",checkData)
    res.render('get-group-details-page',{
      groupDetails:groupDetails,
      checkData:checkData,
      sourceNotifications:sourceNotifications,
      previousActivityData:previousActivityData
    })
  }catch{
    res.render('404')
  }
}

exports.getGroupPreviousDetailsPage = function (req, res) {
  try{
    res.render('group-previous-details-page')
  }catch{
    res.render('404')
  }
}