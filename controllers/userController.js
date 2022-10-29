const Activity = require('../models/Activity')
const Department = require('../models/Department')
const GetAllMembers = require('../models/GetAllMembers')
const GlobalNotifications = require('../models/GlobalNotifications')
const Group = require('../models/Group')
const Notification = require('../models/Notification')
const OfficialUsers = require('../models/OfficialUsers')
const OfficialUser=require('../models/OfficialUsers')
const SentEmail = require('../models/SentEmail')
const SourceNotifications = require('../models/SourceNotifications')
const Student = require('../models/Student')


exports.doesEmailExist = function(req, res) {
  Student.ifEmailIdRegistered(req.body.email.toLowerCase()).then(()=> {
    res.json(true)
  }).catch(()=> {
    res.json(false)
  })
}
exports.doesPhoneNumberExist = function(req, res) {
  Student.ifPhoneNumberRegistered(req.body.phone).then(()=> {
    res.json(true)
  }).catch(()=> {
    res.json(false)
  })
}
exports.test =async function (req, res) {
  try{
    console.log("Params data :",req.params.id)
  //await StudentDataHandle.addVotingPoleIdOnVoterAccount("2122COMSC0001","123")
  //await StudentDataHandle.addActivityIdOnAllParticipantsAccount(["2122COMSC0001","2122COMSC0004","2122COMSC0003"],"123456")
  //await Notification.accountVerifiedToAccountHolder("2122COMSC0001")
  //let allMembers=await GetAllMembers.getAllSourceMembers("2COMSCCOMAP","group")
  //let sentEmail=new SentEmail()
  //let emailId="roysohag95@gmail.com"
  //let emailIds=["roysohag95@gmail.com","troy61125@gmail.com"]
  //await sentEmail.mailAsAccountVerified(emailId)
  //await sentEmail.mailAsActivityCreated(emailIds)
  // var twentyMinutesLater = new Date();
  // let prev=twentyMinutesLater
  // twentyMinutesLater.setMinutes(twentyMinutesLater.getMinutes() + 20);
  // let after=twentyMinutesLater
  // if(prev>after){
  //   console.log("Prev date :",prev)
  // }else{
  //   //this will execute all the time
  //   console.log("After date :",twentyMinutesLater)
  // }
  //await Department.sentNewStudentRequestOnDepartment("COMSC","sohag roy")
  let allMembers=await GetAllMembers.getAllSourceMembers("2122COMSC","batch")
  console.log("All Members :",allMembers)
  //await Notification.activityTopicSelectionResultPublishedToAllSourceMembers(allMembers,"635ce4b869bcf8e60a8ced4f","batch","Social Work")
  await SourceNotifications.topicResultPublished("635ce4b869bcf8e60a8ced4f","2122COMSC")      
  let date=new Date()
  res.render('test-page',{
    date:date
  })
  }catch{
    req.flash("errors", "There is some problem.")
    req.session.save(() => res.redirect("/"))
  }

}




exports.userMustBeLoggedIn = function (req, res,next) {
  if(req.session.user){
    next()
  }else{
    req.flash("errors", "You must logged in to perform that action.")
    req.session.save(() => res.redirect("/"))
  }
}

exports.ifUserLoggedIn = function (req, res,next) {
  req.isUserLoggedIn=false
  if(req.session.user){
    req.isUserLoggedIn=true
  }
  next()
}

exports.userMustNotLoggedIn = function (req, res,next) {
  if(!req.session.user){
    next()
  }else{
    req.flash("errors", "You are already logged In.")
    req.session.save(() => res.redirect("/"))
  }
}

exports.getLogInForm = function (req, res) {
  if(!req.session.user){
    res.render("log-in-form")
  }else{
    req.flash("errors", "You already logged In !! Log-out first to fetch that page.")
    req.session.save(() => res.redirect("/"))
  }
}

