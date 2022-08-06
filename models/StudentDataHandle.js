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
  resolve()
  }catch{
    console.log(" error on addVotingPoleIdOnVoterAccount")
    reject("There is some problem.")
  }
})
}






//*********************--NOTICE--**********************/

//Functionality has not created yet
StudentDataHandle.addActivityGroupIdOnMemberAccount=async function(){
 //member regNumber
 return new Promise(async (resolve, reject) => { 
  try{
    await studentDataCollection.updateOne(
      {regNumber:regNumber},
      {
        $push:{
          activityGroupIds:poleId
        }
      })
  resolve()
  }catch{
    console.log(" error on addActivityGroupIdOnMemberAccount")
    reject("There is some problem.")
  }
})
}

StudentDataHandle.removeeActivityGroupIdFromMemberAccount= function(regNumber,poleId){
 //member regNumber
 return new Promise(async (resolve, reject) => { 
  try{
    await studentDataCollection.updateOne(
      {regNumber:regNumber},
      {
        $pull:{
          activityGroupIds:poleId
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