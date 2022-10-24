const Activity = require('../models/Activity')
const OfficialUsers=require('../models/OfficialUsers')

exports.postControllerHome =async function (req, res) {
  try{
    let activityIds=await OfficialUsers.getAllSubmittedActivityIdsFromPostController()
    console.log("Ids :",activityIds)
    let activities=await Activity.getAllActivityDetailsOfArrayIdsFullData(activityIds)
    let allActivities={
      newSubmitted:[],
      received:[],
      editorAssigned:[],
      editingAccepted:[],
      edited:[]
    }
    console.log("All activities :",activities)
    activities.forEach((activity)=>{
      let activityData={
        _id:activity._id,
        activitySourceId:activity.activitySourceId,
        sourceName:activity.sourceName,
        status:activity.status,
        submissionDate:activity.activityDates.submissionDate,
        postControllerNote:activity.postControllerNote
      }
      if(activityData.status=="activitySubmitted"){
        allActivities.newSubmitted.push(activityData)
      }else if(activityData.status=="received"){
        allActivities.received.push(activityData)
      }else if(activityData.status=="editorAssigned"){
        activityData.editorData=activity.videoEditorDetails
        allActivities.editorAssigned.push(activityData)
      }else if(activityData.status=="editingAccepted"){
        activityData.editorData=activity.videoEditorDetails
        allActivities.editingAccepted.push(activityData)
      }else if(activityData.status=="edited"){
        activityData.editorData=activity.videoEditorDetails
        allActivities.edited.push(activityData)
      }
    })
    console.log("Activities:",allActivities)
    res.render('postController-home',{
      submittedActivities:allActivities
    })
  }catch{
    res.render("404")
  }
}