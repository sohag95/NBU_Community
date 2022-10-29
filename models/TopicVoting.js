const OfficialUsers = require("./OfficialUsers")
const { ObjectId } = require("mongodb")
const SessionBatch = require("./SessionBatch")
const Department = require("./Department")
const Group = require("./Group")
const Activity = require("./Activity")
const AddCreditPoints = require("./AddCreditPoints")
const GetAllMembers = require("./GetAllMembers")
const SourceNotifications = require("./SourceNotifications")
const StudentDataHandle = require("./StudentDataHandle")
const votingCollection = require("../db").db().collection("VotingPoles")
const activityCollection = require("../db").db().collection("Activities")

let TopicVoting=function(data,lastDate){
  this.data=data
  this.lastDate=lastDate
  this.errors=[]
}
// Needed data as data : {for topic voting 
//   from: 'department',
//   sourceId: 'COMSC',
//   sourceName: 'Computer Science',
//   leaders: {
//     mainLead: { regNumber: '2122COMSC0001', userName: 'Sohag Roy' },
//     assistantLead: null
//   }
// }

//##################################
//Topic voting pole created during creation of activity by checking topicSelectedBy=voting
//##################################
TopicVoting.prototype.getTopicVotingData=async function(){
  try{
    console.log("getTopicVotingData function ran")
    let allTopics=await OfficialUsers.getAllActivityTopics()
    let topics=[]
    if(this.data.from=="batch"){
      topics=allTopics.batchTopics
    }else if(this.data.from=="department"){
      topics=allTopics.departmentTopics
    }else if(this.data.from=="group"){
      topics=allTopics.groupTopics
    }
    console.log("All topics :",allTopics)
    console.log("Topics :",topics)
    this.data={
      voteType:"topic_selection",
      activityId:this.data.activityId,
      from:this.data.from,//should be voteFrom
      sourceId:this.data.sourceId,
      sourceName:this.data.sourceName,
      //activityId:null,I might store this variable as well later
      topicOptions:topics,
      leaders:this.data.leaders,
      voters:[],
      result:[],
      votingDates:{
        createdDate:new Date(),
        votingLastDate:new Date(this.lastDate),
        resultDate:null
      },
      resultDeclared:false,
      resultDeclaredBy:null,
    }
    console.log("Voting Data :",this.data)
  }catch{
    console.log("Problem fatched")
    this.errors.push("There is some problem.")
  }
}

TopicVoting.prototype.createTopicVotingPole=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      console.log("createTopicVotingPole function ran")
      await this.getTopicVotingData()
      if(!this.errors.length){
        let createdPole=await votingCollection.insertOne(this.data)
        if(createdPole.acknowledged){
          resolve(createdPole.insertedId)
        }else{
          reject()
        }
      }else{
        reject()
      }
    }catch{
      reject()
    }
  })
}

TopicVoting.getVotingDetailsById=function(id){
  return new Promise(async (resolve, reject) => { 
    try{
      let votingDetails=await votingCollection.findOne({_id: new ObjectId(id)})
      if(votingDetails){
        resolve(votingDetails)
      }else{
        reject()
      }
    }catch{
      reject()
    }
  })
}


TopicVoting.storeActivityIdOnVotingPole=function(poleId,activityId){
  return new Promise(async (resolve, reject) => { 
    try{
      console.log("Pole id :",poleId," | activity id :",activityId)
      await votingCollection.updateOne({_id: new ObjectId(poleId)},{
        $set:{
          activityId:activityId
        }
      })
      resolve()
    }catch{
      crossOriginIsolated.log("error from storeActivityIdOnVotingPole")
      reject()
    }
  })
}

TopicVoting.giveTopicVote=function(id,votingData){
  return new Promise(async (resolve, reject) => { 
    try{
      await votingCollection.updateOne({_id: new ObjectId(id)},{
        $push:{
          voters:votingData
        }
      })
      //add pole id on voters account as voted
      await StudentDataHandle.addVotingPoleIdOnVoterAccount(votingData.regNumber,new ObjectId(id),"topicVote")
      resolve()
    }catch{
      reject()
    }
  })
}

TopicVoting.updateResultOnVotingPole=function(id,resultData,declaredBy){
  return new Promise(async (resolve, reject) => { 
    try{
      await votingCollection.updateMany({_id: new ObjectId(id)},{
        $set:{
          "result":resultData,
          "votingDates.resultDate":new Date(),
          "resultDeclared":true,
          "resultDeclaredBy":declaredBy,
        }
      })
      console.log("Successfully ran this")
      resolve()
    }catch{
      console.log("Error updateResultOnVotingPole")
      reject()
    }
  })
}

TopicVoting.updateSourcePresentActivityField=function(data){
  return new Promise(async (resolve, reject) => { 
    try{
      console.log("Data:",data)
     if(data.source=="batch"){
      console.log("ran on batch")
      await SessionBatch.updatePresentActivityFieldAfterResultDeclaration(data.sourceId,data.wonTopic)
     }else if(data.source=="department"){
       console.log("this should ran")
      await Department.updatePresentActivityFieldAfterResultDeclaration(data.sourceId,data.wonTopic)
     }else if(data.source=="group"){
      console.log("ran on group")
      await Group.updatePresentActivityFieldAfterResultDeclaration(data.sourceId,data.wonTopic)
     }
      resolve()
    }catch{
      console.log("Error on updateSourcePresentActivityField")
      reject()
    }
  })
}

TopicVoting.declareTopicResult=function(votingDetails,resultData,declaredBy,activityId){
  return new Promise(async (resolve, reject) => { 
    try{
      let data={
       source:votingDetails.from,
       sourceId:votingDetails.sourceId,
       wonTopic:votingDetails.topicOptions[resultData[0].topicIndex]
      }
      console.log("Data :",data)
      console.log("Won topic :",data.wonTopic)
      console.log("Activity id:",activityId)
      //update voting deatils in voting pole
      await TopicVoting.updateResultOnVotingPole(votingDetails._id,resultData,declaredBy,data.wonTopic)
      //update activity fields
      //update present activity field value on source
      await TopicVoting.updateSourcePresentActivityField(data)
      //await Activity.updateActivityDataAfterVoteResult(activityId,data.wonTopic)
      //belowed functionshould be in Activity function page
      await activityCollection.updateMany({_id: new ObjectId(activityId)},{
          $set:{
            "isVoteCompleted":true,
            "topic":data.wonTopic,
            "status":"voted",
            "activityDates.votingResultDate":new Date()
          }
        })
      //get all members regNumber array to sent NOTIFICATION
      let allMembers=await GetAllMembers.getAllSourceMembers(this.activityData.activitySourceId,this.activityData.activityType)
      await Notification.activityTopicSelectionResultPublishedToAllSourceMembers(allMembers,activityId,data.source,data.wonTopic)
      //sent source notification
      await SourceNotifications.topicResultPublished(String(votingDetails._id),this.activityData.activitySourceId)
      resolve()
    }catch{
      reject()
    }
  })
}

TopicVoting.deleteVotingPole=function(id){
  return new Promise(async (resolve, reject) => { 
    try{
      //before deletion we must decrease credit points of students those are participated
      await votingCollection.deleteOne({_id: id})
      resolve()
    }catch{
      console.log("deleteVotingPole")
      reject()
    }
  })
}
module.exports=TopicVoting