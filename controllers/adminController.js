const Admin=require('../models/Admin')
const OfficialUsers=require('../models/OfficialUsers')
const Group=require('../models/Group')
const OtherOperations=require('../models/OtherOperations')
const Student = require('../models/Student')

exports.adminHome =async function (req, res) {
  try{
    let rejectedAccountIds=await OfficialUsers.getRejectedAccounts()
    res.render('admin-home',{
      rejectedAccounts:rejectedAccountIds.length
    })
  }catch{
    res.render('404')
  }
}

exports.setUpStartingData =async function (req, res) {
    Admin.setUpStartingData().then(()=>{
      req.flash("success", "Official data set-up successfully completed!!")
      req.session.save(()=> {
        res.redirect("/handle-official-user-data")
      })
    }).catch(()=>{
      req.flash("errors", "There is some problem!!")
      req.session.save(()=>{
        res.render('404')
      })
    })
}

exports.addNewSessionBatchPage =async function (req, res) {
  try{
    let getAllGroups=await Group.getAllGroups()
    res.render('add-new-session-batch-page',{
      allGroups:getAllGroups
    })
  }catch{
    res.render('404')
  }
}

exports.addDepartmentAndCreateGroup =async function (req, res) {
  try{
    let getAllDepartments=await OfficialUsers.getAllDepartments()
    let remainDepartments=getAllDepartments.filter((department)=>{
      if(department.groupId==null){
        return department
      }
    })
    res.render('add-department-and-group-page',{
      remainDepartments:remainDepartments
    })
  }catch{
    res.render('404')
  }
}

exports.handleOfficialUserData =async function (req, res) {
  try{
    let adminData=await OfficialUsers.getAdminData()
    let isStartingSetUpDone=adminData.isStartingSetUpDone
    res.render('handle-official-user-data-page',{
      isStartingSetUpDone:isStartingSetUpDone
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
      res.redirect("/handle-rejected-accounts")
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
        res.redirect("/add-department-and-create-group")
      })
    })
    .catch(regErrors => {
      regErrors.forEach(function (error) {
        req.flash("regErrors", error)
      })
      req.session.save(function () {
        res.redirect("/add-department-and-create-group")
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
        res.redirect("/add-department-and-create-group")
      })
    })
    .catch(regErrors => {
      regErrors.forEach(function (error) {
        req.flash("regErrors", error)
      })
      req.session.save(function () {
        res.redirect("/add-department-and-create-group")
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
        res.redirect("/add-new-session-batch")
      })
    })
    .catch((error) => {
      req.flash("errors", error)
      req.session.save(function () {
        res.redirect("/add-new-session-batch")
      })
    })
  }else{
    req.flash("errors", `Session year-${req.body.newSession} has been already added.`)
    req.session.save(function () {
      res.redirect("/add-new-session-batch")
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