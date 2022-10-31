const Activity = require("../models/Activity")
const CampusGroup = require("../models/CampusGroup")
const GlobalNotifications = require("../models/GlobalNotifications")
const HomeTutor = require("../models/HomeTutor")
const LeaderVoting = require("../models/LeaderVoting")
const Notification = require("../models/Notification")
const OfficialUsers = require("../models/OfficialUsers")
const Student = require("../models/Student")
 


exports.studentMustBeLoggedIn=function(req,res,next){
  if(req.session.user){
    if (req.session.user.accountType == "student") {
      next()
    } else {
      req.flash("errors", "You are not allowed to perform that action!!")
      req.session.save(function () {
        res.redirect("/")
      })
    }
  }else{
    req.flash("errors", "You should log-in first to perform that action.")
    req.session.save(() => res.redirect("/log-in"))
  }
}

exports.getStudentHomePage=async function(req,res){
  try{
    //update notification number
    let unseenNotifications=await Notification.getUnseenNotificationNumbers(req.regNumber)
    if(req.session.user.otherData.unseenNotifications!=unseenNotifications){
      req.session.user.otherData.unseenNotifications=unseenNotifications
    }
    //--------------------------
    let globalNotifications=await GlobalNotifications.getGlobalNotifications()
    let totalNotifications=globalNotifications.length
    if(totalNotifications>25){
      globalNotifications=globalNotifications.slice(totalNotifications-5,totalNotifications)
    }
    globalNotifications=globalNotifications.reverse()
    //--------------------------
    let postActivities=[]
    if(req.session.user.otherData.isVerified){
      let activities=await OfficialUsers.getAllActivityIds()
      let activityIds=activities.recentActivities.concat(activities.topActivities)
      if(activityIds.length){
        postActivities=await Activity.getAllActivityDetailsOfArrayIds(activityIds)
      }
    }else{
      //this section will chenge session field Data | as verifiers changes dynamically
      let profileInfo=await Student.getStudentDataByRegNumber(req.regNumber)
      if(!profileInfo.isVerified){
        req.session.user.otherData.verifiedBy.verifiers=profileInfo.verifiedBy.verifiers
        req.session.user.otherData.verifiedBy.verificationType=profileInfo.verifiedBy.verificationType
        req.session.user.otherData.verifiedBy.message=profileInfo.verifiedBy.message
        if(profileInfo.verifiedBy.verificationType=="rejected"){
          req.session.user.otherData.verifiedBy.verifiers=profileInfo.verifiedBy.rejectedBy
        }
      }else{
        req.session.user.otherData.isVerified=true
        req.session.user.otherData.verifiedBy.verifiers=null
      }
    }
    console.log("Global notifications :",globalNotifications)
    console.log("postActivities :",postActivities)
    req.session.save(()=>{
      res.render("student-home-page",{
        globalNotifications:globalNotifications,
        postActivities:postActivities
      })
    })
  }catch{
    res.render("404")
  }
}


exports.createNewAccount = function (req, res) {
  let batchData=req.batchData//it contain only needed data regarding sign up
  console.log("BatchData :",batchData)
  let communityController=req.communityController
  let student = new Student(req.body,batchData,communityController)
  student
    .createNewAccount()
    .then(() => {
      let otherData={
        isVerified:false,
        groupId:student.data.groupId,
        verifiedBy:student.data.verifiedBy,
        isHomeTutor:false
      }
      req.flash("success", "Successfully created your account.Your verification code has been sent to your Email Id.")
      req.session.user = { regNumber: student.data.regNumber, userName: student.data.userName,otherData:otherData, accountType:"student" }
      req.session.save(function () {
        res.redirect("/student-home")
      })
    })
    .catch(regErrors => {
      req.flash("errors", regErrors)
      req.session.save(function () {
        res.redirect("/sign-up-form")
      })
    })
}

exports.checkPresentPassword= function(req,res,next){
  Student.checkPresentPassword(req.body.presentPassword,req.regNumber).then(()=>{
    next()
  }).catch((err)=>{
    req.flash("errors", err)
    req.session.save( ()=> {
      res.redirect(`/profile-setting/${req.regNumber}`)
    })
  })
}

exports.resetNewPassword = function (req, res) {
  Student.resetNewPassword(req.regNumber,req.body.newPassword).then(()=>{
      req.flash("success", "New password successfully reset!!")
      req.session.save(() => res.redirect(`/profile-setting/${req.regNumber}`))        
  }).catch(()=>{
      req.flash("errors", "There is some problem.Please try again later.")
      req.session.save(() => res.redirect(`/profile-setting/${req.regNumber}`))    
  }) 
}

