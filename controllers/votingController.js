const OtherOperations = require("../models/OtherOperations")
const TopicVoting = require("../models/TopicVoting")
const LeaderVoting = require("../models/LeaderVoting")
const SessionBatch = require("../models/SessionBatch")
const Department = require("../models/Department")
const Group = require("../models/Group")

exports.ifVotingPoleExists =async function (req, res,next) {
  try{
    let votingDetails=await TopicVoting.getVotingDetailsById(req.params.id)
    if(votingDetails){
      req.votingDetails=votingDetails
      next()
    }else{
      res.render("404")
    }
  }catch{
    req.flash("errors", "Sorry,there is some problem!! Try again later.")
    req.session.save( () =>{
      res.redirect(`/activity/${req.params.id}/details`)
    })
  }
}

//Topic voting functionalities
exports.giveTopicVote = function (req, res) {
    let votingData={
      regNumber:req.regNumber,
      userName:req.userName,
      votingIndex:Number(req.body.topicIndex)
    }
    console.log("Voting Data:",votingData)
    req.votingDetails=undefined
    TopicVoting.giveTopicVote(req.params.id,votingData).then(()=>{
      req.flash("success", "Thank you for your vote.")
      req.session.save( () =>{
        res.redirect(`/activity/${req.params.activityId}/details`)
      })
    }).catch((e)=>{
      req.flash("errors", "Sorry,there is some problem!! Try again later.")
      req.session.save( () =>{
        res.redirect(`/activity/${req.params.activityId}/details`)
      })
    })
}


exports.declareTopicResult = function (req, res) {
  let declaredBy={
    regNumber:req.regNumber,
    userName:req.userName
  }
  let resultData=OtherOperations.getVotingResultData(req.votingDetails,"topicResult")
  console.log("Result data :",resultData)
  //have to work................
  let activityId=req.params.activityId
  TopicVoting.declareTopicResult(req.votingDetails,resultData,declaredBy,activityId).then(()=>{
    req.votingDetails=undefined
    req.flash("success", "Result successfully declared.")
    req.session.save( () =>{
      res.redirect(`/activity/${req.params.activityId}/details`)
    })
  }).catch(()=>{
    req.flash("errors", "There is some problem.")
    req.session.save( () =>{
      res.redirect(`/activity/${req.params.activityId}/details`)
    })
  })  
}


exports.votingDetailsPage = function (req, res) {
  let votingDetails=req.votingDetails
  req.votingDetails=undefined
  let checkData={
    isUserLoggedIn:req.isUserLoggedIn,
    isVotingLeader:false,
    isVoteMember:false,
    isVoter:false,
  }

  if(checkData.isUserLoggedIn){
    //checking ifvoting member
    if(votingDetails.from=="batch"){
      if(req.regNumber.slice(0,9)==votingDetails.sourceId){
        checkData.isVoteMember=true
      }
    }else if(votingDetails.from=="department"){
      if(req.regNumber.slice(4,9)==votingDetails.sourceId){
        checkData.isVoteMember=true
      }
    }else{
      //this is for group
      let departmentCodes=OtherOperations.getDepartmentCodesFromGroupId(votingDetails.sourceId)
      if(departmentCodes.includes(req.regNumber.slice(4,9))){
        checkData.isVoteMember=true
      }
    }
    //check if voting leader
    if(votingDetails.leaders.mainLead.regNumber==req.regNumber){
      checkData.isVotingLeader=true
    }
    if(votingDetails.leaders.assistantLead){
      if(votingDetails.leaders.assistantLead.regNumber==req.regNumber){
        checkData.isVotingLeader=true
      }
    }
    //checking visitor voter or not
    votingDetails.voters.forEach((voter)=>{
      if(voter.regNumber==req.regNumber){
        checkData.isVoter=true
      }
    })
  }
  console.log("check data:",checkData)
  res.render("topic-voting-details-page",{
    votingDetails:votingDetails,
    checkData:checkData
  })
}


//Present leader voting functionalities from bellow


exports.createLeaderVotingPole = function (req, res) {
  let createdBy={
    regNumber:req.regNumber,
    userName:req.userName
  }
  let leaderVoting=new LeaderVoting(req.sourceData,"byLeader")
  leaderVoting.createLeaderVotingPole(createdBy).then(()=>{
    req.sourceData=undefined
    console.log("Executed properly.")
    req.flash("success", "Voting pole successfully created.")
    req.session.save( () =>{
      res.redirect(`/${req.params.from}/${req.params.id}/details`)
    })
  }).catch(()=>{
    req.flash("errors", "There is some problem.")
    req.session.save( () =>{
      res.redirect(`/${req.params.from}/${req.params.id}/details`)
    })
  })  
}

