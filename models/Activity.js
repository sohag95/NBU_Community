const { ObjectId } = require("mongodb")
const Department = require("./Department")
const GetAllMembers = require("./GetAllMembers")
const GlobalNotifications = require("./GlobalNotifications")
const Group = require("./Group")
const LeaderVoting = require("./LeaderVoting")
const Notification = require("./Notification")
const OfficialUsers = require("./OfficialUsers")
const OtherOperations = require("./OtherOperations")
const SessionBatch = require("./SessionBatch")
const SourceNotifications = require("./SourceNotifications")
const StudentDataHandle = require("./StudentDataHandle")
const TopicVoting = require("./TopicVoting")

const activityCollection = require("../db").db().collection("Activities")

let Activity=function(data,creatorData,neededData){
  this.data=data
  this.creatorData=creatorData
  this.neededData=neededData
  this.activityDate
  this.errors=[]
}

Activity.prototype.cleanUp=function(){
  if (typeof this.data.topic != "string") {
    this.data.topic=""
  }
  if (typeof this.data.title != "string") {
    this.data.title=""
  }
  if (typeof this.data.shortDetails != "string") {
    this.data.shortDetails=""
  }
  if (typeof this.data.activityDate != "string") {
    this.data.activityDate=""
  }
}

Activity.prototype.cleanUpData=function(){
  if (typeof this.data.topicSelectedBy != "string") {
    this.data.topicSelectedBy=""
  }
  if(this.data.topicSelectedBy=="leader"){
    this.cleanUp()
  }else{
    if (typeof this.data.votingLastDate != "string") {
      this.data.votingLastDate=""
    }
  }
}

Activity.prototype.validate=function(){
  if (this.data.topic == "") {
    this.errors.push("You must select topic of the activity.")
  }
  if (this.data.title == "") {
    this.errors.push("You must give a title of the activity.")
  }
  if (this.data.shortDetails == "") {
    this.errors.push("You must give a short details of the activity.")
  }
  if (this.data.title.lenth>60) {
    this.errors.push("You should write title within 60 characters.")
  }
  if (this.data.shortDetails.lenth>200) {
    this.errors.push("You should write short details within 200 characters.")
  }
  if (this.data.activityDate=="") {
    this.errors.push("You should give activity date.")
  }
}

Activity.prototype.validateData=function(){
  if (this.data.topicSelectedBy == "") {
    this.errors.push("You must select topic selector.")
  }
  if(this.data.topicSelectedBy!="leader" && this.data.topicSelectedBy!="voting"){
    this.errors.push("Topic should be selected only by leader or by voting.")
  }
  if(this.data.topicSelectedBy=="leader"){
    this.validate()
  }else{
    if (this.data.votingLastDate=="") {
      this.errors.push("You should give voting last date.")
    }
  }
}

Activity.prototype.getActivityData=async function(){
  try{
    let postControllerDetails=await OfficialUsers.getPostControllerDetails()
    
    this.activityData={
      activityType:this.neededData.from,
      activitySourceId:this.neededData.sourceId,//batchId,departmentCode,groupId
      sourceName:this.neededData.sourceName,//for batch={departmentName(batch session)},department=departmentName,group=groupName
      isTopicByVote:false,//false means topic selected by leader
      isVoteCompleted:false,
      votingId:null,
      videoLinks:{
        youTube:null,
        facebook:null,
        instagram:null,
        linkedIn:null
      },
      //videoCoverPhoto:null,no need this field,cover photo key is the _id of the activity
      topic:null,
      title:null,
      shortDetails:null,
      status:"created",//created,voted,activitySubmitted,received,(editorAssigned,editingAccepted),edited,published
      leaders:this.neededData.leaders,
      postControllerDetails:postControllerDetails,
      videoEditorDetails:null,
      participants:[],
      activityDates:{
        createdDate:new Date(),
        votingLastDate:null,
        votingResultDate:null,
        activityDate:null,
        submissionDate:null,
        receivedDate:null,
        editorAssignedDate:null,
        editingAcceptedDate:null,
        editedDate:null,
        publishedDate:null,
      },
      activityHandler:{
        type:"creator",//creator,editor
        handler:this.creatorData,
        lastDate:new Date()
      },
      likes:[],
      comments:[],
      isCoverPhotoUploaded:false
    }
    // likes=["regNumber","regNumber"]
    // comments=[
    //   {
    //     regNumber:"2022COMSC0001",
    //     userName:"Sohag Roy",
    //     comment:"hello i am here"
    //     createdDate:new Date()
    //   }
    // ]
    
    if(this.data.topicSelectedBy=="leader"){
      this.activityData.topic=this.data.topic
      this.activityData.title=this.data.title
      this.activityData.shortDetails=this.data.shortDetails
      this.activityData.activityDates.activityDate=new Date(this.data.activityDate)
    }else if(this.data.topicSelectedBy=="voting"){
      console.log("i am in voting section")
      let topicVoting=new TopicVoting(this.neededData,this.data.votingLastDate)
      let votingId=await topicVoting.createTopicVotingPole()
      this.activityData.isTopicByVote=true
      this.activityData.votingId=votingId
      this.activityData.activityDates.votingLastDate=new Date(this.data.votingLastDate)
    }
  }catch{
    console.log("I am here")
    this.errors.push("There is some problem!")
  }
}

