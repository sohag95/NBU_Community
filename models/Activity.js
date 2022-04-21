const { ObjectId } = require("mongodb")
const Department = require("./Department")
const Group = require("./Group")
const OfficialUsers = require("./OfficialUsers")
const SessionBatch = require("./SessionBatch")
const Voting = require("./Voting")

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
  if (this.data.shortDetails.lenth>120) {
    this.errors.push("You should write short details within 120 characters.")
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
      videoLink:null,
      topic:null,
      title:null,
      shortDetails:null,
      status:"created",//created,votted,activityDone,submitted,received,edited,published
      leaders:this.neededData.leaders,
      postControllerDetails:postControllerDetails,
      videoEditorDetails:null,
      allActivityPerticipents:[],
      activityDates:{
        createdDate:new Date(),
        votingResultDate:null,
        activityDate:null,
        submissionDate:null,
        receivedDate:null,
        editingDate:null,
        publishedDate:null,
        votingLastDate:null
      },
      activityHandler:{
        type:"creator",//creator,editor
        handler:this.creatorData,
        lastDate:new Date()
      }
    }
    
    if(this.data.topicSelectedBy=="leader"){
      this.activityData.topic=this.data.topic
      this.activityData.title=this.data.title
      this.activityData.shortDetails=this.data.shortDetails
      this.activityData.activityDates.activityDate=new Date(this.data.activityDate)
    }else if(this.data.topicSelectedBy=="voting"){
      console.log("i am in voting section")
      let voting=new Voting(this.neededData,this.data.votingLastDate)
      let votingId=await voting.createTopicVotingPole()
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
            let dataToPostController={
              activityId:createdActivity.insertedId,
              activityType:this.neededData.from,
              sourceName:this.neededData.sourceName,
              createdDate:this.activityData.activityDates.createdDate
            }
            console.log("Created activity :",createdActivity)
            //update activity creating source's present activity field
            await this.updatePresentActivityFieldBySource(activityData)
            //push activityId to postController's profile
            await OfficialUsers.addAcivityOnPostControllerAccount(dataToPostController)
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


Activity.updateActivityDataAfterVoteResult=function(id,wonTopic){
  return new Promise(async (resolve, reject) => { 
    try{
      console.log("I am here buddy")
      // let status="votted"
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

module.exports=Activity