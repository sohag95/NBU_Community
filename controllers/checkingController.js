const OtherOperations = require("../models/OtherOperations")

exports.checkTopicVoter = function (req, res,next) {
  //1.check if result declered or not
  let hasError=false
  let errors=[]
  let today=new Date()
  if(req.votingDetails.resultDeclared){
    errors.push("Votting result is already published")
    hasError=true
  }
  //2.check votting last date
  if(req.votingDetails.votingDates.votingLastDate<today){
    errors.push("Votting last date passed.")
    hasError=true
  }
  //3.check voter valid member or not
  let validMember=OtherOperations.isSourceMember(req.votingDetails.from,req.votingDetails.sourceId,req.regNumber)
  if(!validMember){
    errors.push("You can't vote in this pole.")
    hasError=true
  }
  //4.check student X or not
  if(req.session.user.otherData.isXstudent){
    hasError=true
    errors.push("You are a X-student now.You can't vote any more.")
  }
  //5.check voter already votted or not
  req.votingDetails.voters.forEach((voter)=>{
    if(voter.regNumber==req.regNumber){
      hasError=true
      errors.push("You have already votted.")
    }
  })
  //6.valid topic selected or not
  if(req.body.topicIndex!=""){
    let noOfTopics=req.votingDetails.topicOptions.length
    let indexNumber=Number(req.body.topicIndex)
    if(indexNumber<0 || indexNumber>=noOfTopics){
      hasError=true
      errors.push("Your topic selection is wrong.")
    }
  }else{
    hasError=true
    errors.push("Your must select a topic.")
  }
  
  console.log("errors:",errors.length)
  
  if(!hasError){
    console.log("i am here")
    next()
  }else{
    req.flash("errors", errors)
    req.session.save( ()=> {
      res.redirect(`/activity/${req.params.activityId}/details`)
    })
  }
}

exports.checkTopicVoteResultDeclarableOrNot = function (req, res,next) {
  let activityLeader=false
  if(req.votingDetails.leaders.mainLead.regNumber==req.regNumber){
    activityLeader=true
  }
  if(req.votingDetails.leaders.assistantLead){
    if(req.votingDetails.leaders.assistantLead.regNumber==req.regNumber){
      activityLeader=true
    }
  }
  if(activityLeader){
    if(!req.votingDetails.resultDeclared){
      next()
    }else{
      req.flash("errors", "Result has been declared already.")
      req.session.save( ()=> {
        res.redirect(`/activity/${req.params.activityId}/details`)
      })
    }
  }else{
    req.flash("errors", "Only activity leader can declare the result.")
    req.session.save( ()=> {
      res.redirect(`/activity/${req.params.activityId}/details`)
    })
  }
}

exports.checkActivityLeaderOrNot=function(req,res,next){
  let activityLeader=false
  if(req.activityDetails.leaders.mainLead.regNumber==req.regNumber){
    activityLeader=true
  }
  if(req.activityDetails.leaders.assistantLead){
    if(req.activityDetails.leaders.assistantLead.regNumber==req.regNumber){
      activityLeader=true
    }
  }
  if(activityLeader){
    next()
  }else{
    req.flash("errors", "Only activity leader can perform that action.")
    req.session.save( ()=> {
      res.redirect(`/activity/${req.params.id}/details`)
    })
  }
}

exports.checkRightPostControllerOrNot=function(req,res,next){
  let rightPostController=false
  if(req.activityDetails.postControllerDetails.regNumber==req.regNumber){
    rightPostController=true
  }
  if(rightPostController){
    next()
  }else{
    req.flash("errors", "Only assigned post controller can perform that action.")
    req.session.save( ()=> {
      res.redirect(`/activity/${req.params.id}/details`)
    })
  }
}

exports.checkRightVideoEditorOrNot=function(req,res,next){
  let rightVideoEditor=false
  if(req.activityDetails.videoEditorDetails.regNumber==req.regNumber){
    rightVideoEditor=true
  }
  if(rightVideoEditor){
    next()
  }else{
    req.flash("errors", "Only assigned video editor can perform that action.")
    req.session.save( ()=> {
      res.redirect(`/activity/${req.params.id}/details`)
    })
  }
}