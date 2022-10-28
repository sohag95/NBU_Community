const Department=require('../models/Department')
const Reporting = require('../models/Reporting')

exports.societyControllerHome =async function (req, res) {
  try{
    res.render('societyController-home')
  }catch{
    res.render("404")
  }
}

exports.getVerifyCase1AccountPage =async function (req, res) {
  try{
    let allDepartments=await Department.getAllDepartments()
    let departments=allDepartments.map((department)=>{
      let departmentData={
        departmentCode:department.departmentCode,
        departmentName:department.departmentName,
        departmentCode:department.departmentCode,
        presentLeader:department.presentLeader,
        groupId:department.groupId,
        newBatchMemberRequests:department.newBatchMemberRequests
      }
      return departmentData
    })
    res.render('verify-case1-account-page',{
      allDepartments:departments
    })
  }catch{
    res.render("404")
  }
}

exports.getHandleReportingPage =async function (req, res) {
  try{
    let allReports={
      badComments:[],
      fakeParticipants:[],
      fakeActivity:[],
      fakeStudent:[]
    }
    let unresolvedReports=await Reporting.getAllUnResolvedReports()
    unresolvedReports.forEach((report)=>{
      if(report.reportType.subType=="badComment"){
        allReports.badComments.push(report)
      }else if(report.reportType.subType=="notParticipant"){
        allReports.fakeParticipants.push(report)
      }else if(report.reportType.subType=="fakeStudent"){
        allReports.fakeStudent.push(report)
      }else if(report.reportType.subType=="fakeActivity"){
        allReports.fakeActivity.push(report)
      }
    })
    res.render('reporting-handling-page',{
      allReports:allReports
    })
  }catch{
    res.render("404")
  }
}

exports.getVerifyUserAccountPage =async function (req, res) {
  try{
    res.render('verify-user-by-societyController-page')
  }catch{
    res.render("404")
  }
}

exports.gotoVerificationPage = function (req, res) {
  try{
    let regNumber=req.body.regNumber.toUpperCase()
    res.redirect(`/verification/${req.body.verificationCase}/${regNumber}/page`)
  }catch{
    res.render("404")
  }
}

exports.getSocietyHandlingPage =async function (req, res) {
  try{
    res.render('society-handling-page')
  }catch{
    res.render("404")
  }
}
