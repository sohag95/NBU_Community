const notificationCollection = require("../db").db().collection("Notifications")

let Notification=function(notificationType,gotoLink){
  this.notificationType=notificationType
  this.gotoLink=gotoLink
  this.notification={}
}

Notification.prototype.generateNotification=function(){
  this.notification={
    message:"hello there i am sohag roy.",
    gotoLink:"",
    gotoText:"",
    createdDate:""
  }
}

Notification.sentNotificationToOneUser=function(regNumber,notification){
  return new Promise(async (resolve, reject) => {
    try{
      await notificationCollection.updateMany(
        {regNumber:regNumber},
        {
          $push:{
          notifications:notification
        },$inc:{
            unseenNotificationNumber:1
        }},{ multi: true })
      resolve()
    }catch{
      reject()
    }
  })
}

Notification.sentNotificationToMultipleUsers=function(regNumbers,notification){
  return new Promise(async (resolve, reject) => {
    try{
      await notificationCollection.updateMany(
        {regNumber:{$in:regNumbers}},
        {
          $push:{
          notifications:notification
        },$inc:{
            unseenNotificationNumber:1
        }},{ multi: true })

      resolve()
    }catch{
      reject()
    }
  })
}
module.exports=Notification