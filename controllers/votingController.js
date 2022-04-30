const OtherOperations = require("../models/OtherOperations")
const Voting = require("../models/Voting")

exports.ifVotingPoleExists =async function (req, res,next) {
  try{
    let votingDetails=await Voting.getVotingDetailsById(req.params.id)
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

exports.giveTopicVote = function (req, res) {
    let votingData={
      regNumber:req.regNumber,
      userName:req.userName,
      votingIndex:Number(req.body.topicIndex)
    }
    console.log("Voting Data:",votingData)
    req.votingDetails=undefined
    Voting.giveTopicVote(req.params.id,votingData).then(()=>{
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
  let resultData=OtherOperations.getTopicResultData(req.votingDetails)
  console.log("Result data :",resultData)
  //have to work................
  let activityId=req.params.activityId
  Voting.declareTopicResult(req.votingDetails,resultData,declaredBy,activityId).then(()=>{
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
  res.render("voting-details",{
    votingDetails:votingDetails,
    checkData:checkData
  })
}


