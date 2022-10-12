const officialUsersCollection = require("../db").db().collection("officialDataTable")

let GlobalNotifications=function(data){
  this.data=data
}

GlobalNotifications.sentNotification=function(notification){
  return new Promise(async (resolve, reject) => {
    try{
      await officialUsersCollection.updateOne(
        {dataType:"globalNotifications"},
        {
          $push:{
            notifications:notification
        }})
      resolve()
    }catch{
      console.log("Error on sentNotification")
      reject()
    }
  })
}

GlobalNotifications.getGlobalNotifications=function(){
  return new Promise(async (resolve, reject) => {
    try{
      let data=await officialUsersCollection.findOne({dataType:"globalNotifications"})
      resolve(data.notifications)
    }catch{
      reject()
    }
  })
}
//done
GlobalNotifications.activityCreated=function(activityId,sourceId,sourceName,source){
  return new Promise(async (resolve, reject) => {
    try{
      let message
      if(source=="batch"){
        message="new "+source+" activity has been created.Created by - "+sourceName+" department ,Session-(20"+sourceId.slice(0,2)+"-20"+sourceId.slice(2,4)+") batch students."
      }else if(source=="department"){
        message="New "+source+" activity has been created.Created by - "+sourceName+" department's students."
      }else{
        message="New "+source+" activity has been created.Created by - "+sourceName+" group."
      }
      let gotoLink="/activity/"+activityId+"/details"
        let notification={
        message:message,
        gotoText:"Go to activity details",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      await GlobalNotifications.sentNotification(notification)
      resolve()
    }catch{
      console.log("Error on activityCreated")
      reject()
    }
  })
}

//done
GlobalNotifications.activityPublished=function(activityId,source){
  return new Promise(async (resolve, reject) => {
    try{
      let message="One "+source+" activity has been published.See the activity and give your opinion."
      let gotoLink="/activity/"+activityId+"/details"
        let notification={
        message:message,
        gotoText:"Activity details",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      await GlobalNotifications.sentNotification(notification)
      resolve()
    }catch{
      console.log("Error on activityPublished")
      reject()
    }
  })
}

//done
GlobalNotifications.newLeaderVotingResultPublished=function(poleId,poleData){
  return new Promise(async (resolve, reject) => {
    try{
      let message
      if(poleData.source=="batch"){
        message="New "+poleData.source+" leader selection result has published!!.New selected leader for Deparmtent - "+poleData.sourceName+" | Batch - (20"+poleData.sourceId.slice(0,2)+"-20"+poleData.source.slice(2,4)+") is : "+poleData.wonLeader.userName+"."
      }else if(source=="department"){
        message="New "+poleData.source+" leader selection result has published!!.New selected leader for deparmtent of '"+poleData.sourceName+"' is : "+poleData.wonLeader.userName+"."
      }else{
        message="New "+poleData.source+" leader selection result has published!!.New selected leader for group '"+poleData.sourceName+"' is : "+poleData.wonLeader.userName+"."
      }
      let gotoLink="/leader-voting/"+poleId+"/details"
      let notification={
        message:message,
        gotoText:"See the voting result",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      await GlobalNotifications.sentNotification(notification)
      resolve()
    }catch{
      console.log("Error on newLeaderVotingResultPublished")
      reject()
    }
  })
}

module.exports=GlobalNotifications