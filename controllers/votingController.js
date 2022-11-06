const OtherOperations = require("../models/OtherOperations")
const TopicVoting = require("../models/TopicVoting")
const LeaderVoting = require("../models/LeaderVoting")
const SessionBatch = require("../models/SessionBatch")
const Department = require("../models/Department")
const Group = require("../models/Group")
const Student = require("../models/Student")
const GetAllMembers = require("../models/GetAllMembers")

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
  console.log("Received Data :",req.body)
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


exports.topicVotingDetailsPage = function (req, res) {
  let votingDetails=req.votingDetails
  req.votingDetails=undefined
  let checkData={
    isUserLoggedIn:req.isUserLoggedIn,
    isVotingLeader:false,
    isVoteMember:false,
    isVoter:false,
    votingIndex:null
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
        checkData.votingIndex=voter.votingIndex
      }
    })
  }
  //voting parcentage calculation for each topic
  let totalVote=votingDetails.voters.length
  votingDetails.result=votingDetails.result.map((data)=>{
    let newInfo={
      topicIndex:data.topicIndex,
      parcentage:((data.votes*100)/totalVote).toFixed(2)
    }
    console.log("new Info :",newInfo)
    return newInfo
  })
  console.log("check data:",checkData)
  console.log("Voting details :",votingDetails)
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
  console.log("Source Data:",req.sourceData)
  let leaderVoting=new LeaderVoting(req.sourceData,"byLeader")
  leaderVoting.createLeaderVotingPole(createdBy).then(async(poleId)=>{
    //Notification sending after creation leader voting pole  
    let allMembers=await GetAllMembers.getAllSourceMembers(req.sourceData.sourceId,req.sourceData.from)
    await Notification.newLeaderSelectionStartedToAllSourceMembers(allMembers,poleId,req.sourceData.from)
      
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
  try{
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
        }else if(req.votingDetails.from=="department"){
          sourceDetails=await Department.getDepartmentDataByDepartmentCode(req.votingDetails.sourceId)
        }else if(req.votingDetails.from=="group"){
          sourceDetails=await Group.findGroupByGroupId(req.votingDetails.sourceId)
        }
        if(req.votingDetails.from=="batch"){
          req.votingDetails.nominateableMembers=sourceDetails.allMembers.map((member)=>{
            if(req.votingDetails.leaders.mainLead.regNumber!=member.regNumber){//if present leader then can't get nomination
              return member.regNumber
            }
          })
        }else{
          //HERE I ALSO HAVE TO CHECK WHETHER PRESENT MEMBER FROM SENIOUR BATCH OR NOT | Seniour batch student should not get nomination.
          req.votingDetails.nominateableMembers=sourceDetails.allPresentMembers.map((member)=>{
            if(req.votingDetails.leaders.mainLead.regNumber!=member.regNumber){//if present leader then can't get nomination
              return member.regNumber
            }
          })
        }
        
      }
    }else if(req.votingDetails.votingDates.nominationLastDate<new Date() && new Date()<req.votingDetails.votingDates.votingLastDate){
      req.checkData.votingStatus="voting"
      if(req.votingDetails.isResultDeclared){
        req.checkData.votingStatus="completed"
      }
    }else{
      req.checkData.votingStatus="completed"
      if(!req.votingDetails.isResultDeclared){
        await LeaderVoting.deaclreLeaderVotingPoleResultAutomatically(req.votingDetails)
      }
    }
    console.log("Voting Details nominateableMembers:",req.votingDetails)
    next()
  }catch{
    res.render("404")
  }
}

