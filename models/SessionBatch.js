const IdCreation = require("./IdCreation")
const OtherOperations = require("./OtherOperations")
const sessionBatchesCollection = require("../db").db().collection("sessionBatches")

let SessionBatch=function(data){
  this.data=data
  this.created=false
}

SessionBatch.prototype.cleanUpData=function(){
  let batchId=OtherOperations.getBatchId(this.data.newSession,this.data.departmentCode)
  this.data={
    batchId:batchId,
    batchSessionYear:this.data.newSession,
    departmentName:this.data.departmentName,
    groupId:this.data.groupId,
    //voting data from bellow
    lastVoteResultDate:null,//help leader to create voting pole
    isVoteGoingOn:false,
    leaderVotingData:{},//voting state operation handling variables
    //-----------------------
    presentLeader:null,
    previousLeader:null,
    allMembers:[],
    allLeaders:[],
    newMemberRequests:[],
    presentActivity:null,
    previosActivity:null,
    completedActivities:[],
    batchState:"1stYear",//values will be : 1stYear/2ndYear/3rdYear/seniours/xBatch
    createdDate:new Date()
  }
}

SessionBatch.prototype.checkBatch=async function(){
  return new Promise(async (resolve, reject) => { 
    try{
      let isBatchCreated=await sessionBatchesCollection.findOne({batchId:this.data.batchId})
      if(isBatchCreated){
        this.created=true
      }
      resolve()
    }catch{
      reject()
    }
  })
}

SessionBatch.prototype.createSessionBatch=function(){
  return new Promise(async (resolve, reject) => {
    try{
      this.cleanUpData()
      await this.checkBatch()
      if(!this.created){
        await sessionBatchesCollection.insertOne(this.data)
        resolve()
      }else{
        reject("This batch has been created already!!")
      }
    }catch{
      reject("There is some problem!!")
    }
  })
}

SessionBatch.findSessionBatchDetailsByBatchId= function(batchId){
  return new Promise(async (resolve, reject) => {
    try{
      let batchDetails=await sessionBatchesCollection.findOne({batchId:batchId})
      if(batchDetails){
        resolve(batchDetails)
      }else{
        reject()
      }
    }catch{
      reject()
    }
  })
}

SessionBatch.findSessionBatchDetailsBySignUpData= function(sessionYear,departmentCode){
  return new Promise(async (resolve, reject) => {
    try{
      let batchId=IdCreation.getBatchId(sessionYear,departmentCode)
      let batchDetails=await sessionBatchesCollection.findOne({batchId:batchId})
      if(batchDetails){
        resolve(batchDetails)
      }else{
        resolve(null)
      }
    }catch{
      reject()
    }
  })
}



SessionBatch.sentNewStudentRequestOnBatch= function(batchId,studentData){
  return new Promise(async (resolve, reject) => {
    try{
      await sessionBatchesCollection.updateOne(
        { batchId: batchId },
        {
          $push: {
            newMemberRequests: studentData
          }
        }
      )
      resolve()
    }catch{
      reject()
    }
  })
}

SessionBatch.makeSessionBatchPresentLeader= function(batchId,studentData){
  return new Promise(async (resolve, reject) => {
    try{
      let newLeader=true
      let batchDetails=await sessionBatchesCollection.findOne({batchId:batchId})
      if(batchDetails.allLeaders.length){
        batchDetails.allLeaders.forEach((leader)=>{
          if(leader.regNumber==studentData.regNumber){
            newLeader=false
          }
        })
      }
      await sessionBatchesCollection.updateOne(
        { batchId: batchId },
        {
          $set: {
            presentLeader: studentData
          }
        }
      )
      if(newLeader){
        console.log("pushing data on batches all leaders")
        await sessionBatchesCollection.updateOne(
          { batchId: batchId },
          {
            $push: {
              allLeaders: studentData
            }
          }
        )
      }
      resolve()
    }catch{
      reject()
    }
  })
}


SessionBatch.addOnBatchMember= function(batchId,studentData){
  return new Promise(async (resolve, reject) => {
    try{
      
        await sessionBatchesCollection.updateOne(
          { batchId: batchId },
          {
            $push: {
              allMembers: studentData
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}

SessionBatch.updatePresentActivityField= function(batchId,activityData){
  return new Promise(async (resolve, reject) => {
    try{
        await sessionBatchesCollection.updateOne(
          { batchId: batchId },
          {
            $set: {
              "presentActivity": activityData
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}

SessionBatch.getAllAvailableActivityMemberFromBatch= function(batchId){
  return new Promise(async (resolve, reject) => {
    try{
      let batchDetails=await SessionBatch.findSessionBatchDetailsByBatchId(batchId)
      let allMembers=batchDetails.allMembers.map((member)=>{
        return {
          regNumber:member.regNumber,
          userName:member.userName
        }
      })
      resolve(allMembers)
    }catch{
      reject()
    }
  })
}

SessionBatch.updatePresentActivityFieldAfterResultDeclaration= function(batchId,wonTopic){
  return new Promise(async (resolve, reject) => {
    try{
        await sessionBatchesCollection.updateOne(
          { batchId: batchId },
          {
            $set: {
              "presentActivity.isVoteCompleted": true,
              "presentActivity.topic":wonTopic
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}


SessionBatch.updatePresentActivityFieldAfterEditDetails= function(batchId,data){
  return new Promise(async (resolve, reject) => {
    try{
        await sessionBatchesCollection.updateOne(
          { batchId: batchId },
          {
            $set: {
              "presentActivity.topic":data.topic,
              "presentActivity.title":data.title,
              "presentActivity.activityDate":data.activityDate
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}

SessionBatch.updatePreviousActivityFieldOnBatch= function(batchId,activityData){
  return new Promise(async (resolve, reject) => {
    try{
        let id=activityData._id
        await sessionBatchesCollection.updateOne(
          { batchId: batchId },
          {
            $set: {
              "presentActivity":null,
              "previousActivity":activityData
            },
            $push:{
              "completedActivities":id
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}


SessionBatch.updateLeaderVotingPoleData= function(batchId,poleId,votingDates){
  return new Promise(async (resolve, reject) => {
    try{
        await sessionBatchesCollection.updateOne(
          { batchId: batchId },
          {
            $set: {
              "isVoteGoingOn":true,
              "leaderVotingData.votingPoleId":poleId,
              "leaderVotingData.votingDates":votingDates
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}
module.exports=SessionBatch