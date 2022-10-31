const Notification = require("./Notification")
const studentsCollection = require("../db").db().collection("Students")

let AddCreditPoints=function(data){
  this.data=data
}

AddCreditPoints.creditAfterTopicVoteToVoter=function(regNumber){
  return new Promise(async (resolve, reject) => {
    try{
      let points=2
      await studentsCollection.updateOne(
        {regNumber:regNumber},
        {
          $inc:{
            creditPoints:points
        }})
      await Notification.creditAfterTopicVoteToVoter(regNumber,points)
      resolve()
    }catch{
      console.log("error on creditAfterTopicVoteToVoter")
      reject()
    }
  })
}

AddCreditPoints.creditAfterGattingNominationToNominator=function(regNumber){
  return new Promise(async (resolve, reject) => {
    try{
      let points=5
      await studentsCollection.updateOne(
        {regNumber:regNumber},
        {
          $inc:{
            creditPoints:points
        }})
        await Notification.creditAfterGattingNominationToNominator(regNumber,points)
      resolve()
    }catch{
      console.log("error on creditAfterGattingNominationToNominator")
      reject()
    }
  })
}

AddCreditPoints.creditAfterLeaderVoteToVoter=function(regNumber){
  return new Promise(async (resolve, reject) => {
    try{
      let points=5
      await studentsCollection.updateOne(
        {regNumber:regNumber},
        {
          $inc:{
            creditPoints:points
        }})
      await Notification.creditAfterLeaderVoteToVoter(regNumber,points)
      resolve()
    }catch{
      console.log("error on creditAfterLeaderVoteToVoter")
      reject()
    }
  })
}

AddCreditPoints.creditToWinningLeaderByVote=function(regNumber,leaderType,poleId){
  return new Promise(async (resolve, reject) => {
    try{
      let points
      if(leaderType=="batch"){
        points=5
      }else if(leaderType=="department"){
        points=10
      }else{
        points=15
      }
      await studentsCollection.updateOne(
        {regNumber:regNumber},
        {
          $inc:{
            creditPoints:points
        }})
        await Notification.creditToWinningLeaderByVote(regNumber,leaderType,points,String(poleId))
      resolve()
    }catch{
      console.log("error on creditToWinningLeaderByVote")
      reject()
    }
  })
}

AddCreditPoints.creditToAllActivityParticipants=function(regNumbers,activityId){
  return new Promise(async (resolve, reject) => {
    try{
      let points=10
      await studentsCollection.updateMany(
        {regNumber:{$in:regNumbers}},
        {
          $inc:{
            creditPoints:points
        }},{ multi: true })
      await Notification.creditToAllActivityParticipants(regNumbers,points,activityId)
      resolve()
    }catch{
      console.log("error on creditToAllActivityParticipants")
      reject()
    }
  })
}

AddCreditPoints.creditToActivityLeaders=function(regNumbers,activityId){
  return new Promise(async (resolve, reject) => {
    try{
      let points=5
      await studentsCollection.updateMany(
        {regNumber:{$in:regNumbers}},
        {
          $inc:{
            creditPoints:points
        }},{ multi: true })
      await Notification.creditToActivityLeaders(regNumbers,points,activityId)
      resolve()
    }catch{
      console.log("error on creditToActivityLeaders")
      reject()
    }
  })
}


AddCreditPoints.addCreditPointToCampusGroupMember=function(regNumber){
  return new Promise(async (resolve, reject) => {
    try{
      let points=5
      
      await studentsCollection.updateOne(
        {regNumber:regNumber},
        {
          $inc:{
            creditPoints:points
        }})
        await Notification.creditToCampusGroupMember(regNumber,points)
      resolve()
    }catch{
      console.log("error on addCreditPointToCampusGroupMember")
      reject()
    }
  })
}

AddCreditPoints.deductCreditPointFromGroupLeavingAccount=function(regNumber,groupId,from){
  return new Promise(async (resolve, reject) => {
    try{
      let points=-5
      
      await studentsCollection.updateOne(
        {regNumber:regNumber},
        {
          $inc:{
            creditPoints:points
        }
      })
      await Notification.deductCreditToLeavingGroupMember(regNumber,points,groupId,from)
      resolve()
    }catch{
      console.log("error on deductCreditPointFromGroupLeavingAccount")
      reject()
    }
  })
}
module.exports=AddCreditPoints
