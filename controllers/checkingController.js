const Department = require("../models/Department")
const Group = require("../models/Group")
const OtherOperations = require("../models/OtherOperations")
const SessionBatch = require("../models/SessionBatch")

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
  let validMember=OtherOperations.isSourceMemberOrVoter(req.votingDetails.from,req.votingDetails.sourceId,req.regNumber)
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

exports.ifActivityAlreadyLiked=function(req,res,next){
  req.activityLiked=false
  req.activityDetails.likes.forEach((like)=>{
    if(like==req.regNumber){
      req.activityLiked=true
    }
  })
  next()
}

//voting related routers


//this function is used to get source data, decided by the parameters 
//when type==all it says we need completedActivities ids otherwise get leader data for voting pole creation
exports.ifSourcePresent=async function(req,res,next){
  try{
    req.sourceData=null
    let sourcePresent=false
    // let checkData={//checking leader voting pole creation conditions
    //   problemPresent:false,
    //   votingGoingOn:false,
    //   activityGoingOn:false
    // }//have to add it on next middleware function
    if(req.params.from=="batch"){
      let sourceData=await SessionBatch.findSessionBatchDetailsByBatchId(req.params.id)
      if(sourceData){
        req.sourceData={
          from:req.params.from,
          sourceId:sourceData.batchId,
          sourceName:sourceData.departmentName,
        }
        if(req.params.type=="all"){
          req.sourceData.completedActivities=sourceData.completedActivities
        }else{
          req.sourceData.leaders={
            mainLead:sourceData.presentLeader,
            assistantLead:sourceData.previousLeader,
          }
        }
        sourcePresent=true
      }
    }else if(req.params.from=="department"){
      let sourceData=await Department.findDepartmentByDepartmentCode(req.params.id)
      
      if(sourceData){
        req.sourceData={
          from:req.params.from,
          sourceId:sourceData.departmentCode,
          sourceName:sourceData.departmentName,
        }
        if(req.params.type=="all"){
          req.sourceData.completedActivities=sourceData.completedActivities
        }else{
          req.sourceData.leaders={
            mainLead:sourceData.presentLeader,
            assistantLead:sourceData.previousLeader,
          }
        }
        sourcePresent=true
      }
    }else if(req.params.from=="group"){
      let  sourceData=await Group.findGroupByGroupId(req.params.id)
      
      if(sourceData){
        req.sourceData={
          from:req.params.from,
          sourceId:sourceData.groupId,
          sourceName:sourceData.groupName,
        }
        if(req.params.type=="all"){
          req.sourceData.completedActivities=sourceData.completedActivities
        }else{
          req.sourceData.leaders={
            mainLead:sourceData.presentLeader,
            assistantLead:sourceData.previousLeader,
          }
        }
        sourcePresent=true
      }
    }else{
      req.flash("errors", "Data manipulation detected.")
      req.session.save( ()=> {
        res.redirect("/")
      })
    }
    if(sourcePresent){
        next()
    }else{
      res.render("404")
    }
  }catch{
    res.render("404")
  }
}



exports.ifCreatorLeader=function(req,res,next){
  if(req.sourceData.leaders.mainLead.regNumber==req.regNumber || req.sourceData.leaders.assistantLead.regNumber==req.regNumber){
    next()
  }else{
    req.flash("errors", "Only present leader can create voting pole.")
    req.session.save( ()=> {
      res.redirect(`/${req.params.from}/${req.params.id}/details`)
    })
  }
}


exports.ifMoreThenFixedDaysOfLeaderSelection=function(req,res,next){
  //check if new leader was selected before source wise fixed days or not
    let createdDate=req.sourceData.leaders.mainLead.createdDate
    let activeDate = new Date(createdDate);
    let numberOfDaysToAdd
    if(req.params.from=="batch"){
      numberOfDaysToAdd = 15;
    }else if(req.params.from=="batch"){
      numberOfDaysToAdd = 30;
    }else{
      numberOfDaysToAdd = 50;
    }
    let result1 = activeDate.setDate(activeDate.getDate() + numberOfDaysToAdd);
    let lastDate=new Date(result1)
    if(lastDate<new Date()){
      next()
    }else{
      req.flash("errors", `You should wait at least ${numberOfDaysToAdd} days to create new voting pole.Or complete an activity new voting pole will be created automatically.`)
      req.session.save( ()=> {
        res.redirect(`/${req.params.from}/${req.params.id}/details`)
      })
    }
}