Activity.prototype.updatePresentActivityFieldBySource=function(activityData){
  return new Promise(async (resolve, reject) => { 
    try{
      if(this.neededData.from=="batch"){
        await SessionBatch.updatePresentActivityField(this.neededData.sourceId,activityData)
      }else if(this.neededData.from=="department"){
        await Department.updatePresentActivityField(this.neededData.sourceId,activityData)
      }else{
        await Group.updatePresentActivityField(this.neededData.sourceId,activityData)
      }
      resolve()
    }catch{
      reject()
    }
  })
}
Activity.prototype.createNewActivity=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      this.cleanUpData()
      this.validateData()
      if(!this.errors.length){
        await this.getActivityData()
        console.log("Activity Data :",this.activityData)
        if(!this.errors.length){
        //create activity on database
        let createdActivity= await activityCollection.insertOne(this.activityData)
          if(createdActivity.acknowledged){
            let activityData={
              activityId:createdActivity.insertedId,
              isTopicByVote:this.activityData.isTopicByVote,
              isVoteCompleted:this.activityData.isVoteCompleted,
              topic:this.activityData.topic,
              title:this.activityData.title,
              votingLastDate:this.activityData.activityDates.votingLastDate,
              activityDate:this.activityData.activityDates.activityDate,
              createdDate:this.activityData.activityDates.createdDate
            }
            //console.log("Created activity :",createdActivity)
            //update activity creating source's present activity field
            await this.updatePresentActivityFieldBySource(activityData)
            //get all members regNumber array to sent notification
            let allMembers=await GetAllMembers.getAllSourceMembers(this.activityData.activitySourceId,this.activityData.activityType)
            await Notification.activityCreatedToAllSourceMembers(allMembers,createdActivity.insertedId,this.activityData.activityType,activityData.isTopicByVote)
            //sent global notification
            await GlobalNotifications.activityCreated(createdActivity.insertedId,this.activityData.activitySourceId,this.activityData.sourceName,this.activityData.activityType)
            //--notification to souce---
            await SourceNotifications.activityCreated(createdActivity.insertedId,this.activityData.activitySourceId,this.activityData.activityType,activityData.isTopicByVote)
            //store activityId on voting pole detaile
            if(activityData.isTopicByVote){
              await TopicVoting.storeActivityIdOnVotingPole(this.activityData.votingId,createdActivity.insertedId)
            }

            resolve(createdActivity.insertedId)
          }else{
            reject("Activity not created!")
          }
        }else{
          reject(this.errors)
        } 
      }else{
        reject(this.errors)
      }
    }catch{
      reject("there is some problem")
    }
  })
}