exports.getLeaderVotingPage =async function (req, res) {
  try{
    let votingDetails=req.votingDetails 
    let checkData=req.checkData
    checkData.isWonLeader=false
    checkData.isMainLeader=false
    checkData.isNominateableMember=false
    checkData.isNominationTaken=false
    checkData.isVoterVoted=false
    checkData.votingIndex=null

    if(checkData.isUserLoggedIn){
      if(votingDetails.isResultDeclared && !votingDetails.isWonLeaderAccepted){
        if(votingDetails.wonLeader.regNumber==req.regNumber){
          checkData.isWonLeader=true
        } 
      }
      if(votingDetails.leaders.mainLead.regNumber==req.regNumber){
        checkData.isMainLeader=true
      }
      if(checkData.votingStatus=="nomination"){
        if(votingDetails.nominateableMembers.includes(req.regNumber)){
          checkData.isNominateableMember=true
        }
      }
      if(checkData.isVoter){
        votingDetails.nominationTakers.forEach((nominee)=>{
          if(nominee.regNumber==req.regNumber){
            checkData.isNominationTaken=true
          }
        })

        votingDetails.voters.forEach((voter)=>{
          if(voter.regNumber==req.regNumber){
            checkData.isVoterVoted=true
            checkData.votingIndex=voter.votingIndex
          }
        })
      }

    }

    if(votingDetails.result.length){
      //voting parcentage calculation for each topic
      let totalVote=votingDetails.voters.length
      votingDetails.result=votingDetails.result.map((data)=>{
        let newInfo={
          leaderIndex:data.leaderIndex,
          parcentage: ((data.votes*100)/totalVote).toFixed(2)
        }
        return newInfo
      })
    }
    
    
    // console.log("Voting Details :",votingDetails)
    console.log("CheckData :",req.checkData)
    console.log("new result :",votingDetails.result)
    res.render("leader-voting-details-page",{
      votingDetails:votingDetails,
      checkData:checkData
    })
  }catch{
    res.render("404")
  }
  
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


exports.getNomineeDetails = function (req, res) {
  let nomineeDetails={
    regNumber:req.profileData.regNumber,
    userName:req.profileData.userName,
    departmentName:req.profileData.departmentName,
    sessionYear:req.profileData.sessionYear,
    gender:req.profileData.gender,
    creditPoints:req.profileData.creditPoints,
    batchLead:req.profileOtherData.winningVotingPoles.batchLeader.length,
    departmentLead:req.profileOtherData.winningVotingPoles.departmentLeader.length,
    groupLead:req.profileOtherData.winningVotingPoles.groupLeader.length,
    campusGroups:req.profileOtherData.campusGroupIds.length,
    leadActivities:req.profileOtherData.activities.leadActivities.length,
    membershipActivities:req.profileOtherData.activities.participatedActivities.length
  }
  console.log("nominee details :",nomineeDetails)
  res.render("nominee-details-page",{
    nomineeDetails:nomineeDetails
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
      votingIndex:Number(req.body.leaderIndex)
      //userName:req.userName,No need to take name
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


exports.declareLeaderResultByLeader = function (req, res) {
  let resultDeclarationData={
    declarationType:"byLeader",
    declaredBy:{
      regNumber:req.regNumber,
      userName:req.userName
    },
    reason:req.body.reason
  }
  let resultData=OtherOperations.getVotingResultData(req.votingDetails,"leaderResult")
  console.log("Result data :",resultData)
  
  LeaderVoting.declareLeaderResultByLeader(req.votingDetails,resultData,resultDeclarationData).then(()=>{
    req.votingDetails=undefined
    req.flash("success", "Result successfully declared.")
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



exports.acceptSelfAsLeader =async function (req, res) {
  try{
    let studentData=await Student.getStudentDataByRegNumber(req.regNumber)
    let newLeaderData={
      regNumber:req.regNumber,
      userName:req.userName,
      phone:studentData.phone,
      createdDate:new Date(),
      gole:req.body.gole,
      votingPoleId:req.votingDetails._id
    }
    //departmentName will be used in case of group leader
    let departmentName=studentData.departmentName
    
    let from=req.votingDetails.from
    LeaderVoting.acceptSelfAsLeader(req.votingDetails,newLeaderData,departmentName,studentData.gender).then(()=>{
      req.votingDetails=undefined
      req.flash("success", `Congrets!! Now you are the new present leader of the ${from}.`)
      req.session.save( () =>{
        res.redirect(`/leader-voting/${req.params.id}/details`)
      })
    }).catch((errMsg)=>{
      req.flash("errors", errMsg)
      req.session.save( () =>{
        res.redirect(`/leader-voting/${req.params.id}/details`)
      })
    }) 
  }catch{
    req.flash("errors", "There is some problem.")
    req.session.save( () =>{
      res.redirect(`/leader-voting/${req.params.id}/details`)
    })
  }
}