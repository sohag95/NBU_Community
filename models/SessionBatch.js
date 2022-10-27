const sessionBatchesCollection = require("../db").db().collection("sessionBatches")
const departmentsCollection = require("../db").db().collection("Departments")
const Department = require("./Department")
const GetAllMembers = require("./GetAllMembers")
const IdCreation = require("./IdCreation")
const OtherOperations = require("./OtherOperations")
const SourceNotifications = require("./SourceNotifications")
const Student = require("./Student")

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
    isVoteGoingOn:false,
    leaderVotingData:null,//voting state operation handling variables
    // leaderVotingData:{
    //   votingDates:{},
    //   votingpoleId:"",
    //   wonLeader:""
    // }
    //-----------------------
    presentLeader:null,
    // presentLeader:{
    //   regNumber:"", 
    //   userName:"",
    //   phone:"",
    //   createdDate:"",This date is the activation date forthe present leader
    //   gole:"",
    //   votingPoleId:""
    // }
    previousLeader:null,
    allMembers:[],
    allLeaders:[],
    newMemberRequests:[],
    presentActivity:null,
    previousActivity:null,//contains previous activity id
    completedActivities:[],
    batchState:"1st",//values will be : 1st/2nd/3rd/seniours/X
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
        await SourceNotifications.createSourceNotificationTable(this.data.batchId)
        resolve()
      }else{
        reject("This batch has been created already!!")
      }
    }catch{
      reject("There is some problem!!")
    }
  })
}

//updation of batchState
SessionBatch.updateBatchState= function(batchId,state){
  return new Promise(async (resolve, reject) => {
    try{
        await sessionBatchesCollection.updateOne(
          { batchId: batchId },
          {
            $set: {
              "batchState": state
            }
          }
        )
        let allMembers=await GetAllMembers.getAllMembersFromBatch(batchId)
        if(allMembers.length){
          await Student.setStudentsBatchState(allMembers,state)
        }
        
      resolve()
    }catch{
      reject()
    }
  })
}

SessionBatch.updateBatchStateAfterAddingNewBatch= function(newActiveBatches){
  return new Promise(async (resolve, reject) => {
    try{
      if(newActiveBatches.fristYear){
        await SessionBatch.updateBatchState(newActiveBatches.fristYear.batchId,"1st")
      }
      if(newActiveBatches.secondYear){
        await SessionBatch.updateBatchState(newActiveBatches.secondYear.batchId,"2nd")
      }
      if(newActiveBatches.thirdYear){
        await SessionBatch.updateBatchState(newActiveBatches.thirdYear.batchId,"3rd")
      }
      if(newActiveBatches.seniours){
        await SessionBatch.updateBatchState(newActiveBatches.seniours.batchId,"seniour")
      
      }
      resolve()
    }catch{
      reject()
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

SessionBatch.makeSessionBatchPresentLeader= function(batchId,newLeaderData){
  return new Promise(async (resolve, reject) => {
    try{
      //1.leader is very first,during varification
      //2.selected new leader
      //3.as no one nominated present leader will remain same only change date
      let newLeader=true
      let batchDetails=await sessionBatchesCollection.findOne({batchId:batchId})
      let newPreviousLeader=batchDetails.presentLeader
      if(batchDetails.allLeaders.length){
        batchDetails.allLeaders.forEach((leader)=>{
          if(leader.regNumber==newLeaderData.regNumber){
            newLeader=false
          }
        })
      }
      //update new leader data
      await sessionBatchesCollection.updateOne(
        { batchId: batchId },
        {
          $set: {
            "presentLeader": newLeaderData,
            "isVoteGoingOn":false,
            "leaderVotingData":null,
          }
        }
      )
      //in case of same present leader again,previous leader will remain same also
      if(batchDetails.presentLeader){//during case1 verification presentLeader is null
        if(batchDetails.presentLeader.regNumber!=newLeaderData.regNumber){
          await sessionBatchesCollection.updateOne(
            { batchId: batchId },
            {
              $set: {
                previousLeader: newPreviousLeader
              }
            }
          )
        }
      } 
      if(newLeader){
        //"pushing data on batche's all leaders"
        let leaderData={
          regNumber:newLeaderData.regNumber,
          userName:newLeaderData.userName,
        }
        await sessionBatchesCollection.updateOne(
          { batchId: batchId },
          {
            $push: {
              "allLeaders": leaderData
            }
          }
        )
        //add new leader as a department member
        //this section should be called as function from department class 
        let memberInfo={
          regNumber:leaderData.regNumber,
          userName:leaderData.userName,
          createdDate:new Date()
        }
        await departmentsCollection.updateOne(
          {departmentCode:batchId.slice(4,9)},
          {
            $push:{
              "allPresentMembers":memberInfo
            }
          }
        )
      }
      console.log("comleted properly")
      resolve()
    }catch{
      reject()
    }
  })
}


SessionBatch.addOnBatchPresentMembers= function(batchId,studentData){
  return new Promise(async (resolve, reject) => {
    try{
        let studentInfo={
          regNumber:studentData.regNumber,
          userName:studentData.userName,
          createdDate:new Date()
        }
        await sessionBatchesCollection.updateOne(
          { batchId: batchId },
          {
            $push: {
              "allMembers": studentInfo
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

///no need of this function any more
// SessionBatch.getAllAvailableActivityMemberFromBatch= function(batchId){
//   return new Promise(async (resolve, reject) => {
//     try{
//       let batchDetails=await SessionBatch.findSessionBatchDetailsByBatchId(batchId)
//       let allMembers=batchDetails.allMembers.map((member)=>{
//         return {
//           regNumber:member.regNumber,
//           userName:member.userName
//         }
//       })
//       resolve(allMembers)
//     }catch{
//       reject()
//     }
//   })
// }

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

SessionBatch.updatePresentActivityFieldAfterDeletion= function(batchId){
  return new Promise(async (resolve, reject) => {
    try{
        await sessionBatchesCollection.updateOne(
          { batchId: batchId },
          {
            $set: {
              "presentActivity":null,
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
              "previousActivity":id
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
      
      let votingData={
        votingPoleId:poleId,
        votingDates:votingDates,
        wonLeader:null
      }
      
        await sessionBatchesCollection.updateOne(
          { batchId: batchId },
          {
            $set: {
              "isVoteGoingOn":true,
              "leaderVotingData":votingData,
            }
          }
        )

        console.log("updateLeaderVotingPoleData run")
      resolve()
    }catch{
      console.log("updateLeaderVotingPoleData error run")
      reject()
    }
  })
}

SessionBatch.updateLeaderVotingDataAfterResultDeclaration= function(batchId,wonLeader){
  return new Promise(async (resolve, reject) => {
    try{
        await sessionBatchesCollection.updateOne(
          { batchId: batchId },
          {
            $set: {
              "leaderVotingData.wonLeader": wonLeader,
              "leaderVotingData.votingDates.resultDate":new Date()
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