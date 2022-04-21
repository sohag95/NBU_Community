const department=require('../models/Department')



exports.isDepartmentExists = function (req, res, next) {
  department.findDepartmentByDepartmentCode(req.params.departmentCode)
  .then((departmentDetails)=> {
    req.departmentDetails=departmentDetails
    next()
  }).catch( ()=> {
    res.render("404")
  })
}

exports.getDepartmentDetailsPage = function (req, res) {
  try{
    let departmentDetails=req.departmentDetails
    let checkData={
      isUserLoggedIn:req.isUserLoggedIn,
      isDepartmentMember:false,
      isDepartmentBatchMember:false,
      isDepartmentLeader:false,
      isPresentLeader:false,
      isPreviousLeader:false,
      isXstudent:req.session.user.otherData.isXstudent
    }

    if(checkData.isUserLoggedIn){
      
      departmentDetails.allLeaders.forEach((leader)=>{
        if(leader.regNumber==req.regNumber){
          checkData.isDepartmentLeader=true
        }
      })

      departmentDetails.allPresentMembers.forEach((member)=>{
        if(member.regNumber==req.regNumber){
          checkData.isDepartmentMember=true
        }
      })

      if(req.regNumber.slice(4,9)==departmentDetails.departmentCode){
        if(req.otherData.isVerified){
          //req.otherData.isBatchLeader=true/false have to store on req.otherData on session
          //department member are those who are already batch leaders.
          checkData.isDepartmentBatchMember=true
        }
      }

      if(departmentDetails.presentLeader){
        if(departmentDetails.presentLeader.regNumber==req.regNumber){
          checkData.isPresentLeader=true
        }
      }
      
      if(departmentDetails.previousLeader){
        if(batchDetails.previousLeader.regNumber==req.regNumber){
          checkData.isPreviousLeader=true
        }
      }
    
    }

    console.log("Department Details :",departmentDetails)
    console.log("Check data :",checkData)
    res.render('get-department-details-page',{
      departmentDetails:departmentDetails,
      checkData:checkData
    })
  }catch{
    res.render('404')
  }
}
