const Department=require('../models/Department')

exports.societyControllerHome =async function (req, res) {
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
    console.log("departments :",departments)
    res.render('societyController-home',{
      allDepartments:departments
    })
  }catch{
    res.render("404")
  }
  
}