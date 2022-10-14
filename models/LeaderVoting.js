const Department = require("./Department")
const GetAllMembers = require("./GetAllMembers")
const GlobalNotifications = require("./GlobalNotifications")
const Group = require("./Group")
const OtherOperations = require("./OtherOperations")
const SessionBatch = require("./SessionBatch")
const SourceNotifications = require("./SourceNotifications")
const StudentDataHandle = require("./StudentDataHandle")

const votingCollection = require("../db").db().collection("VotingPoles")

let LeaderVoting=function(sourceData,createdFrom){
  this.sourceData=sourceData
  this.createdFrom=createdFrom//"byLeader/auto"
  this.votingPoleData
  this.votingDates
}
// let sourceData={
//   from:"",
//   sourceId:"",
//   sourceName:"",
//   leaders:{},
// }

LeaderVoting.prototype.getPoleData=function(){
  let assistantLead=null
  let mainLead={
    userName:this.sourceData.leaders.mainLead.userName,
    regNumber:this.sourceData.leaders.mainLead.regNumber,
  }
  if(this.sourceData.leaders.assistantLead){
    assistantLead={
      userName:this.sourceData.leaders.assistantLead.userName,
      regNumber:this.sourceData.leaders.assistantLead.regNumber,
    }
  }
  
  this.votingPoleData={
    voteType:"leader_selection",
    voteFrom:this.createdFrom,
    from:this.sourceData.from,
    sourceId:this.sourceData.sourceId,
    sourceName:this.sourceData.sourceName,
    leaders:{
      mainLead:mainLead,
      assistantLead:assistantLead
    },
    nominationTakers:[],
    voters:[],
    result:[],
    wonLeader:{},
    votingDates:{
      createdDate:new Date(),
      nominationLastDate:null,
      votingLastDate:null,
      //resultDate:null,this field will be on table during result declaration
      //acceptanceDate:date
    },
    resultDeclaration:{
      declarationType:null,//auto,byLeader,
      declaredBy:null
    },
    isResultDeclared:false,
    isWonLeaderAccept:false,
    leaderSetGole:null,//during acceptance as a leader 
  }
  
  let gapDays
  if(this.sourceData.from=="batch"){
    gapDays=2
  }else if(this.sourceData.from=="department"){
    gapDays=3
  }else if(this.sourceData.from=="group"){
    gapDays=4
  }
  let today = new Date();
  let result1 = today.setDate(today.getDate() + gapDays);
  let nominationLastDate=new Date(result1)
  let result2 = today.setDate(today.getDate() + gapDays);
  let votingLastDate=new Date(result2)
  this.votingDates={
    createdDate:new Date(),
    nominationLastDate:nominationLastDate,
    votingLastDate:votingLastDate
  }
  this.votingPoleData.votingDates=this.votingDates
}

LeaderVoting.prototype.updateLeaderVotingPoleDataOnSource=function(poleId){
  return new Promise(async (resolve, reject) => { 
    try{
      
      if(this.votingPoleData.from=="batch"){
        await SessionBatch.updateLeaderVotingPoleData(this.votingPoleData.sourceId,poleId,this.votingDates)
      }else if(this.votingPoleData.from=="department"){
        await Department.updateLeaderVotingPoleData(this.votingPoleData.sourceId,poleId,this.votingDates)
      }else if(this.votingPoleData.from=="group"){
        await Group.updateLeaderVotingPoleData(this.votingPoleData.sourceId,poleId,this.votingDates)
      }
      resolve()
    }catch{
      console.log("error updateLeaderVotingPoleDataOnSource")
      reject()
    }
  })
}

LeaderVoting.prototype.createLeaderVotingPole=function(createdBy){
  return new Promise(async (resolve, reject) => { 
    try{
      this.getPoleData()
      if(this.createdFrom=="byLeader"){
        this.votingPoleData.createdBy=createdBy
      }
      //console.log("This.votingPoleData :",this.votingPoleData)

      let createdPole=await votingCollection.insertOne(this.votingPoleData)
        if(createdPole.acknowledged){
          console.log("here i am! id:",createdPole.insertedId)
          await this.updateLeaderVotingPoleDataOnSource(createdPole.insertedId)
          console.log("votingPoleData :",this.votingPoleData)
          //sent source notification
          await SourceNotifications.leaderVotingGoingOn(createdPole.insertedId,this.votingPoleData.sourceId,this.votingPoleData.from)
          resolve(createdPole.insertedId)
        }else{
          console.log("createLeaderVotingPole reject part")
          reject()
        }
    }catch{
      console.log("error createLeaderVotingPole")
      reject()
    }
  })
}

