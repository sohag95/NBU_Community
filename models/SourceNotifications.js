const sourceNotificationCollection = require("../db").db().collection("Source_Notification")


let SourceNotifications=function(data){
  this.data=data
}
SourceNotifications.createSourceNotificationTable=function(sourceId){
  return new Promise(async (resolve, reject) => {
    try{
      let fieldData={
        sourceId:sourceId,
        notifications:[]
      }
      await sourceNotificationCollection.insertOne(fieldData)
      resolve()
    }catch{
      console.log("Error on - createSourceNotificationTable")
      reject()
    }
  })
}

SourceNotifications.getNotifications= function(sourceId){
  return new Promise(async (resolve, reject) => {
    try{
      let notificationData=await sourceNotificationCollection.findOne({sourceId:sourceId})
      resolve(notificationData.notifications)
    }catch{
      console.log("Error on - getNotifications")
      reject()
    }
  })
}

//---notification sending section starts----


SourceNotifications.sentNotificationToSourceId= function(sourceId,notification){
  return new Promise(async (resolve, reject) => {
    try{
      await sourceNotificationCollection.updateOne(
        {sourceId:sourceId},
        {
          $push:{
            notifications:notification
        }})
      resolve()
    }catch{
      console.log("Error on - notificationToGroup")
      reject()
    }
  })
}
//----notification sending section ends-----

//---source notification functionalities start here---
//done
SourceNotifications.activityCreated=function(activityId,sourceId,source,isTopicByVote){
  return new Promise(async (resolve, reject) => {
    try{
      let message
      if(isTopicByVote){
        message="New activity has been create created!!Topic is going to select by vote."
      }else{
        message="New activity has been create created!!Topic selected by leader."
      }
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
        message:message,
        gotoText:"Activity details",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      SourceNotifications.sentNotificationToSourceId(sourceId,notification)
      resolve()
    }catch{
      console.log("Error on - activityCreated")
      reject()
    }
  })
}

//done
SourceNotifications.activityDeleted=function(sourceId,source){
  return new Promise(async (resolve, reject) => {
    try{
      let notification={
      message:"Newly created activity has been deleted.",
      gotoText:null,
      gotoLink:null,
      createdDate:new Date()
    }
    SourceNotifications.sentNotificationToSourceId(sourceId,notification)
    resolve()
    }catch{
      console.log("Error on - activityDeleted")
      reject()
    }
  })
}

//done
SourceNotifications.activityFieldsUpdated=function(activityId,sourceId,source){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
      message:"New activity fields data updated.",
      gotoText:"Activity details",
      gotoLink:gotoLink,
      createdDate:new Date()
    }
    SourceNotifications.sentNotificationToSourceId(sourceId,notification)
      resolve()
    }catch{
      console.log("Error on - activityDeleted")
      reject()
    }
  })
}

//done
SourceNotifications.topicResultPublished=function(activityId,sourceId,source){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
        message:"New activities topic result published!!",
        gotoText:"See the result",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      SourceNotifications.sentNotificationToSourceId(sourceId,notification)        
      resolve()
    }catch{
      console.log("Error on - topicResultPublished")
      reject()
    }
  })
}

//done
SourceNotifications.ActivitySubmitted=function(activityId,sourceId,source){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
        message:"Activity has submitted to post controller.",
        gotoText:"Check activity status",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      SourceNotifications.sentNotificationToSourceId(sourceId,notification)        
      resolve()
    }catch{
      console.log("Error on - ActivitySubmitted")
      reject()
    }
  })
}
//done
SourceNotifications.activityReceived=function(activityId,sourceId,source){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
        message:"Submitted activity received by post controller!!",
        gotoText:"See activity status",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      SourceNotifications.sentNotificationToSourceId(sourceId,notification)        
      resolve()
    }catch{
      console.log("Error on - activityReceived")
      reject()
    }
  })
}
//done
SourceNotifications.editorAssigned=function(activityId,sourceId,source){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
        message:"Editor has been assigned for submitted activity.",
        gotoText:"See activity status",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      SourceNotifications.sentNotificationToSourceId(sourceId,notification)       
      resolve()
    }catch{
      console.log("Error on - editorAssigned")
      reject()
    }
  })
}
//done
SourceNotifications.activityEdited=function(activityId,sourceId,source){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
        message:"Activity video editing completed.",
        gotoText:"See activity status",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      SourceNotifications.sentNotificationToSourceId(sourceId,notification)       
      resolve()
    }catch{
      console.log("Error on - activityEdited")
      reject()
    }
  })
}

//done
SourceNotifications.activityPublished=function(activityId,sourceId,source){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
        message:"Activity has been published!!",
        gotoText:"See the activity",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      SourceNotifications.sentNotificationToSourceId(sourceId,notification)    
      resolve()
    }catch{
      console.log("Error on - activityPublished")
      reject()
    }
  })
}

//done
SourceNotifications.activityLiked=function(activityId,sourceId,source){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
        message:"Someone liked one of the activities.",
        gotoText:"See the activity",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      SourceNotifications.sentNotificationToSourceId(sourceId,notification)    
      resolve()
    }catch{
      console.log("Error on - activityLiked")
      reject()
    }
  })
}

//done
SourceNotifications.commentOnActivity=function(activityId,sourceId,source){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
        message:"Someone commented on one of the activities.",
        gotoText:"See the activity",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      SourceNotifications.sentNotificationToSourceId(sourceId,notification)      
      resolve()
    }catch{
      console.log("Error on - commentOnActivity")
      reject()
    }
  })
}

//done
SourceNotifications.dislikedActivity=function(activityId,sourceId,source){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
        message:"Someone disliked on one of the activities.",
        gotoText:"See the activity",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      SourceNotifications.sentNotificationToSourceId(sourceId,notification)       
      resolve()
    }catch{
      console.log("Error on - dislikedActivity")
      reject()
    }
  })
}

//done
SourceNotifications.leaderVotingGoingOn=function(poleId,sourceId,source){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/leader-voting/"+poleId+"/details"
      let notification={
        message:"New leader voting pole has created",
        gotoText:"Go to voting page",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      SourceNotifications.sentNotificationToSourceId(sourceId,notification)        
      resolve()
    }catch{
      console.log("Error on -leaderVotingGoingOn ")
      reject()
    }
  })
}

//done
SourceNotifications.leaderResultPublished=function(poleId,sourceId,source){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/leader-voting/"+poleId+"/details"
      let notification={
        message:"New leader voting result has published!!",
        gotoText:"See the result",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      SourceNotifications.sentNotificationToSourceId(sourceId,notification)       
      resolve()
    }catch{
      console.log("Error on -leaderResultPublished ")
      reject()
    }
  })
}
module.exports=SourceNotifications