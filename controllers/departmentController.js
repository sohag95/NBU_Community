const Activity = require('../models/Activity')
const department=require('../models/Department')
const SourceNotifications = require('../models/SourceNotifications')



exports.isDepartmentExists = function (req, res, next) {
  department.findDepartmentByDepartmentCode(req.params.departmentCode)
  .then((departmentDetails)=> {
    req.departmentDetails=departmentDetails
    next()
  }).catch( ()=> {
    res.render("404")
  })
}

exports.ifPresentDepartmentLeader = function (req, res, next) {
  if(req.regNumber==req.departmentDetails.presentLeader.regNumber || req.regNumber==req.departmentDetails.previousLeader.regNumber){
    next()
  }else{
    req.flash("errors", "Only present leaders can change department banner!!")
    req.session.save(function () {
      res.redirect(`/department/${req.params.departmentCode}/details`)
    })
  }
}

exports.getDepartmentDetailsPage =async function (req, res) {
  try{
    // get sourceNotifications here
    let sourceNotifications=await SourceNotifications.getNotifications(req.departmentDetails.departmentCode)
    let totalNotifications=sourceNotifications.length
    if(totalNotifications>5){
      sourceNotifications=sourceNotifications.slice(totalNotifications-5,totalNotifications)
      sourceNotifications=sourceNotifications.reverse()
    }
    
    //------------------------------
    let departmentDetails=req.departmentDetails
    let previousActivityData=null
    let checkData={
      isUserLoggedIn:req.isUserLoggedIn,
      isDepartmentMember:false,
      isDepartmentBatchMember:false,
      isDepartmentLeader:false,
      isPresentLeader:false,
      isPreviousLeader:false,
      isLeaderMoreThen30Days:false,
      isXstudent:null
    }

    if(checkData.isUserLoggedIn){
      
      checkData.isXstudent=req.session.user.otherData.isXstudent

      departmentDetails.allPresentLeaders.forEach((leader)=>{
        if(leader.regNumber==req.regNumber){
          checkData.isDepartmentLeader=true
        }
      })

      departmentDetails.allPresentMembers.forEach((member)=>{
        if(member.regNumber==req.regNumber){
          checkData.isDepartmentMember=true
        }
      })

      if(req.regNumber.slice(4,9)==departmentDetails.departmentCode){
        if(req.otherData.isVerified){
          //req.otherData.isBatchLeader=true/false have to store on req.otherData on session
          //department member are those who are already batch leaders.
          checkData.isDepartmentBatchMember=true
        }
      }

      if(departmentDetails.presentLeader){
        if(departmentDetails.presentLeader.regNumber==req.regNumber){
          checkData.isPresentLeader=true
          let createdDate=departmentDetails.presentLeader.createdDate
          let activeDate = new Date(createdDate);
          let numberOfDaysToAdd = 30;
          let result1 = activeDate.setDate(activeDate.getDate() + numberOfDaysToAdd);
          let lastDate=new Date(result1)
          if(lastDate<new Date()){
            checkData.isLeaderMoreThen30Days=true
          }
        }
      }
      
      if(departmentDetails.previousLeader){
        if(batchDetails.previousLeader.regNumber==req.regNumber){
          checkData.isPreviousLeader=true
        }
      }
    
    }
    if(departmentDetails.previousActivity){
      let activityDetails=await Activity.getActivityDetailsById(departmentDetails.previousActivity)
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

    console.log("Department Details :",departmentDetails)
    console.log("Check data :",checkData)
    res.render('get-department-details-page',{
      departmentDetails:departmentDetails,
      checkData:checkData,
      sourceNotifications:sourceNotifications,
      previousActivityData:previousActivityData
    })
  }catch{
    res.render('404')
  }
}

exports.getDepartmentPreviousDetailsPage = function (req, res) {
  try{
    let departmentDetails={
      departmentCode:req.departmentDetails.departmentCode,
      departmentName:req.departmentDetails.departmentName,
      activeBatches:req.departmentDetails.activeBatches,
      XBatches:req.departmentDetails.XBatches,
      allXLeaders:req.departmentDetails.allXLeaders,
      allXMembers:req.departmentDetails.allXMembers
    }
    console.log("Department data :",departmentDetails)
    res.render('department-previous-details-page',{
      departmentDetails:departmentDetails
    })
  }catch{
    res.render('404')
  }
}
 