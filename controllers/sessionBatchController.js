const Department = require('../models/Department')
const Group=require('../models/Group')
const Activity=require('../models/Activity')
const SessionBatch=require('../models/SessionBatch')
const SourceNotifications = require('../models/SourceNotifications')

exports.createNewSessionBatch=async function(req,res){
  try{
    console.log("Form data:",req.body)
    //new sessionBatch has to create
    let sessionBatch= new SessionBatch(req.body)
    sessionBatch.createSessionBatch().then(async()=>{
      //add the session year on group's batch year array to know wheather for a particular year batch created or not
      let group=new Group(req.body)
      await group.addSessionYearAsBatchCreated()
      //update activeBatches year sequences in department table
      let dataSetToDept={
        departmentCode:req.body.departmentCode,
        newSession:sessionBatch.data.batchSessionYear,
        batchId:sessionBatch.data.batchId
      }
      await Department.updateActiveBatchesSequenceYear(dataSetToDept)
      req.flash("success", "New batch added successfully!!")
      req.session.save(function () {
        res.redirect("/admin-home")
      })
      
    }).catch((error)=>{
      req.flash("errors", error)
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
  }catch{
    res.render("404")
  }
  
}



exports.isSessionBatchExists = function (req, res, next) {
  SessionBatch.findSessionBatchDetailsByBatchId(req.params.batchId)
  .then((batchDetails)=> {
    req.batchDetails=batchDetails
    next()
  }).catch( ()=> {
    res.render("404")
  })
}



exports.getSessionBatchDetailsPage =async function (req, res) {
  try{
    // get sourceNotifications here
    let sourceNotifications=await SourceNotifications.getNotifications(req.batchDetails.batchId)
    let totalNotifications=sourceNotifications.length
    if(totalNotifications>5){
      sourceNotifications=sourceNotifications.slice(totalNotifications-5,totalNotifications)
    }
    sourceNotifications=sourceNotifications.reverse()
    //------------------------------
    let batchDetails=req.batchDetails
    let previousActivityData=null
    let checkData={
      isUserLoggedIn:req.isUserLoggedIn,
      isBatchMember:false,
      isBatchLeader:false,
      isPresentLeader:false,
      isPreviousLeader:false,
      isXstudent:req.session.user.otherData.isXstudent
    }
    
    if(checkData.isUserLoggedIn){
      batchDetails.allLeaders.forEach((leader)=>{
        if(leader.regNumber==req.regNumber){
          checkData.isBatchLeader=true
        }
      })

      if(req.regNumber.slice(0,9)==batchDetails.batchId){
        if(req.otherData.isVerified){
          checkData.isBatchMember=true
        }
      }

      if(batchDetails.presentLeader){
        if(batchDetails.presentLeader.regNumber==req.regNumber){
          checkData.isPresentLeader=true
        }
      }
      
      if(batchDetails.previousLeader){
        if(batchDetails.previousLeader.regNumber==req.regNumber){
          checkData.isPreviousLeader=true
        }
      }
    
    }
    if(batchDetails.previousActivity){
      let activityDetails=await Activity.getActivityDetailsById(batchDetails.previousActivity)
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
    console.log("Previous activity data:",previousActivityData)
    console.log("batch Details :",batchDetails)
    console.log("checkData: ",checkData)
    console.log("Source Notifications:",sourceNotifications)
    res.render('get-batch-details-page',{
      batchDetails:batchDetails,
      previousActivityData:previousActivityData,
      checkData:checkData,
      sourceNotifications:sourceNotifications
    })
  }catch{
    res.render('404')
  }
}
