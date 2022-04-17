const OfficialUser=require('../models/OfficialUsers')
const Student = require('../models/Student')


exports.test = function (req, res) {
  res.render('test-page')
}

exports.ifUserLoggedIn = function (req, res,next) {
  req.isUserLoggedIn=false
  if(req.session.user){
    req.isUserLoggedIn=true
  }
  next()
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
          req.session.user = {regNumber: societyController.data.regNumber, userName: societyController.data.userName,accountType:"societyController"}
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
          req.session.user = {regNumber: postController.data.regNumber, userName: postController.data.userName,accountType:"postController"}
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
          req.session.user = {regNumber: videoEditor.data.regNumber, userName: videoEditor.data.userName,accountType:"videoEditor"}
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
     res.render("sign-up-form",{
      allDepartments:data.allDepartments,
      allSessionYears:data.allSessionYears
    })
  }catch{
    res.render("404")
  }
   
}



exports.guestHomePage=async function(req,res){
  try {
    res.render("guest-home")
  } catch {
    res.render("404")
  }
}