Activity.deleteActivity=function(activityData){
  return new Promise(async (resolve, reject) => { 
    try{
      console.log("activity Data :",activityData)
      if(activityData.source=="batch"){
        console.log("ran on batch")
        await SessionBatch.updatePresentActivityFieldAfterDeletion(activityData.sourceId)
       }else if(activityData.source=="department"){
         console.log("this should ran")
        await Department.updatePresentActivityFieldAfterDeletion(activityData.sourceId)
       }else if(activityData.source=="group"){
        console.log("ran on group")
        await Group.updatePresentActivityFieldAfterDeletion(activityData.sourceId)
       }
       if(activityData.votingId){
        //if topic selected by vote then delete the voting details
        await TopicVoting.deleteVotingPole(activityData.votingId)
       }
       //delete the activity details
       await activityCollection.deleteOne({_id:activityData._id})
       
       //--source notification
       await SourceNotifications.activityDeleted(activityData.sourceId)
      resolve()
    }catch{
      reject()
    }
  })
}


Activity.prototype.updateSourcePresentActivityFieldData=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      if(this.neededData.source=="batch"){
        console.log("ran on batch")
        await SessionBatch.updatePresentActivityFieldAfterEditDetails(this.neededData.sourceId,this.data)
       }else if(this.neededData.source=="department"){
         console.log("this should ran")
        await Department.updatePresentActivityFieldAfterEditDetails(this.neededData.sourceId,this.data)
       }else if(this.neededData.source=="group"){
        console.log("ran on group")
        await Group.updatePresentActivityFieldAfterEditDetails(this.neededData.sourceId,this.data)
       }
      resolve()
    }catch{
      reject()
    }
  })
}
Activity.prototype.updateEditData=function(id){
  return new Promise(async (resolve, reject) => { 
    try{
      console.log("id:",id)
      let activityHandler={
        type:"editor",
        handler:this.creatorData,
        lastDate:new Date()
      }
      console.log("activity handler:",activityHandler)
      await activityCollection.updateOne({_id:new ObjectId(id)},{
        $set:{
          "topic":this.data.topic,
          "title":this.data.title,
          "shortDetails":this.data.shortDetails,
          "activityDates.activityDate":new Date(this.data.activityDate),
          "activityHandler":activityHandler
        }
      })
      await this.updateSourcePresentActivityFieldData()
      //sent source notification
      await SourceNotifications.activityFieldsUpdated(id,this.neededData.sourceId)
      resolve()
    }catch{
      console.log("I am from editActivityDetails")
      reject()
    }
  })
}

Activity.prototype.editActivityDetails=function(id){
  return new Promise(async (resolve, reject) => { 
    try{
      this.cleanUp()
      this.validate()
      if(!this.errors.length){
        await this.updateEditData(id)
        resolve()
      }else{
        reject(this.errors)
      }
    }catch{
      console.log("I am from editActivityDetails")
      reject("there is some problem!")
    }
  })
}

Activity.getActivityDetailsById=function(id){
  return new Promise(async (resolve, reject) => { 
    try{
      let activityDetails=await activityCollection.findOne({_id: new ObjectId(id)})
      resolve(activityDetails)
    }catch{
      reject()
    }
  })
}

//i have to work on this function later.Function called is not working...now the function is working from topicVoting class
Activity.updateActivityDataAfterVoteResult=function(id,wonTopic){
  return new Promise(async (resolve, reject) => { 
    try{
      console.log("I am here buddy")
      // let status="voted"
      // await activityCollection.updateMany({_id: new ObjectId(id)},{
      //   $set:{
      //     "isVoteCompleted":true,
      //     "topic":wonTopic,
      //     "status":status,
      //     "activityDates.votingResultDate":new Date()
      //   }
      // })
      // console.log("updateActivityDataAfterVote ok")
      resolve()
    }catch{
      console.log("error updateActivityDataAfterVote")
      reject()
    }
  })
}


Activity.getAllActivityDetailsOfArrayIds=function(activityIds,from){
  return new Promise(async (resolve, reject) => { 
    try{
      
      //update state and date
      let allActivities=await activityCollection.find({_id:{ $in:activityIds }}).sort({"activityDates.publishedDate":-1}).toArray()
      allActivities=allActivities.map((activity)=>{
        let activityData={
          _id:activity._id,
          activityType:activity.activityType,
          sourceName:activity.sourceName,
          activitySourceId:activity.activitySourceId,
          topic:activity.topic,
          title:activity.title,
          videoCoverPhoto:activity.videoCoverPhoto,
          likes:activity.likes.length,
          comments:activity.comments.length,
          activityDate:activity.activityDates.activityDate,
          publishedDate:activity.activityDates.publishedDate,
          status:activity.status
        }
        
        return activityData
      })
      resolve(allActivities)
    }catch{
      reject("There is some problem.")
    }
  })
}

