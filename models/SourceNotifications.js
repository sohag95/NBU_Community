const groupsCollection = require("../db").db().collection("Groups")
const sessionBatchesCollection = require("../db").db().collection("sessionBatches")
const departmentsCollection = require("../db").db().collection("Departments")


let SourceNotifications=function(data){
  this.data=data
}

//---notification sending section starts----
SourceNotifications.notificationToBatch=function(batchId,notification){
  return new Promise(async (resolve, reject) => {
    try{
      await sessionBatchesCollection.updateOne(
        {batchId:batchId},
        {
          $push:{
            notifications:notification
        }})

      resolve()
    }catch{
      console.log("Error on - notificationToBatch")
      reject()
    }
  })
}

SourceNotifications.notificationToDepartment=function(departmentCode,notification){
  return new Promise(async (resolve, reject) => {
    try{
      await departmentsCollection.updateOne(
        {departmentCode:departmentCode},
        {
          $push:{
            notifications:notification
        }})
      resolve()
    }catch{
      console.log("Error on - notificationToDepartment")
      reject()
    }
  })
}

SourceNotifications.notificationToGroup=function(groupId,notification){
  return new Promise(async (resolve, reject) => {
    try{
      await groupsCollection.updateOne(
        {groupId:groupId},
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

SourceNotifications.sentNotification=async function(source,sourceId,notification){
  if(source=="batch"){
    await SourceNotifications.notificationToBatch(sourceId,notification)
  }else if(source=="department"){
    await SourceNotifications.notificationToDepartment(sourceId,notification)
  }else if(source=="group"){
    await SourceNotifications.notificationToGroup(sourceId,notification)
  }else{
    console.log("pass")
  }
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
      SourceNotifications.sentNotification(source,sourceId,notification)
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
    SourceNotifications.sentNotification(source,sourceId,notification)
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
    SourceNotifications.sentNotification(source,sourceId,notification)
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
      SourceNotifications.sentNotification(source,sourceId,notification)        
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
      SourceNotifications.sentNotification(source,sourceId,notification)        
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
      SourceNotifications.sentNotification(source,sourceId,notification)        
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
      SourceNotifications.sentNotification(source,sourceId,notification)       
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
      SourceNotifications.sentNotification(source,sourceId,notification)       
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
      SourceNotifications.sentNotification(source,sourceId,notification)    
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
        message:"Some one liked one of the activities.",
        gotoText:"See the activity",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      SourceNotifications.sentNotification(source,sourceId,notification)    
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
      let gotoLink=""
      let notification={
        message:"Someone comment on one of the activities.",
        gotoText:"See the activity",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      SourceNotifications.sentNotification(source,sourceId,notification)      
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
      SourceNotifications.sentNotification(source,sourceId,notification)       
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
      SourceNotifications.sentNotification(source,sourceId,notification)        
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
      SourceNotifications.sentNotification(source,sourceId,notification)       
      resolve()
    }catch{
      console.log("Error on -leaderResultPublished ")
      reject()
    }
  })
}
module.exports=SourceNotifications