LeaderVoting.getNominationOnVotingPortal=function(poleId,nominator){
  return new Promise(async (resolve, reject) => { 
    try{
      await votingCollection.updateOne({_id:poleId},{
        $push:{
          nominationTakers:nominator
        }
      })
      //add voting pole id on nominators account as nominated
      await StudentDataHandle.addNominationTakenPoleIdOnCandidateAccount(nominator.regNumber,poleId)
      resolve()
    }catch{
      console.log("error getNominationOnVotingPortal")
      reject()
    }
  })
}

LeaderVoting.giveLeaderVote=function(id,votingData){
  return new Promise(async (resolve, reject) => { 
    try{
      await votingCollection.updateOne({_id: id},{
        $push:{
          voters:votingData
        }
      })
      //add pole id on voters account as voted
      await StudentDataHandle.addVotingPoleIdOnVoterAccount(votingData.regNumber,id,"leaderVote")
      resolve()
    }catch{
      reject()
    }
  })
}

LeaderVoting.updateResultOnLeaderVotingPole=function(id,resultData,resultDeclarationData,data){
  return new Promise(async (resolve, reject) => { 
    try{
      let wonLeader=data.wonLeader
      await votingCollection.updateMany({_id: id},{
        $set:{
          "result":resultData,
          "wonLeader":wonLeader,
          "votingDates.resultDate":new Date(),
          "isResultDeclared":true,
          "resultDeclaration":resultDeclarationData,
        }
      })
      //--sent notification as voting result published
      //get all members regNumber array to sent notification
      let allMembers=await GetAllMembers.getAllSourceMembers(data.sourceId,data.source)
      await Notification.newLeaderSelectionResultPublishedToAllSourceMembers(allMembers,id,data.source)
      //add winning pole id on winner candidate's account
      await StudentDataHandle.addWinningPoleIdOnWinnerAccount(data.wonLeader.regNumber,data.source,id)
      //--sent global Notification
      await GlobalNotifications.newLeaderVotingResultPublished(id,data)
      //--sent source notification
      await SourceNotifications.leaderResultPublished(id,data.sourceId,data.source)
      console.log("Successfully ran this")
      resolve()
    }catch{
      console.log("Error updateResultOnVotingPole")
      reject()
    }
  })
}


LeaderVoting.updateSourceLeaderVotingDataField=function(data){
  return new Promise(async (resolve, reject) => { 
    try{
      console.log("Data:",data)
     if(data.source=="batch"){
      console.log("ran on batch")
      await SessionBatch.updateLeaderVotingDataAfterResultDeclaration(data.sourceId,data.wonLeader)
     }else if(data.source=="department"){
       console.log("this should ran")
      await Department.updateLeaderVotingDataAfterResultDeclaration(data.sourceId,data.wonLeader)
     }else if(data.source=="group"){
      console.log("ran on group")
      await Group.updateLeaderVotingDataAfterResultDeclaration(data.sourceId,data.wonLeader)
     }
      resolve()
    }catch{
      console.log("Error on updateSourceLeaderVotingDataField")
      reject()
    }
  })
}

LeaderVoting.declareLeaderResultByLeader=function(votingDetails,resultData,resultDeclarationData){
  return new Promise(async (resolve, reject) => { 
    try{
      let data={
        source:votingDetails.from,
        sourceId:votingDetails.sourceId,
        sourceName:votingDetails.sourceName,
        wonLeader:{
          regNumber:votingDetails.nominationTakers[resultData[0].leaderIndex].regNumber,
          userName:votingDetails.nominationTakers[resultData[0].leaderIndex].userName
        }
      }
      
      console.log("Data :",data)
      //update voting deatils in voting pole
      await LeaderVoting.updateResultOnLeaderVotingPole(votingDetails._id,resultData,resultDeclarationData,data)
      //update leaderVotingData field value on source
      await LeaderVoting.updateSourceLeaderVotingDataField(data)
      resolve()
    }catch{
      reject()
    }
  })
}