Activity.getAllActivityDetailsOfArrayIdsFullData=function(activityIds){
  return new Promise(async (resolve, reject) => { 
    try{
      let allActivities=await activityCollection.find({_id:{ $in:activityIds }}).toArray()
      resolve(allActivities)
    }catch{
      reject("There is some problem.")
    }
  })
}

Activity.getUpcommingActivities=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      let today=new Date()
      today.setHours(0,0,0,0)
      
      let allActivities=await activityCollection.find({ "activityDates.activityDate": { $gt: today }}).toArray()
      allActivities=allActivities.map((activity)=>{
        let activityData={
          _id:activity._id,
          activityType:activity.activityType,
          sourceName:activity.sourceName,
          activitySourceId:activity.activitySourceId,
          topic:activity.topic,
          title:activity.title,
          shortDetails:activity.shortDetails,
          activityDate:activity.activityDates.activityDate,
          createdDate:activity.activityDates.createdDate,
        }
        return activityData
      })
      resolve(allActivities)
    }catch{
      reject("There is some problem.")
    }
  })
}

Activity.getAllActivityMember=function(activityData){
  return new Promise(async (resolve, reject) => { 
    try{
      console.log("Activity data:",activityData)
      let allMembers=[]
        //OLD function call s
        //allMembers=await SessionBatch.getAllAvailableActivityMemberFromBatch(activityData.sourceId)
        //allMembers=await Department.getAllAvailableActivityMemberOnDepartment(activityData.sourceId)
        //allMembers=await Group.getAllAvailableActivityMemberOnGroup(activityData.sourceId)
        //new function call
        allMembers=await GetAllMembers.getAllSourceMembers(activityData.sourceId,activityData.from,"details")
      
      resolve(allMembers)
    }catch{
      reject("There is some problem.")
    }
  })
}


Activity.submitActivityByLeader=function(id,activityParticipants,submittedBy,neededData){
  return new Promise(async (resolve, reject) => { 
    try{
      //update state and date
      await activityCollection.updateOne({_id: new ObjectId(id)},{
        $set:{
          "status":"activitySubmitted",
          "participants":activityParticipants,
          "activityDates.submissionDate":new Date(),
          "submittedBy":submittedBy
        }
      })
      //sent activity id to postController to control states of activity
      await OfficialUsers.addSubmittedAcivityIdOnPostControllerAccount(new ObjectId(id))
      //----notification to post controller-----
      //Notification should go on post controller's email id
      await Notification.newActivitySubmittedToPostController(id)
      //sent notification to source
      await SourceNotifications.ActivitySubmitted(id,neededData.sourceId)
      resolve()
    }catch{
      reject("There is some problem.")
    }
  })
}


Activity.receiveActivityByPostController=function(id,note,neededData,allParticipants){
  return new Promise(async (resolve, reject) => { 
    try{
      //update state and date
      await activityCollection.updateOne({_id: new ObjectId(id)},{
        $set:{
          "status":"received",
          "activityDates.receivedDate":new Date(),
          "postControllerNote":note
        }
      })
      //add activityId on all participants account
      //get all participants regNumber array
      let participantsRegNumbers=OtherOperations.getParticipantsRegNumbers(allParticipants)
      await StudentDataHandle.addActivityIdOnAllParticipantsAccount(participantsRegNumbers,new ObjectId(id))
      
      //sent source notification
      await SourceNotifications.activityReceived(id,neededData.sourceId)
      resolve()
    }catch{
      reject("There is some problem.")
    }
  })
}


