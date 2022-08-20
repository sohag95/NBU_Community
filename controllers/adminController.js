const Admin=require('../models/Admin')
const OfficialUsers=require('../models/OfficialUsers')
const Group=require('../models/Group')
const OtherOperations=require('../models/OtherOperations')
const Student = require('../models/Student')

exports.adminHome =async function (req, res) {
  try{
    let getAllDepartments=await OfficialUsers.getAllDepartments()
    let getAllGroups=await Group.getAllGroups()
    let remainDepartments=getAllDepartments.filter((department)=>{
      if(department.groupId==null){
        return department
      }
    })
    let rejectedAccountIds=await OfficialUsers.getRejectedAccounts()
    console.log("remain Departments:",remainDepartments)
    console.log("All groups:",getAllGroups)
    res.render('admin-home',{
      remainDepartments:remainDepartments,
      allGroups:getAllGroups,
      rejectedAccounts:rejectedAccountIds.length
    })
  }catch{
    res.render('404')
  }
}

exports.getRejectedAccounts =async function (req, res) {
  try{
    let regNumbers=await OfficialUsers.getRejectedAccounts()
    let rejectedAccounts=await Student.getAccountDetailsByRegNumbers(regNumbers)
    console.log("reg numbers:",regNumbers)
    res.render('rejected-accounts',{
      rejectedAccounts:rejectedAccounts
    })
  }catch{
    res.render('404')
  }
}

exports.deleteAccount =async function (req, res) {
  Student.deleteAccount(req.params.regNumber).then(()=>{
    req.flash("success", "Rejected account deleted successfully!!")
    req.session.save(function () {
      res.redirect("/rejected-accounts")
    })
  }).catch(()=>{
    req.flash("errors", "There was some problem!!")
    req.session.save(function () {
      res.redirect("/admin-home")
    })
  })
}

exports.addDepartment = function (req, res) {
  let admin = new Admin(req.body)
  admin
    .addDepartment()
    .then(() => {
      req.flash("success", "Department added successfully!!")
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
    .catch(regErrors => {
      regErrors.forEach(function (error) {
        req.flash("regErrors", error)
      })
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
}

exports.addNewGroup = function (req, res) {
  let addedDepartments=JSON.parse(req.body.addedDepartments)
  let data={
    groupName:req.body.groupName,
    addedDepartments:addedDepartments
  }
  console.log("Added departments on Group :",addedDepartments)
  let admin = new Admin(data)
  admin.addNewGroup()
    .then(() => {
      req.flash("success", "New Group added successfully!!")
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
    .catch(regErrors => {
      regErrors.forEach(function (error) {
        req.flash("regErrors", error)
      })
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
}

exports.addNewSessionYear = function (req, res) {
  let sessionYearNotAdded=true
  req.session.user.otherData.allSessionYears.forEach((year)=>{
    if(year==req.body.newSession){
      sessionYearNotAdded=false
    }
  })
  if(sessionYearNotAdded){
    Admin.addNewSessionYear(req.body.newSession)
    .then(() => {
      req.flash("success", "New session year added successfully!!")
      req.session.user.otherData.presentSession = req.body.newSession
      req.session.user.otherData.allSessionYears.push(req.body.newSession) 
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
    .catch((error) => {
      req.flash("errors", error)
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
  }else{
    req.flash("errors", `Session year-${req.body.newSession} has been already added.`)
    req.session.save(function () {
      res.redirect("/admin-home")
    })
  }
  
}



exports.setPresentSessionYear = function (req, res) {
  let sessionYearPresent=false
  req.session.user.otherData.allSessionYears.forEach((year)=>{
    if(year==req.body.sessionYear){
      sessionYearPresent=true
    }
  })
  if(sessionYearPresent){
    Admin
    .setPresentSessionYear(req.body.sessionYear)
    .then(() => {
      req.session.user.otherData.presentSession=req.body.sessionYear
      req.flash("success", "Present session year added successfully!!")
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
    .catch(error => {
      req.flash("errors", error)
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
  }else{
    req.flash("errors", "Selected session year is not present.")
    req.session.save( () =>{
      res.redirect("/admin-home")
    })
  }
  
}