const Activity = require('../models/Activity')
const OfficialUsers=require('../models/OfficialUsers')

exports.postControllerHome =async function (req, res) {
  try{
    let activityIds=await OfficialUsers.getAllSubmittedActivityIdsFromPostController()
    console.log("Ids :",activityIds)
    let activities=await Activity.getAllActivityDetailsOfArrayIds(activityIds)
    activities=activities.map((activity)=>{
      return data={
        _id:activity._id,
        activitySourceId:activity.activitySourceId,
        sourceName:activity.sourceName,
        status:activity.status,
        submissionDate:activity.activityDates.submissionDate,
        postControllerNote:activity.postControllerNote
      }
    })
    res.render('postController-home',{
      submittedActivities:activities
    })
  }catch{
    res.render("404")
  }
}