exports.loggingIn = function (req, res) {
  if(!req.session.user){
    let regNumber=req.body.regNumber
      let userType=regNumber.slice(4,9).toUpperCase()
      if(req.body.phone.length){
        //students will able to sign-in through phone number
        let student=new Student(req.body)
        student
          .studentLogIn()
          .then(function (result) {
            req.session.user = { regNumber: student.data.regNumber, userName: student.data.userName,otherData:student.data.otherData,accountType: "student" }
            req.session.save(function () {
              res.redirect("/student-home")
            })
          })
          .catch(function (e) {
            req.flash("errors", e)
            req.session.save(function () {
              res.redirect("/log-in")
            })
          })
      }else if(userType=="ADMIN"){
        let admin = new OfficialUser(req.body)
        admin
          .adminLogIn()
          .then(function (result) {
            //allSessionYears is an array which contains all the session years those are used to create batch
            let otherData={
              presentSession:admin.data.presentSession,
              allSessionYears:admin.data.allSessionYears
            }
            req.session.user = { regNumber: admin.data.regNumber, userName: admin.data.userName,otherData:otherData,accountType: "admin" }
            req.session.save(function () {
              res.redirect("/admin-home")
            })
          })
          .catch(function (e) {
            req.flash("errors", e)
            req.session.save(function () {
              res.redirect("/log-in")
            })
          })
      }else if(userType=="UNSCN"){
        let societyController = new OfficialUser(req.body)
        societyController
        .NBUCommunityControllerLogIn()
        .then(function(result) {
          let otherData={}
          req.session.user = {regNumber: societyController.data.regNumber, userName: societyController.data.userName,otherData:otherData,accountType:"societyController"}
          req.session.save(function() {
            res.redirect('/societyController-home')
          })
        }).catch(function(e) {
          req.flash('errors', e)
          req.session.save(function() {
            res.redirect('/log-in')
          })
        })
      }else if(userType=="POSTC"){
        let postController = new OfficialUser(req.body)
        postController
        .postControllerLogIn()
        .then(function(result) {
          let otherData={}
          req.session.user = {regNumber: postController.data.regNumber, userName: postController.data.userName,otherData:otherData,accountType:"postController"}
          req.session.save(function() {
            res.redirect('/postController-home')
          })
        }).catch(function(e) {
          req.flash('errors', e)
          req.session.save(function() {
            res.redirect('/log-in')
          })
        })
      }else if(userType=="EDITR"){
        let videoEditor = new OfficialUser(req.body)
        videoEditor
        .videoEditorLogIn()
        .then(function(result) {
          let otherData={}
          req.session.user = {regNumber: videoEditor.data.regNumber, userName: videoEditor.data.userName,otherData:otherData,accountType:"videoEditor"}
          req.session.save(function() {
            res.redirect('/videoEditor-home')
          })
        }).catch(function(e) {
          req.flash('errors', e)
          req.session.save(function() {
            res.redirect('/log-in')
          })
        })
      }else { 
          req.flash("errors", "Invalid Registration Number/Password!!")
          req.session.save(() => res.redirect("/log-in"))
      }
  }else{
    req.flash("errors", "You already logged In !! Log-out first to perform that action.")
    req.session.save(() => res.redirect("/log-in"))
  }
}

exports.loggingOut = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/")
  })
}


exports.getSignUpForm =async function (req, res) {
  try{
    let data=await OfficialUser.getDepartmentAndSessionData()
    data.allDepartments.sort(function(a, b){
      if(a.departmentName < b.departmentName) { return -1; }
      if(a.departmentName > b.departmentName) { return 1; }
      return 0;
    })
    console.log("data:",data)
     res.render("sign-up-form",{
      allDepartments:data.allDepartments,
      allSessionYears:data.allSessionYears.reverse()
    })
  }catch{
    res.render("404")
  }
   
}



exports.guestHomePage=async function(req,res){
  try {
    let activities={
      batchActivities:[],
      departmentActivities:[],
      groupActivities:[]
    }
    

    let activityIds=await OfficialUsers.getAllActivityIds()
    if(activityIds.allActivities.length){
      let allActivities=await Activity.getAllActivityDetailsOfArrayIds(activityIds.allActivities)
      
      allActivities.forEach((activity)=>{
        if(activity.activityType=="batch"){
          activities.batchActivities.push(activity)
        }else if(activity.activityType=="department"){
          activities.departmentActivities.push(activity)
        }else if(activity.activityType=="group"){
          activities.groupActivities.push(activity)
        }
      })

      if(activities.batchActivities.length>6){
        activities.batchActivities=activities.batchActivities.slice(0,6)
      }
      if(activities.departmentActivities.length>6){
        activities.departmentActivities=activities.departmentActivities.slice(0,6)
      }
      if(activities.groupActivities.length>6){
        activities.groupActivities=activities.groupActivities.slice(0,6)
      }
    }

    res.render("guest-home",{
      activities:activities
    })
  } catch {
    res.render("404")
  }
}




exports.allDepartments=async function(req,res){
  try {
    let departments=await OfficialUser.getAllDepartments()
    departments.sort(function(a, b){
      if(a.departmentName < b.departmentName) { return -1; }
      if(a.departmentName > b.departmentName) { return 1; }
      return 0;
    })
    res.render("all-departments",{
      departments:departments
    })
  } catch {
    res.render("404")
  }
}

exports.allAcademicGroups=async function(req,res){
  try {
    let allGroups=await Group.getAllGroups()
    console.log(allGroups)
    allGroups=allGroups.map((group)=>{
      let groupData={
        groupId:group.groupId,
        groupName:group.groupName,
        departments:group.presentDepartments
      }
      return groupData
    })

    console.log("GroupData :",allGroups)
    res.render("all-academic-groups",{
      allGroups:allGroups
    })
  } catch {
    res.render("404")
  }
}

exports.globalNotifications=async function(req,res){
  try {
    let globalNotifications=await GlobalNotifications.getGlobalNotifications()
    res.render("global-notification-page",{
      globalNotifications:globalNotifications.reverse()
    })
  } catch {
    res.render("404")
  }
}

exports.searchStudent=function(req,res){
  Student.searchStudent(req.body.searchTerm).then(posts => {
    res.json(posts)
  }).catch(() => {
    res.json([])
  })
}


