const GlobalNotifications = require("../models/GlobalNotifications")
const Notification = require("../models/Notification")
const SourceNotifications = require("../models/SourceNotifications")

exports.getAllNotifications=async function(req,res){
  try{
//get all notifications
  //check with
  //set unseen notification as zero
  let globalNotifications=[]
  if(req.session.user.accountType=="student"){
    //--------------------------
    globalNotifications=await GlobalNotifications.getGlobalNotifications()
    let totalNotifications=globalNotifications.length
    if(totalNotifications>25){
      globalNotifications=globalNotifications.slice(totalNotifications-5,totalNotifications)
    }
    globalNotifications=globalNotifications.reverse()
    //--------------------------
  }
  let notificationData=await Notification.getNotificationData(req.regNumber)
  await Notification.setUnseenNotificationAsZero(req.regNumber)
  req.session.user.otherData.unseenNotifications = 0
  console.log("unseen :",notificationData.unseenNotifications)
  console.log("session",req.session.user)
  req.session.save(()=>{
    res.render("notifications-page",{
      notifications:notificationData.notifications.reverse(),
      unseenNotifications:notificationData.unseenNotificationNumber,
      globalNotifications:globalNotifications
    })
  })
 
  }catch{
    res.render("404")
  }
  
}

exports.getSourceNotifiations=async function(req,res){
  try{

  let notifications=await SourceNotifications.getNotifications(req.params.id)
  let sourceData={
    source:req.sourceData.from,
    sourceId:req.sourceData.sourceId,
    sourceName:req.sourceData.sourceName
  }
  notifications=notifications.reverse()
  console.log("unseen :",notifications)
  console.log("sourceData",sourceData)
  req.session.save(()=>{
    res.render("source-notifications-page",{
      notifications:notifications,
      sourceData:sourceData
    })
  })
 
  }catch{
    res.render("404")
  }
  
}