exports.ifUserNominateable=function(req,res,next){
  //check nomination date expired or not
  //console.log("Voting Details here :",req.votingDetails)
  if(req.checkData.votingStatus=="nomination"){
    let nominated=false
    //here is some problem
    if(req.votingDetails.nominateableMembers){
      //check source member or not
      if(req.votingDetails.nominateableMembers.includes(req.regNumber)){
        //check already nominated or not
        req.votingDetails.nominationTakers.forEach((user)=>{
          if(user.regNumber==req.regNumber){
            nominated=true
          }
        })
        if(!nominated){
          next()
        }else{
          req.flash("errors", "You have already enrolled your name on the portal.")
          req.session.save( ()=> {
            res.redirect(`/leader-voting/${req.params.id}/details`)
          })
        }
      }else{
        req.flash("errors", "You are not allowed to get nominated on this voting portal.")
        req.session.save( ()=> {
          res.redirect(`/leader-voting/${req.params.id}/details`)
        })
      }
    }
  }else{
    req.flash("errors", "Nomination date has been expired.Try in next vote.")
    req.session.save( ()=> {
      res.redirect(`/leader-voting/${req.params.id}/details`)
    })
  }
  
}


exports.checkLeaderVotingData=function(req,res,next){
  //check is voting going on
  if(req.checkData.votingStatus=="voting"){
    //check valide voter or not
    if(req.checkData.isVoter && !req.otherData.isXstudent){
      //check if already votted or not
      let votted=false
      req.votingDetails.voters.forEach((voter)=>{
        if(voter.regNumber==req.regNumber){
          votted=true
        }
      })
      if(!votted){
        next()
      }else{
        req.flash("errors", "You have already votted.")
        req.session.save( ()=> {
          res.redirect(`/leader-voting/${req.params.id}/details`)
        })
      }
    }else{
      req.flash("errors", "You can't vote this portal.")
      req.session.save( ()=> {
        res.redirect(`/leader-voting/${req.params.id}/details`)
      })
    }
  }else{
    req.flash("errors", "Voting is not going on for this portal.")
    req.session.save( ()=> {
      res.redirect(`/leader-voting/${req.params.id}/details`)
    })
  }
}


exports.ifVotingResultDeclarable=function(req,res,next){
  //check if state is votting
  //check if declared by leader
  //check if all nominated students voted or not
  //
  let hasError=false
  let errMsg=""
  if(!req.votingDetails.isResultDeclared){
    if(req.votingDetails.leaders.mainLead.regNumber==req.regNumber || req.votingDetails.leaders.assistantLead.regNumber==req.regNumber){
      if(!req.votingDetails.nominationTakers.length){
        hasError=true
        errMsg="As no nomination taken place,present leader will stay as leader.This voting pole result will be declared automatically."
      }
      let nominatorVoter=OtherOperations.checkIfAllNominationTakerVotedOrNot(req.votingDetails)
      if(!nominatorVoter.isAllVoted){
        hasError=true
        let voters=""
        nominatorVoter.notVoted.forEach((voter)=>{
          voters=voters+voter+","
        })
        errMsg=voters+" didn't give there vote till now."
      }
    }else{
      hasError=true
      errMsg="Only voting leaders can declare the result."
    }
  }else{
    hasError=true
    errMsg="Result for this portal has been declared already."
  }
  if(!hasError){
    next()
  }else{
    req.flash("errors", errMsg)
    req.session.save( ()=> {
      res.redirect(`/leader-voting/${req.params.id}/details`)
    })
  }
}


exports.newLeaderAcceptableOrNot=function(req,res,next){
  //check state of the voting pole
  //check if student won leader or not
  let hasError=false
  let errMsg=""
  if(req.votingDetails.wonLeader.regNumber==req.regNumber){
    if(req.votingDetails.isWonLeaderAccept){
      hasError=true
      errMsg="You had accepted yourself as a leader."
    }  
  }else{
    hasError=true
    errMsg="Sorry!!You are not the winning leader."
  }
  if(!hasError){
    next()
  }else{
    req.flash("errors", errMsg)
    req.session.save( ()=> {
      res.redirect(`/leader-voting/${req.params.id}/details`)
    })
  }
}