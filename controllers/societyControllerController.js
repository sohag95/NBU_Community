const Department=require('../models/Department')

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
    res.render('reporting-handling-page')
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

exports.getSocietyHandlingPage =async function (req, res) {
  try{
    res.render('society-handling-page')
  }catch{
    res.render("404")
  }
}