//this function used to take email id.Now we are taking email id during sign upas must given.
// exports.setEmailId = function (req, res) {
//   let student = new Student(req.body)
//   student
//     .setEmailId(req.regNumber)
//     .then(() => {
//       let flashMessage
//       if(req.body.from=="setNow"){
//         flashMessage="Email Id set successfully."
//       }else if(req.body.from=="setLater"){
//         flashMessage="Thank you for your responce."
//       }else if(req.body.from=="update"){
//         flashMessage="Email-Id updated successfully."
//       }
//       req.flash("success", flashMessage)
//       req.session.user.otherData.emailNotSet = false
//       req.session.save(function () {
//         res.redirect("/student-home")
//       })
//     })
//     .catch(regErrors => {
//         req.flash("errors", regErrors)
//       req.session.save(function () {
//         res.redirect("/student-home")
//       })
//     })
// }

exports.ifProfileUserExists=async function(req,res,next){
  try{
    let profileData=await Student.getStudentDataByRegNumber(req.params.regNumber)
    if(profileData){
      req.profileData=profileData
      req.headerData={
        regNumber:req.profileData.regNumber,
        userName:req.profileData.userName,
        isXstudent:req.profileData.isXstudent,
      }
      next()
    }else{
      res.render("404")
    }
  }catch{
    req.flash("errors", "There is some problem")
    req.session.save( ()=> {
      res.redirect("/")
    })
  }
}

exports.ifUserProfileOwner= function(req,res,next){
    if(req.profileData.regNumber==req.regNumber){
      next()
    }else{
      req.flash("errors", "Only profile user can perform that action!!")
      req.session.save( ()=> {
        res.redirect("/")
      })
    }
}

exports.getProfileOtherData=async function(req,res,next){
  try{
    let profileOtherData=await Student.getStudentOtherDataByRegNumber(req.profileData.regNumber)
    if(profileOtherData){
      req.profileOtherData=profileOtherData
      
      next()
    }else{
      res.render("404")
    }
  }catch{
    req.flash("errors", "There is some problem")
    req.session.save( ()=> {
      res.redirect("/")
    })
  }
}

exports.getProfilePage=async function(req,res){
  try{
    let profileData=req.profileData
    let otherData=req.profileOtherData
    console.log("Other data :",otherData)
    let profileInfo={}
    let checkData={
      isUserLoggedIn:req.isUserLoggedIn,
      isProfileOwner:false,
      isSameDepartment:false,
      guestAllowedToViewProfile:true,
    }

    if(checkData.isUserLoggedIn){
      if(req.regNumber==profileData.regNumber){
        checkData.isProfileOwner=true
      }
      if(req.regNumber.slice(4,9)==profileData.regNumber.slice(4,9)){
        checkData.isSameDepartment=true
      }
    }else{
      checkData.guestAllowedToViewProfile=profileData.guestAllowedToViewProfile
    }

    if(checkData.guestAllowedToViewProfile){
      let activityIds=otherData.activities.leadActivities.concat(otherData.activities.participatedActivities)
      let allActivities=await Activity.getAllActivityDetailsOfArrayIds(activityIds)
      
      let actionData={
        activity:{
          noOfLeadActivities:otherData.activities.leadActivities.length,
          noOfParticipatedActivities:otherData.activities.participatedActivities.length
        },
        voting:{
          noOfWinningPole:otherData.winningVotingPoles.batchLeader.length+otherData.winningVotingPoles.departmentLeader.length+otherData.winningVotingPoles.groupLeader.length,
          noOfVoteGivenPole:otherData.voteGivenPoles.leaderVote.length+otherData.voteGivenPoles.topicVote.length,
          noOfNominationTaken:otherData.nominationTakenPoles.length
        },
        noOfCampusGroup:otherData.campusGroupIds.length
      }
      
      profileInfo={
        regNumber:profileData.regNumber,
        userName:profileData.userName,
        gender:profileData.gender,
        departmentName:profileData.departmentName,
        sessionYear:profileData.sessionYear,
        groupId:profileData.groupId,
        isVerified:profileData.isVerified,
        isXstudent:profileData.isXstudent,
        isHomeTutor:profileData.isHomeTutor,
        bioStatus:profileData.bioStatus,
        createdDate:profileData.createdDate,
        creditPoints:profileData.creditPoints,
        //otherData from below
        actionData:actionData,
        allActivities:allActivities
      }
    }else{
      profileInfo={
        regNumber:profileData.regNumber,
        userName:profileData.userName,
        isVerified:profileData.isVerified,
        bioStatus:profileData.bioStatus,
        creditPoints:profileData.creditPoints
      }
    }

    console.log("profile info :",profileInfo)
    console.log("CheckData  :",checkData)
    
    res.render("student-profile-page",{
      profileInfo:profileInfo,
      checkData:checkData
    })

  }catch{
    req.flash("errors", "There is some problem")
    req.session.save( ()=> {
      res.render("404")
    })
  }
  
}

