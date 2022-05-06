const Department = require("./Department")
const Group = require("./Group")
const SessionBatch = require("./SessionBatch")

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
  this.votingPoleData={
    voteType:"leader_selection",
    voteFrom:this.createdFrom,
    from:this.sourceData.from,
    sourceId:this.sourceData.sourceId,
    sourceName:this.sourceData.sourceName,
    leaders:this.sourceData.leaders,
    nominationTakers:[],
    voters:[],
    result:[],
    wonLeader:"",
    votingDates:{
      createdDate:new Date(),
      nominationLastDate:null,
      votingLastDate:null,
      //resultDate:null,this field will be on table during result declaration
    },
    resultDeclaration:{
      declarationType:null,//auto,byLeader,
      declaredBy:null
    },
    isResultDeclared:false,
    isWonLeaderAccept:false,
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
      }else if(this.votingPoleData=="department"){
        await Department.updateLeaderVotingPoleData(this.votingPoleData.sourceId,poleId,this.votingDates)
      }else if(this.createLeaderVotingPole=="group"){
        await Group.updateLeaderVotingPoleData(this.votingPoleData.sourceId,poleId,this.votingDates)
      }
      resolve()
    }catch{
      console.log("error createLeaderVotingPole")
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
      let createdPole=await votingCollection.insertOne(this.votingPoleData)
        if(createdPole.acknowledged){
          await this.updateLeaderVotingPoleDataOnSource(createdPole.insertedId)
          resolve()
        }else{
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
      resolve()
    }catch{
      reject()
    }
  })
}



LeaderVoting.declareLeaderResultByLeader=function(votingDetails,resultData,declaredBy){
  return new Promise(async (resolve, reject) => { 
    try{
      // let data={
      //  source:votingDetails.from,
      //  sourceId:votingDetails.sourceId,
      //  wonTopic:votingDetails.topicOptions[resultData[0].topicIndex]
      // }
      // console.log("Data :",data)
      // console.log("Won topic :",data.wonTopic)
      // console.log("Activity id:",activityId)
      // //update voting deatils in voting pole
      // await TopicVoting.updateResultOnVotingPole(votingDetails._id,resultData,declaredBy,data.wonTopic)
      // //update activity fields
      // //update present activity field value on source
      // await TopicVoting.updateSourcePresentActivityField(data)
      // //await Activity.updateActivityDataAfterVoteResult(activityId,data.wonTopic)
      // //belowed functionshould be in Activity function page
     
      resolve()
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