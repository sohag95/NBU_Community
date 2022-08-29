const AddCreditPoints = require("./AddCreditPoints")

const studentDataCollection = require("../db").db().collection("Student_Data")


let StudentDataHandle=function(data){
  this.data=data
}

StudentDataHandle.addActivityIdOnLeadersAccount=function(regNumbers,activityId){
//  array of two leaders regNumbers=["2122COMSC0001","2122COMSC0002"]
  return new Promise(async (resolve, reject) => { 
    try{
      await studentDataCollection.updateMany(
        {regNumber:{$in:regNumbers}},
        {
          $push:{
          "activities.leadActivities":activityId
          }
        },{ multi: true })
        await AddCreditPoints.creditToActivityLeaders(regNumbers)
      resolve()
    }catch{
      console.log(" error on addActivityIdOnLeadersAccount")
      reject("There is some problem.")
    }
  })
}
  
StudentDataHandle.addActivityIdOnAllParticipantsAccount= function(participantsReg,activityId){
 //array of all Participants regNumber
  return new Promise(async (resolve, reject) => { 
    try{
      await studentDataCollection.updateMany(
        {regNumber:{$in:participantsReg}},
        {
          $push:{
          "activities.participatedActivities":activityId
          }
        },{ multi: true })
        await AddCreditPoints.creditToAllActivityParticipants(participantsReg)
    resolve()
    }catch{
      console.log(" error on addActivityIdOnAllParticipantsAccount")
      reject("There is some problem.")
    }
  })
}

StudentDataHandle.addWinningPoleIdOnWinnerAccount= function(regNumber,leadType,poleId){
 //winner regNumber\
 //leadType=batch/department/group
 return new Promise(async (resolve, reject) => { 
  try{
    let dataContainerField=""
    if(leadType=="batch"){
      dataContainerField="winningVotingPoles.batchLeader"
    }else if(leadType=="department"){
      dataContainerField="winningVotingPoles.departmentLeader"
    }else{
      dataContainerField="winningVotingPoles.groupLeader"
    }
    await studentDataCollection.updateOne(
      {regNumber:regNumber},
      {
        $push:{
          [dataContainerField]:poleId
        }
      })
    await AddCreditPoints.creditToWinningLeaderByVote(regNumber,leadType)
  resolve()
  }catch{
    console.log(" error on addWinningPoleIdOnWinnerAccount")
    reject("There is some problem.")
  }
})
}

StudentDataHandle.addNominationTakenPoleIdOnCandidateAccount= function(regNumber,poleId){
 //candidate regNumber
 return new Promise(async (resolve, reject) => { 
  try{
    await studentDataCollection.updateOne(
      {regNumber:regNumber},
      {
        $push:{
          nominationTakenPoles:poleId
        }
      })
      await AddCreditPoints.creditAfterGattingNominationToNominator(regNumber)
  resolve()
  }catch{
    console.log(" error on addNominationTakenPoleIdOnCandidateAccount")
    reject("There is some problem.")
  }
})
}

StudentDataHandle.addVotingPoleIdOnVoterAccount= function(regNumber,poleId){
 //voter regNumber
 return new Promise(async (resolve, reject) => { 
  try{
    await studentDataCollection.updateOne(
      {regNumber:regNumber},
      {
        $push:{
          voteGivenPoles:poleId
        }
      })
      await AddCreditPoints.creditAfterLeaderVoteToVoter(regNumber)
  resolve()
  }catch{
    console.log(" error on addVotingPoleIdOnVoterAccount")
    reject("There is some problem.")
  }
})
}

StudentDataHandle.getStudentOtherDataByRegNumber= function(regNumber){
  return new Promise(async (resolve, reject) => { 
   try{
     let otherData=await studentDataCollection.findOne({regNumber:regNumber})
     resolve(otherData)
   }catch{
     console.log(" error on getStudentOtherDataByRegNumber")
     reject("There is some problem.")
   }
 })
}


//Campus groups related functions
StudentDataHandle.addCampusGroupIdOnGroupMamberAccount= function(groupId,regNumber){
  //member regNumber
  return new Promise(async (resolve, reject) => { 
   try{
     await studentDataCollection.updateOne(
       {regNumber:regNumber},
       {
         $push:{
           campusGroupIds:groupId
         }
       })
     resolve()
   }catch{
     console.log(" error on addCampusGroupIdOnGroupMamberAccount")
     reject("There is some problem.")
   }
 })
 }

 StudentDataHandle.removeCampusGroupIdFromGroupMamberAccount= function(groupId,regNumber){
  //member regNumber
  return new Promise(async (resolve, reject) => { 
   try{
     await studentDataCollection.updateOne(
       {regNumber:regNumber},
       {
         $pull:{
           campusGroupIds:groupId
         }
       })
     resolve()
   }catch{
     console.log(" error on removeCampusGroupIdFromGroupMamberAccount")
     reject("There is some problem.")
   }
 })
 }
StudentDataHandle.removeCampusGroupIdFromMemberAccount= function(groupId,regNumber){
 //member regNumber
 return new Promise(async (resolve, reject) => { 
  try{
    await studentDataCollection.updateOne(
      {regNumber:regNumber},
      {
        $pull:{
          campusGroupIds:groupId
        }
      })
    resolve()
  }catch{
    console.log(" error on removeeActivityGroupIdFromMemberAccount")
    reject("There is some problem.")
  }
})
}


module.exports=StudentDataHandle