Activity.assignVideoEditor=function(data,id,neededData){
  return new Promise(async (resolve, reject) => { 
    try{
      //update state and date
      let editorData={
        regNumber:data.regNumber,
        userName:data.userName,
        phone:data.phone
      }
      console.log("Editor data :",editorData)
      await activityCollection.updateOne({_id: id},{
        $set:{
          "status":"editorAssigned",
          "videoEditorDetails":editorData,
          "activityDates.editorAssignedDate":new Date(),
        }
      })
      await OfficialUsers.assignActivityIdToEditorAccount(id)
      //--notify editor as video assigned
      await Notification.activityVideoAssignedToEditor(editorData.regNumber,id)
      //sent source notification
      await SourceNotifications.editorAssigned(id,neededData.sourceId,neededData.source)
      resolve()
    }catch{
      reject("There is some problem.")
    }
  })
}


Activity.acceptVideoEditingByEditor=function(id,note){
  return new Promise(async (resolve, reject) => { 
    try{
      //update state and date
      await activityCollection.updateOne({_id: new ObjectId(id)},{
        $set:{
          "status":"editingAccepted",
          "activityDates.editingAcceptedDate":new Date(),
          "videoEditorNote":note
        }
      })
      //--notify post controller that editing is accepted
      await Notification.activityAssignedEditorAcceptedToPostController(new ObjectId(id))
     
      resolve()
    }catch{
      reject("There is some problem.")
    }
  })
}

Activity.videoEditingCompletedByEditor=function(id,neededData){
  return new Promise(async (resolve, reject) => { 
    try{
      //update state and date
      //id is already in IdObject formate so no change
      await activityCollection.updateOne({_id:id},{
        $set:{
          "status":"edited",
          "activityDates.editedDate":new Date(),
        }
      })
      //---notify post controller that video editing is completed
      await Notification.activityVideoEditedToPostController(id)
      //sent source notification
      await SourceNotifications.activityEdited(id,neededData.sourceId,neededData.source)
      resolve()
    }catch{
      reject("There is some problem.")
    }
  })
}

Activity.markAsCoverPhotoUploaded=function(id){
  return new Promise(async (resolve, reject) => { 
    try{
      await activityCollection.updateOne({_id:id},{
        $set:{
          isCoverPhotoUploaded:true
        }
      })
      resolve()
    }catch{
      reject("There is some problem.")
    }
  })
}

Activity.prototype.cleanUpLinkData=function(){
  let videoLinks={
    youTube:null,
    facebook:null,
    instagram:null,
    linkedIn:null
  }
  if(this.data.youTubeLink){
    videoLinks.youTube=this.data.youTubeLink
  }
  if(this.data.facebookLink){
    videoLinks.facebook=this.data.facebookLink
  }
  if(this.data.instagramLink){
    videoLinks.instagram=this.data.instagramLink
  }
  if(this.data.linkedInLink){
    videoLinks.linkedIn=this.data.linkedInLink
  }
  return videoLinks
}

Activity.prototype.updatePublishedState=function(id,videoLinks){
  return new Promise(async (resolve, reject) => { 
    try{
      await activityCollection.updateOne({_id:id},{
        $set:{
          "status":"published",
          "activityDates.publishedDate":new Date(),
          "videoLinks":videoLinks
        }
      })
      resolve()
    }catch{
      reject("There is some problem.")
    }
  })
}
//************************/
Activity.prototype.updateSourceFieldValueAfterActivityPublished=function(activityData,sourceData){
  return new Promise(async (resolve, reject) => { 
    try{
      //tomorrow i have to work on this function
      if(sourceData.from=="batch"){
        await SessionBatch.updatePreviousActivityFieldOnBatch(sourceData.sourceId,activityData)
      }
      if(sourceData.from=="department"){
        await Department.updatePreviousActivityFieldOnDepartment(sourceData.sourceId,activityData)
      }
      if(sourceData.from=="group"){
        await Group.updatePreviousActivityFieldOnGroup(sourceData.sourceId,activityData)
      }
      resolve()
    }catch{
      reject("There is some problem.")
    }
  })
}