exports.setBioStatus= function(req,res){
  console.log("bioStatus:",req.body.bioStatus)
  Student.setBioStatus(req.body.bioStatus,req.regNumber).then(()=>{
    req.flash("success", "Bio-status updated successfully!!")
    req.session.save( ()=> {
      res.redirect(`/student/${req.regNumber}/profile`)
    })
  }).catch((err)=>{
    req.flash("errors", err)
    req.session.save( ()=> {
      res.redirect(`/student/${req.regNumber}/profile`)
    })
  })
}


exports.getProfileSettingPage=async function(req,res){
  try{
    let settingInfo={
      guestAllowedToViewProfile:req.profileData.guestAllowedToViewProfile,
      enrolledAsHomeTutor:false,
    }
    let tutorData=await HomeTutor.getHomeTutorData(req.profileData.regNumber)
    if(tutorData){
      settingInfo.isHomeTutor=req.profileData.isHomeTutor
      settingInfo.enrolledAsHomeTutor=true
    }
    console.log("Setting info:",settingInfo)
    res.render("student-profile-setting-page",{
      headerData:req.headerData,
      settingInfo:settingInfo
    })
  }catch{
    res.render("404")
  }
}

exports.getStudentActivitiesPage=async function(req,res){
  try{
    let otherData=req.profileOtherData
    let allActivities={
      leadActivities:[], 
      participatedActivities:[]
    }
    if(otherData.activities.leadActivities.length){
      allActivities.leadActivities=await Activity.getAllActivityDetailsOfArrayIds(otherData.activities.leadActivities) 
    }
    if(otherData.activities.participatedActivities.length){
      allActivities.participatedActivities=await Activity.getAllActivityDetailsOfArrayIds(otherData.activities.participatedActivities)
    }
    console.log("All activities :",allActivities)
    res.render("student-activities-page",{
      headerData:req.headerData,
      allActivities:allActivities
    })
  }catch{
    res.render("404")
  }
}

exports.getStudentVotingPolesPage=async function(req,res){
  try{
    let otherData=req.profileOtherData
    let votingData={
        winningPoles:[],
        nominationTakenPoles:[],
        voteGivenPoles:otherData.voteGivenPoles
    }
    console.log("Other Data:",otherData)
    let winningPoleIds=otherData.winningVotingPoles.batchLeader.concat(otherData.winningVotingPoles.departmentLeader,otherData.winningVotingPoles.groupLeader)
    if(winningPoleIds.length){
      votingData.winningPoles=await LeaderVoting.getLeaderVotingPoleByArrayOfPoleIds(winningPoleIds)
    }
    if(otherData.nominationTakenPoles.length){
      votingData.nominationTakenPoles=await LeaderVoting.getLeaderVotingPoleByArrayOfPoleIds(otherData.nominationTakenPoles)  
    }
    res.render("student-voting-poles-page",{
      headerData:req.headerData,
      votingData:votingData
    })
  }catch{
    res.render("404")
  }
}

exports.getStudentCampusGroupPage=async function(req,res){
  try{
    let otherData=req.profileOtherData
    let allCampusGroups=[]
    if(otherData.campusGroupIds.length){
      allCampusGroups=await CampusGroup.getCampusGroupsByArrayOfIds(otherData.campusGroupIds)
    }
    console.log("all campus groups :",allCampusGroups)
    res.render("student-campus-groups-page",{
      headerData:req.headerData,
      allCampusGroups:allCampusGroups
    })
  }catch{
    res.render("404")
  }
}

exports.onProfileViewToGuest = function (req, res) {
  Student.onProfileViewToGuest(req.regNumber).then(()=>{
      req.flash("success", "Successfully ON !! Now guest-user can see your profile data!!")
      req.session.save(() => res.redirect(`/profile-setting/${req.regNumber}`))        
  }).catch(()=>{
      req.flash("errors", "There is some problem.Please try again later.")
      req.session.save(() => res.redirect(`/profile-setting/${req.regNumber}`))    
  }) 
}

exports.offProfileViewToGuest = function (req, res) {
  Student.offProfileViewToGuest(req.regNumber).then(()=>{
      req.flash("success", "Successfully OFF !! Now guest-user can not see your profile data!!")
      req.session.save(() => res.redirect(`/profile-setting/${req.regNumber}`))        
  }).catch(()=>{
      req.flash("errors", "There is some problem.Please try again later.")
      req.session.save(() => res.redirect(`/profile-setting/${req.regNumber}`))    
  }) 
}



