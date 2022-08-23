const Notification = require("../models/Notification")
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
    console.log("Reg number :",req.regNumber)
    req.session.save(()=>{
      res.render("student-home-page")
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
        emailNotSet:true,
        isHomeTutor:false
      }
      console.log("Other data :",otherData)
      req.flash("success", "Successfully created your account.Welcome to NBU community!!")
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


exports.setEmailId = function (req, res) {
  let student = new Student(req.body)
  student
    .setEmailId(req.regNumber)
    .then(() => {
      let flashMessage
      if(req.body.from=="setNow"){
        flashMessage="Email Id set successfully."
      }else if(req.body.from=="setLater"){
        flashMessage="Thank you for your responce."
      }else if(req.body.from=="update"){
        flashMessage="Email-Id updated successfully."
      }
      req.flash("success", flashMessage)
      req.session.user.otherData.emailNotSet = false
      req.session.save(function () {
        res.redirect("/student-home")
      })
    })
    .catch(regErrors => {
        req.flash("errors", regErrors)
      req.session.save(function () {
        res.redirect("/student-home")
      })
    })
}

exports.ifProfileUserExists=async function(req,res,next){
  try{
    let profileData=await Student.getStudentDataByRegNumber(req.params.regNumber)
    if(profileData){
      req.profileData=profileData
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

exports.getProfilePage=function(req,res){
  let profileData=req.profileData
  let otherData=req.profileOtherData
  let checkData={
    isUserLoggedIn:req.isUserLoggedIn,
    isProfileOwner:false,
    isSameDepartment:false,
  }
  if(checkData.isUserLoggedIn){
    if(req.regNumber==profileData.regNumber){
      checkData.isProfileOwner=true
    }
    if(req.regNumber.slice(4,9)==profileData.regNumber.slice(4,9)){
      checkData.isSameDepartment=true
    }
  }

 let  profileInfo={
    regNumber:profileData.regNumber,
    userName:profileData.userName,
    gender:profileData.gender,
    departmentName:profileData.departmentName,
    sessionYear:profileData.sessionYear,
    groupId:profileData.groupId,
    phone:profileData.phone,
    isVerified:profileData.isVerified,
    isXstudent:profileData.isXstudent,
    createdDate:profileData.createdDate,
    //otherData from below
    organizedActivities:otherData.organizedActivities,
    perticipatedActivities:otherData.perticipatedActivities,
    wonVotes:otherData.wonVotes,
    creditePoints:otherData.creditePoints
  }

  if(!checkData.isSameDepartment){
    profileInfo.phone=null
  }
  if(!checkData.isUserLoggedIn){
    profileInfo.organizedActivities=null
    profileInfo.wonVotes=null
    profileInfo.creditePoints=null
  }

  console.log("Profile Info :",profileInfo)
  res.render("student-profile-page",{
    profileInfo:profileInfo,
    checkData:checkData
  })

}
