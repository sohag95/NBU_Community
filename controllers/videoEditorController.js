const OfficialUsers=require('../models/OfficialUsers')
const Activity=require('../models/Activity')

exports.videoEditorHome =async function (req, res) {
  try{
    let assignedIds=await OfficialUsers.getAllAssignedActivityIdsOfEditor()
    console.log("Ids :",assignedIds)
    let activities=await Activity.getAllActivityDetailsOfArrayIds(assignedIds)
    let allActivities={
      newAssigned:[],
      accepted:[],
      edited:[]
    }
    activities.forEach((activity)=>{
      let activityData={
        _id:activity._id,
        activitySourceId:activity.activitySourceId,
        sourceName:activity.sourceName,
        status:activity.status,
        assignedDate:activity.activityDates.editorAssignedDate,
        videoEditorNote:activity.videoEditorNote
      }
      if(activityData.status=="editorAssigned"){
        allActivities.newAssigned.push(activityData)
      }else if(activityData.status=="editingAccepted"){
        allActivities.accepted.push(activityData)
      }else if(activityData.status=="edited"){
        allActivities.edited.push(activityData)
      }
    })
    console.log("ActivityData:",allActivities)
    res.render('videoEditor-home',{
      assignedActivities:allActivities
    })
  }catch{
    res.render("404")
  }
}

exports.getAvailableVideoEditors =async function (req, res) {
  try{
    //video editors are students those are interested,but now videoeditor is set as official user one
    //so later this portion might be changed

    let editorData= await OfficialUsers.getVideoEditorData() 
    let activityDetails={
        _id:req.activityDetails._id,
        activitySourceId:req.activityDetails.activitySourceId,
        sourceName:req.activityDetails.sourceName,
        status:req.activityDetails.status,
        submissionDate:req.activityDetails.activityDates.submissionDate,
        
      }
      req.activityDetails=undefined
      console.log("Editor data:",editorData)
      console.log("Activity data:",activityDetails)
    res.render('get-video-editor',{
      editorData:editorData,
      activityDetails:activityDetails
    })
    //here i have to pass an array of available video editors
  }catch{
    res.render("404")
  }
}


