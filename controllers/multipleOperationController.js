
const Department = require('../models/Department')
const Group=require('../models/Group')
const OfficialUsers = require('../models/OfficialUsers')
const SessionBatch=require('../models/SessionBatch')

//during sign up new account this function will be called
//for each account there might be 3 cases:
//case 1:account is very first so account can be batch leader,department leader,and group member
//case 2:batch leader is not set,account will be varified by department leader
//case 3:batch leader is set,account will be varified by batch present leader

exports.checkAccountPosition =async function (req, res, next) {
  try{
    console.log("req.body:",req.body)
    let batchDetails=await SessionBatch.findSessionBatchDetailsBySignUpData(req.body.sessionYear,req.body.departmentCode)
    console.log("batch etails :",batchDetails)
    if(batchDetails){
      let batchData={
        batchId:batchDetails.batchId,
        departmentName:batchDetails.departmentName,
        groupId:batchDetails.groupId,
        batchState:batchDetails.batchState,
        batchLeader:batchDetails.presentLeader,
        departmentLeader:"Set"
      }
      if(!batchData.batchLeader){
        //if batch leader is not set,then the users account should varified by the department's present leader
        let departmentDetails=await Department.findDepartmentByDepartmentCode(req.body.departmentCode)
        if(!departmentDetails.presentLeader){
          //if department present leader is not present then the users account is very first one,so this account should add on group member's field on group
          batchData.departmentLeader=null
        }else{
          batchData.departmentLeader=departmentDetails.presentLeader
        }
      }
      let communityController=await OfficialUsers.getCommunityControllerData()
      req.batchData=batchData
      req.communityController=communityController
      next()
    }else{
      req.flash("errors", "Sorry batch is not available.Please,contact with us.")
      req.session.save(function () {
        res.redirect("/sign-up")
      })
    }
  }catch{
    console.log("Error from checkAccountPosition")
    res.render("404")
  }
}