LeaderVoting.deaclreLeaderVotingPoleResultAutomatically=function(votingDetails){
  return new Promise(async (resolve, reject) => { 
    try{
      let data
      let resultData
      if(votingDetails.nominationTakers.length){
        resultData=OtherOperations.getVotingResultData(votingDetails,"leaderResult")
        data={
          source:votingDetails.from,
          sourceId:votingDetails.sourceId,
          wonLeader:{
            regNumber:votingDetails.nominationTakers[resultData[0].leaderIndex].regNumber,
            userName:votingDetails.nominationTakers[resultData[0].leaderIndex].userName
          }
        }
      }else{//if no one has nominated then this section will run
        data={
          source:votingDetails.from,
          sourceId:votingDetails.sourceId,
          wonLeader:{
            regNumber:votingDetails.leaders.mainLead.regNumber,
            userName:votingDetails.leaders.mainLead.userName
          }
        }
        resultData="No one has nominated for this voting pole.So present leader will remain as a leader until next vote."
      }

      let resultDeclarationData={
        declarationType:"auto",
      }
      //update voting pole data
      await LeaderVoting.updateResultOnLeaderVotingPole(votingDetails._id,resultData,resultDeclarationData,data)
      //update leaderVotingData field value on source
      await LeaderVoting.updateSourceLeaderVotingDataField(data)
      
      resolve()
    }catch{
      reject()
    }
  })
}

LeaderVoting.updateVotingSourceDataDuringAcceptance=function(votingDetails,newLeaderData,departmentName){
  return new Promise(async (resolve, reject) => { 
    try{
      if(votingDetails.from=="batch"){
        await SessionBatch.makeSessionBatchPresentLeader(votingDetails.sourceId,newLeaderData)
      }else if(votingDetails.from=="department"){
        await Department.makeDepartmentPresentLeader(votingDetails.sourceId,newLeaderData)
      }else if(votingDetails.from=="group"){
        //new leaderData should contain departmentName
        newLeaderData.departmentName=departmentName
        await Group.makeGroupPresentLeader(votingDetails.sourceId,newLeaderData)
      }else{
        console.log("Some problem on votingDetails.from")
      }
      resolve()
    }catch{
      reject()
    }
  })
}


LeaderVoting.acceptSelfAsLeader=function(votingDetails,newLeaderData,departmentName){
  return new Promise(async (resolve, reject) => { 
    try{
      if(newLeaderData.gole=="" || typeof newLeaderData.gole!="string"){
        reject("You should set your gole as a new leader.")
      }else{
        await votingCollection.updateMany({_id: votingDetails._id},{
          $set:{
            "isWonLeaderAccept":true,
            "leaderSetGole":newLeaderData.gole,
            "votingDates.acceptanceDate":new Date(),
          }
        })
        await LeaderVoting.updateVotingSourceDataDuringAcceptance(votingDetails,newLeaderData,departmentName)
        resolve()
      }
    }catch{
      reject()
    }
  })
}

LeaderVoting.getLeaderVotingPoleByArrayOfPoleIds=function(poleIds){
  return new Promise(async (resolve, reject) => { 
    try{
      let allVotingPoles=await votingCollection.find({_id:{ $in:poleIds }}).toArray()
      allVotingPoles=allVotingPoles.map((pole)=>{
        let poleData={
          _id:pole._id,
          voteFrom:pole.voteFrom,
          from:pole.from,
          sourceId:pole.sourceId,
          sourceName:pole.sourceName,
          votingDates:pole.votingDates
        }
        return poleData
      })
      resolve(allVotingPoles)
    }catch{
      reject()
    }
  })
}

module.exports=LeaderVoting

//result by leader
//update result on voting pole
//get declared by leader name on pole
//


//auto result will be declared when the time will out forvoting last date
//check if there any nominator or not,if not declare present leader as next leader
//if only nomination with no vote ,declare the the first user as leader
//