const notificationCollection = require("../db").db().collection("Notifications")

let Notification=function(data){
  this.data=data
}
//get unseen notification number
Notification.getUnseenNotificationNumbers=function(regNumber){
  return new Promise(async (resolve, reject) => {
    try{
      let notificationData=await notificationCollection.findOne({regNumber:regNumber})
      resolve(notificationData.unseenNotificationNumber)
    }catch{
      reject()
    }
  })
}

Notification.getNotificationData=function(regNumber){
  return new Promise(async (resolve, reject) => {
    try{
      let notificationData=await notificationCollection.findOne({regNumber:regNumber})
      resolve(notificationData)
    }catch{
      reject()
    }
  })
}
Notification.setUnseenNotificationAsZero=function(regNumber){
  return new Promise(async (resolve, reject) => {
    try{
      await notificationCollection.findOneAndUpdate(
        {regNumber:regNumber},{
        $set:{
          unseenNotificationNumber:0
        }
      })
      resolve()
    }catch{
      reject()
    }
  })
}
///--sending notification section starts
Notification.sentNotificationToOneUser=function(regNumber,notification){
  return new Promise(async (resolve, reject) => {
    try{
      await notificationCollection.updateOne(
        {regNumber:regNumber},
        {
          $push:{
          notifications:notification
        },$inc:{
            unseenNotificationNumber:1
        }})
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
//----sending notification section ends
//--------------STUDENTS notification section starts-----------
//done
Notification.accountVerifiedToAccountHolder=function(regNumber){
  return new Promise(async (resolve, reject) => {
    try{
        let gotoLink="/batch/"+regNumber.slice(0,9)+"/details"
        let notification={
        message:"Congratulations , your account has been verified!!.Now you are an active member of NBU Community.",
        gotoText:"Check your batch details",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser(regNumber,notification)
      resolve()
    }catch{
      reject()
    }
  })
}

//done
Notification.accountRejectedToAccountHolder=function(regNumber){
  return new Promise(async (resolve, reject) => {
    try{
        let notification={
        message:"Sorry!! Your account has been rejected!!Your account will be deleted soon.",
        gotoText:null,
        gotoLink:null,
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser(regNumber,notification)
      resolve()
    }catch{
      reject()
    }
  })
}
//done
Notification.activityCreatedToAllSourceMembers=function(regNumbers,activityId,activityType,isTopicByVote){
  return new Promise(async (resolve, reject) => {
    try{
      let message
      let gotoText
      if(isTopicByVote){
        message="New "+activityType+" activity has been created.And topic is going to be selected by voting.Give your vote for selecting activity topic."
        gotoText="Give topic vote"
      }else{
        message="New "+activityType+" activity has been created.Perticipate the activity to having fun and learn together."
        gotoText="Go to activity details"
      }
        let gotoLink="/activity/"+activityId+"/details"
        let notification={
        message:message,
        gotoText:gotoText,
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      await Notification.sentNotificationToMultipleUsers(regNumbers,notification)
      resolve()
    }catch{
      reject()
    }
  })
}

Notification.batchStateChangedToAllBatchMembers=function(regNumbers,state){
  return new Promise(async (resolve, reject) => {
    try{
        let notification={
        message:"Congratulations!! Your batch state has upgraded!! Now you will be considered as - "+state+" Year Batch Student.",
        gotoText:null,
        gotoLink:null,
        createdDate:new Date()
      }
      await Notification.sentNotificationToMultipleUsers(regNumbers,notification)
      resolve()
    }catch{
      reject()
    }
  })
}

//done
Notification.activityTopicSelectionResultPublishedToAllSourceMembers=function(regNumbers,activityId,activityType,wonTopic){
  return new Promise(async (resolve, reject) => {
    try{
        let gotoLink="/activity/"+activityId+"/details"
        let notification={
        message:"New "+activityType+" activity topic result has published.Won topic is : "+wonTopic+".Now perticipate the activity to having fun and learn together.",
        gotoText:"Go to activity",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      await Notification.sentNotificationToMultipleUsers(regNumbers,notification)
      resolve()
    }catch{
      reject()
    }
  })
}

//done
Notification.activityPublishedToAllSourceMembers=function(regNumbers,activityId,activityType){
  return new Promise(async (resolve, reject) => {
    try{
        let gotoLink="/activity/"+activityId+"/details"
        let notification={
        message:"Conducted "+activityType+" activity has been published.See the activity.",
        gotoText:"View activity",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      await Notification.sentNotificationToMultipleUsers(regNumbers,notification)
      resolve()
    }catch{
      reject()
    }
  })
}

//done
Notification.newLeaderSelectionStartedToAllSourceMembers=function(regNumbers,poleId,leaderType){
  return new Promise(async (resolve, reject) => {
    try{
      //batch-to all batch members
      //department-to all department members
      //group-to all group members
        let gotoLink="/leader-voting/"+poleId+"/details"
        let notification={
        message:"New "+leaderType+" leader selection pole has been created.Nomination taking is going on.See if you are eligible or not!!",
        gotoText:"See voting pole",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      await Notification.sentNotificationToMultipleUsers(regNumbers,notification)
      resolve()
    }catch{
      reject()
    }
  })
}

//done
Notification.newLeaderSelectionResultPublishedToAllSourceMembers=function(regNumbers,poleId,leaderType){
  return new Promise(async (resolve, reject) => {
    try{
        let gotoLink="/leader-voting/"+poleId+"/details"
        let notification={
        message:"New "+leaderType+" leader selection result has published!!",
        gotoText:"Check the result",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      await Notification.sentNotificationToMultipleUsers(regNumbers,notification)
      resolve()
    }catch{
      reject()
    }
  })
}
//-----------credit added notifications--------
//done all functionalities on this section
Notification.creditToActivityLeaders=function(regNumbers,creditPoints){
  return new Promise(async (resolve, reject) => {
    try{
      let notification={
        message:"Congratulations!! Credit points - "+creditPoints+" added.As one activity is published, lead by you. ",
        gotoText:null,
        gotoLink:null,
        createdDate:new Date()
      }
      await Notification.sentNotificationToMultipleUsers(regNumbers,notification)
      resolve()
    }catch{
      reject()
    }
  })
}

Notification.creditToAllActivityParticipants=function(regNumbers,creditPoints){
  return new Promise(async (resolve, reject) => {
    try{

      let notification={
        message:"Congratulations!! Credit points - "+creditPoints+" added.As one activity is published, participated by you. ",
        gotoText:null,
        gotoLink:null,
        createdDate:new Date()
      }
      await Notification.sentNotificationToMultipleUsers(regNumbers,notification)
      resolve()
    }catch{
      reject()
    }
  })
}


Notification.creditToWinningLeaderByVote=function(regNumber,leaderType,creditPoints){
  return new Promise(async (resolve, reject) => {
    try{

      let notification={
        message:"Congratulations!! Credit points - "+creditPoints+" added. As you are selected as a new "+leaderType+" leader.",
        gotoText:null,
        gotoLink:null,
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser(regNumber,notification)
      resolve()
    }catch{
      reject()
    }
  })
}



Notification.creditAfterLeaderVoteToVoter=function(regNumber,creditPoints){
  return new Promise(async (resolve, reject) => {
    try{

      let notification={
        message:"Congratulations!! Credit points - "+creditPoints+" added. As you have voted to select new leader.",
        gotoText:null,
        gotoLink:null,
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser(regNumber,notification)
      resolve()
    }catch{
      reject()
    }
  })
}


Notification.creditAfterGattingNominationToNominator=function(regNumber,leaderType,creditPoints){
  return new Promise(async (resolve, reject) => {
    try{
      let notification={
        message:"Congratulations!! Credit points - "+creditPoints+" added. As you got nominated by yourself to become a leader.",
        gotoText:null,
        gotoLink:null,
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser(regNumber,notification)
      resolve()
    }catch{
      reject()
    }
  })
}

Notification.creditAfterTopicVoteToVoter=function(regNumber,creditPoints){
  return new Promise(async (resolve, reject) => {
    try{
      let notification={
        message:"Congratulations!! Credit points - "+creditPoints+" added. As you give your vote to select next activity topic.",
        gotoText:null,
        gotoLink:null,
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser(regNumber,notification)
      resolve()
    }catch{
      reject()
    }
  })
}
//done
Notification.creditToCampusGroupMember=function(regNumber,creditPoints){
  return new Promise(async (resolve, reject) => {
    try{
      let notification={
        message:"Congratulations!! Credit points - "+creditPoints+" added. As you are a new member of a campus group.",
        gotoText:null,
        gotoLink:null,
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser(regNumber,notification)
      resolve()
    }catch{
      reject()
    }
  })
}
//done
Notification.deductCreditToLeavingGroupMember=function(regNumber,creditPoints,groupId,from){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoText="Go to the group details"
      let gotoLink="/campus-group/"+groupId+"/details"
      let message="Sorry !! Credit points : ("+creditPoints+") added. As you leave one of your campus groups membership."
      if(from=="creator"){
        gotoText=null
        gotoLink=null
        message="Sorry !! Credit points : ("+creditPoints+") added. As you have deleted one of your created campus group."
      }
      let notification={
        message:message,
        gotoText:gotoText,
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser(regNumber,notification)
      resolve()
    }catch{
      reject()
    }
  })
}
//-----------Credit notification ends------

//-----------campus Groups notification ends------
Notification.campusGroupRequestComeToAdmins=function(regNumbers,groupId){
  return new Promise(async (resolve, reject) => {
    try{
      let notification={
        message:" New membership request received on campus group.As you are admin,you can accept or reject the request.Check it now.",
        gotoText:"Go to the group details",
        gotoLink:"/campus-group/"+groupId+"/details",
        createdDate:new Date()
      }
      await Notification.sentNotificationToMultipleUsers(regNumbers,notification)
      resolve()
    }catch{
      reject()
    }
  })
}
//done
Notification.acceptedCampusGroupRequest=function(regNumber,groupId){
  return new Promise(async (resolve, reject) => {
    try{
      let notification={
        message:"Congratulations!! Your campus group membership request has accepted.Let start the group work.",
        gotoText:"Go to the group details",
        gotoLink:"/campus-group/"+groupId+"/details",
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser(regNumber,notification)
      resolve()
    }catch{
      reject()
    }
  })
}
//done
Notification.rejectedCampusGroupRequest=function(regNumber,groupId){
  return new Promise(async (resolve, reject) => {
    try{
      let notification={
        message:"Sorry!! Your campus group membership request has rejected.",
        gotoText:"Go to the group details",
        gotoLink:"/campus-group/"+groupId+"/details",
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser(regNumber,notification)
      resolve()
    }catch{
      reject()
    }
  })
}
//done
Notification.newCampusGroupAdmin=function(regNumber,groupId){
  return new Promise(async (resolve, reject) => {
    try{
      let notification={
        message:"Congratulations!! Your are added as an admin on one of your campus groups.Now you also can handle the group data.",
        gotoText:"Go to the group details",
        gotoLink:"/campus-group/"+groupId+"/details",
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser(regNumber,notification)
      resolve()
    }catch{
      console.log("I am from ")
      reject()
    }
  })
}

Notification.leaveMessageToAllOtherMembers=function(regNumbers,groupId,leavingAccount){
  return new Promise(async (resolve, reject) => {
    try{
      let notification={
        message:leavingAccount.userName+" has leaved from one of campus groups you are angagged with.",
        gotoText:"Go to the group details",
        gotoLink:"/campus-group/"+groupId+"/details",
        createdDate:new Date()
      }
      await Notification.sentNotificationToMultipleUsers(regNumbers,notification)
      resolve()
    }catch{
      reject()
    }
  })
}

//-----------campus Groups notification ends------

Notification.yearChangingToAllBatchMembers=function(regNumbers,newYear){
  return new Promise(async (resolve, reject) => {
    try{

      let notification={
        message:"Congratulations !! Your class has upgraded, Now you will be considered as - "+newYear+" student.",
        gotoText:null,
        gotoLink:null,
        createdDate:new Date()
      }
      await Notification.sentNotificationToMultipleUsers(regNumbers,notification)
      resolve()
    }catch{
      reject()
    }
  })
}

//----------Student's related notification ends-------

//----------Admin's notification section starts here--------------
Notification.rejectedAccountDuringVerificationToAdmin=function(rejectedRegNumber){
  return new Promise(async (resolve, reject) => {
    try{
      let notification={
        message:"RegNumber - "+rejectedRegNumber+" account holder verification got rejected!!",
        gotoText:null,
        gotoLink:null,
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser("2022ADMIN9999",notification)
      resolve()
    }catch{
      reject()
    }
  })
}


//------------Society Controller's notification section ends here--------------
Notification.reportedByStudentsToSocietyController=function(reportingType,reportId){
  return new Promise(async (resolve, reject) => {
    try{
      //reportingTypes-account,leader,activity,fakeParticipants,
      let gotoLink="/report/"+reportId+"/details"
      let notification={
        message:"Got a new report !! Reporting Type - "+reportingType,
        gotoText:"See reporting details",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser("2022UNSCN9999",notification)
      resolve()
    }catch{
      reject()
    }
  })
}

//------------Society Controller's notification section ends here--------------
//------------Post Controller's notification section ends here--------------
//done
Notification.newActivitySubmittedToPostController=function(activityId){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
        message:"New activity submitted.Handle the activity status.",
        gotoText:"Activity Details",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      
      await Notification.sentNotificationToOneUser("2022POSTC9999",notification)
      resolve()
    }catch{
      reject()
    }
  })
}

//done
Notification.activityAssignedEditorAcceptedToPostController=function(activityId){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
        message:"Activity video editor accepts video editing request.",
        gotoText:"Activity Details",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser("2022POSTC9999",notification)
      resolve()
    }catch{
      reject()
    }
  })
}

//done
Notification.activityVideoEditedToPostController=function(activityId){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
        message:"Activity video editing completed.Now activity is ready to be published!!",
        gotoText:"Activity Details",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser("2022POSTC9999",notification)
      resolve()
    }catch{
      reject()
    }
  })
}

//------------Post Controller's notification section ends here--------------

//------------Video editor's notification section ends here--------------
//done
Notification.activityVideoAssignedToEditor=function(regNumber,activityId){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
        message:"Activity video editing has assigned to you. Accept it!!",
        gotoText:"Activity Details",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser(regNumber,notification)
      resolve()
    }catch{
      reject()
    }
  })
}

//done
Notification.activityPublishedToEditor=function(regNumber,activityId){
  return new Promise(async (resolve, reject) => {
    try{
      let gotoLink="/activity/"+activityId+"/details"
      let notification={
        message:"Activity video edited by you has been published.Thank You!!",
        gotoText:"Activity Details",
        gotoLink:gotoLink,
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser(regNumber,notification)
      resolve()
    }catch{
      reject()
    }
  })
}
//------------Video editor's notification section ends here--------------

module.exports=Notification