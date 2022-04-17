const activiyCollection = require("../db").db().collection("Activities")

let Activity=function(data,creatorData,neededData){
  this.data=data
  this.creatorData=creatorData
  this.neededData=neededData
  this.activityDate
  this.errors=[]
}

Activity.prototype.cleanUpData=function(){
  if (typeof this.data.topicSelectedBy != "string") {
    this.data.topicSelectedBy=""
  }
  if(this.data.topicSelectedBy=="leader"){
    if (typeof this.data.topic != "string") {
      this.data.topic=""
    }
    if (typeof this.data.title != "string") {
      this.data.title=""
    }
    if (typeof this.data.shortDetails != "string") {
      this.data.shortDetails=""
    }
  }
}

Activity.prototype.validateData=function(){
  if (this.data.topicSelectedBy == "") {
    this.errors.push("You must select topic selector.")
  }
  if(this.data.topicSelectedBy=="leader"){
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
  }
}

Activity.prototype.getActivityData=function(){

  this.activityData={
    activityType:"",
    activitySourceId:null,//batchId,departmentCode,groupId
    sourceName:null,//for batch={departmentName(batch session)},department=departmentName,group=groupName
    isTopicByVote:false,
    isTopicByLeader:false,
    videoLink:null,
    title:null,
    shortDetails:null,
    votingId:null,
    status:null,//created,votted,activityDone,submitted,received,editting,published
    leaders:{},
    postControllerDetails:null,
    videoEditorDetails:null,
    allPerticipents:[],
    activityDates:{
      createdDate:new Date(),
      votingDate:null,
      activityDate:null,
      submissionDate:null,
      receivedDate:null,
      editingDate:null,
      publishedDate:null
    },
    activityHandler:{
      type:"creator",
      handler:{},
      lastDate:new Date()
    }
  }

}

Activity.prototype.createNewActivity=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      
      resolve()
    }catch{
      reject()
    }
  })
}
module.exports=Activity