Activity.prototype.publishActivity=function(activityData,sourceData,editorRegNumber){
  return new Promise(async (resolve, reject) => { 
    try{
      //set given linked
      let videoLinks=this.cleanUpLinkData()
      //---notification---
      //get all members regNumber array to sent notification
      let allMembers=await GetAllMembers.getAllSourceMembers(sourceData.sourceId,sourceData.from)
      //update state with changing data on activity
      await this.updatePublishedState(activityData._id,videoLinks)
      //---sent notification as activity published
      await Notification.activityPublishedToAllSourceMembers(allMembers,activityData._id,sourceData.from)
      //update activity source field values
      await this.updateSourceFieldValueAfterActivityPublished(activityData,sourceData)
      //storing published activity id
      await OfficialUsers.addPublishedActivityIdOnActivityStorage(activityData._id)
      //remove assigned activity id from editor and postcontroller account and add activity id as completed/submitted activity
      await OfficialUsers.removeAssignedActivityIdFromEditor(activityData._id)
      await OfficialUsers.removeSubmittedActivityIdFromPostController(activityData._id)
      //---------------------------------------
      //get leaders regNumber from:sourceData.leaders
      let leadRegNumbers=OtherOperations.getActivityLeadersRegNumbers(sourceData.leaders)
      //update activity id on leaders account
      await StudentDataHandle.addActivityIdOnLeadersAccount(leadRegNumbers,activityData._id)
      //---------------------------------------
      //--sent notification to activity video editor|Not needed now
      //await Notification.activityPublishedToEditor(editorRegNumber,activityData._id)
     //--sent global notification
     await GlobalNotifications.activityPublished(activityData._id,sourceData.from)
    //--sent source notification
    await SourceNotifications.activityPublished(activityData._id,sourceData.sourceId,sourceData.from)
    //create voting pole to select new leader as after each activity there should have new leader
    let leaderVoting=new LeaderVoting(sourceData,"auto")
    let poleId=await leaderVoting.createLeaderVotingPole("autoGenerated")
    //--------------------------------------- 
    //------SENT NOTIFICATION as new voting pole created---------
    await Notification.newLeaderSelectionStartedToAllSourceMembers(allMembers,poleId,sourceData.from)
      
    resolve()
    }catch{
      console.log("There is some problem on activity publishing!!!")
      reject("There is some problem.")
    }
  })
}


Activity.likeActivity=function(id,regNumber,neededData){
  return new Promise(async (resolve, reject) => { 
    try{
      await activityCollection.updateOne({_id:id},{
        $push:{
          "likes":regNumber,
        }
      })
      //--sent source notification
      await SourceNotifications.activityLiked(id,neededData.sourceId,neededData.source)
      resolve()
    }catch{
      reject("There is some problem.")
    }
  })
}

Activity.dislikeActivity=function(id,regNumber,neededData){
  return new Promise(async (resolve, reject) => { 
    try{
      await activityCollection.updateOne({_id:id},{
        $pull:{
          "likes":regNumber,
        }
      })
      //--sent source notification
      await SourceNotifications.dislikedActivity(id,neededData.sourceId,neededData.source)
    
      resolve()
    }catch{
      reject("There is some problem.")
    }
  })
}

Activity.commentOnActivity=function(id,commentDetails,neededData){
  return new Promise(async (resolve, reject) => { 
    try{
      let errMsg=[]
      if (typeof commentDetails.comment != "string") {
        errMsg.push("Comment is not on string type!")
      }
      if (commentDetails.comment.length>200) {
        errMsg.push("Comment can't contain more then 200 character!")
      }
      if (commentDetails.comment=="") {
        errMsg.push("You should write some text as comment.")
      }
      if(!errMsg.length){
        await activityCollection.updateOne({_id:id},{
          $push:{
            "comments":commentDetails
          }
        })
        //--sent source notification
        await SourceNotifications.commentOnActivity(id,neededData.sourceId,neededData.source)
        resolve()
      }else{
        reject(errMsg)
      }
    }catch{
      reject("There is some problem.")
    }
  })
}

module.exports=Activity


//rejected this kind of storage
//this was during post/activity creation
// let dataToPostController={
//   activityId:createdActivity.insertedId,
//   activityType:this.neededData.from,
//   sourceName:this.neededData.sourceName,
//   createdDate:this.activityData.activityDates.createdDate
// }
         