exports.getLeaderVotingStatusAndCheckData =async function (req, res, next) {
   req.checkData={
    isUserLoggedIn:req.isUserLoggedIn,//value got from isUserLoggedIn function
    isVoter:false,
    votingStatus:"",//nomination,voting,completed
  }
  req.validMembers=[]
  if(req.checkData.isUserLoggedIn){
    req.checkData.isVoter=OtherOperations.isSourceMemberOrVoter(req.votingDetails.from,req.votingDetails.sourceId,req.regNumber)
  }
  if(req.votingDetails.votingDates.createdDate<new Date() && new Date()<req.votingDetails.votingDates.nominationLastDate){
    req.checkData.votingStatus="nomination"
    if(req.checkData.isVoter){
      let sourceDetails
      if(req.votingDetails.from=="batch"){
        sourceDetails=await SessionBatch.findSessionBatchDetailsByBatchId(req.votingDetails.sourceId)
      }else if(req.votingDetails.from=="batch"){
        sourceDetails=await Department.getDepartmentDataByDepartmentCode(req.votingDetails.sourceId)
      }else{
        sourceDetails=await Group.findGroupByGroupId(req.votingDetails.sourceId)
      }
      req.votingDetails.nominateableMembers=sourceDetails.allMembers.map((member)=>{
        if(req.votingDetails.leaders.mainLead.regNumber!=member.regNumber){//if present leader then can't get nomination
          return member.regNumber
        }
      })
    }
  }else if(req.votingDetails.votingDates.nominationLastDate<new Date() && new Date()<req.votingDetails.votingDates.votingLastDate){
    req.checkData.votingStatus="voting"
  }else{
    req.checkData.votingStatus="completed"
  }
  console.log("Voting Details nominateableMembers:",req.votingDetails)
  next()
}

exports.getLeaderVotingPage =async function (req, res) {
  let votingDetails=req.votingDetails 
  let checkData=req.checkData
  // console.log("Voting Details :",votingDetails)
  // console.log("CheckData :",req.checkData)
  res.render("leader-voting-details-page",{
    votingDetails:votingDetails,
    checkData:checkData
  })
}

exports.addNameOnNomination = function (req, res) {
  let nominator={
    regNumber:req.regNumber,
    userName:req.userName,
    createdDate:new Date()
  }
  LeaderVoting.getNominationOnVotingPortal(req.votingDetails._id,nominator).then(()=>{
    req.flash("success", "Nomination successfully accepted.")
    req.session.save( () =>{
      res.redirect(`/leader-voting/${req.params.id}/details`)
    })
  }).catch(()=>{
    req.flash("errors", "There is some problem.")
    req.session.save( () =>{
      res.redirect(`/leader-voting/${req.params.id}/details`)
    })
  })
}


exports.giveLeaderVote = function (req, res) {
  let errMsg=""
  let hasError=false
  if(req.body.leaderIndex!="" || typeof req.body.leaderIndex!="string"){
    let noOfNominations=req.votingDetails.nominationTakers.length
    let indexNumber=Number(req.body.leaderIndex)
    if(indexNumber<0 || indexNumber>=noOfNominations){
      hasError=true
      errMsg="Leader selection is invalide."
    }else{
      if(req.votingDetails.nominationTakers[indexNumber].regNumber==req.regNumber){
        hasError=true
        errMsg="Sorry,You can't vote for yourself."
      }
    }
  }else{
    hasError=true
    errMsg="Leader selection is invalide."
  }
     
  if(!hasError){
    let votingData={
      regNumber:req.regNumber,
      userName:req.userName,
      votingIndex:Number(req.body.leaderIndex)
    }
    console.log("Voting Data:",votingData)
    LeaderVoting.giveLeaderVote(req.votingDetails._id,votingData).then(()=>{
      req.votingDetails=undefined
      req.flash("success", "Your vote received successfully.Thank you for your vote.")
      req.session.save( () =>{
        res.redirect(`/leader-voting/${req.params.id}/details`)
      })
    }).catch((e)=>{
      req.flash("errors", "Sorry,there is some problem!! Try again later.")
      req.session.save( () =>{
        res.redirect(`/leader-voting/${req.params.id}/details`)
      })
    })
  }else{
    req.flash("errors", errMsg)
    req.session.save( () =>{
      res.redirect(`/leader-voting/${req.params.id}/details`)
    })
  }
  
}

//i have to work on this
exports.declareLeaderResultByLeader = function (req, res) {
  let declaredBy={
    regNumber:req.regNumber,
    userName:req.userName
  }
  let resultData=OtherOperations.getVotingResultData(req.votingDetails,"leaderResult")
  console.log("Result data :",resultData)
  //have to work................
  let activityId=req.params.activityId
  LeaderVoting.declareLeaderResultByLeader(req.votingDetails,resultData,declaredBy).then(()=>{
    req.votingDetails=undefined
    req.flash("success", "Result successfully declared.")
    req.session.save( () =>{
      res.redirect(`/leader-voting/${req.params.activityId}/details`)
    })
  }).catch(()=>{
    req.flash("errors", "There is some problem.")
    req.session.save( () =>{
      res.redirect(`/leader-voting/${req.params.activityId}/details`)
    })
  })  
}