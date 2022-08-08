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

AddCreditPoints.creditToWinningLeaderByVote=function(regNumber,leaderType){
  return new Promise(async (resolve, reject) => {
    try{
      let points
      if(leaderType=="batch"){
        points=10
      }else if(leaderType=="department"){
        points=15
      }else{
        points=20
      }
      await studentsCollection.updateOne(
        {regNumber:regNumber},
        {
          $inc:{
            creditPoints:points
        }})
        await Notification.creditToWinningLeaderByVote(regNumber,points)
      resolve()
    }catch{
      console.log("error on creditToWinningLeaderByVote")
      reject()
    }
  })
}

AddCreditPoints.creditToAllActivityParticipants=function(regNumbers){
  return new Promise(async (resolve, reject) => {
    try{
      let points=10
      await studentsCollection.updateMany(
        {regNumber:{$in:regNumbers}},
        {
          $inc:{
            creditPoints:points
        }},{ multi: true })
      await Notification.creditToAllActivityParticipants(regNumbers,points)
      resolve()
    }catch{
      console.log("error on creditToAllActivityParticipants")
      reject()
    }
  })
}

AddCreditPoints.creditToActivityLeaders=function(regNumbers){
  return new Promise(async (resolve, reject) => {
    try{
      let points=15
      await studentsCollection.updateMany(
        {regNumber:{$in:regNumbers}},
        {
          $inc:{
            creditPoints:points
        }},{ multi: true })
      await Notification.creditToAllActivityParticipants(regNumbers,points)
      resolve()
    }catch{
      console.log("error on creditToActivityLeaders")
      reject()
    }
  })
}

module.exports=AddCreditPoints
