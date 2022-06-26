const group=require('../models/Group')


exports.isGroupExists = function (req, res, next) {
  group.findGroupByGroupId(req.params.groupId)
  .then((groupDetails)=> {
    req.groupDetails=groupDetails
    next()
  }).catch( ()=> {
    res.render("404")
  })
}


exports.getGroupDetailsPage = function (req, res) {
  try{
    let groupDetails=req.groupDetails
    let checkData={
      isUserLoggedIn:req.isUserLoggedIn,
      isGroupMember:false,
      isGroupDepartmentMember:false,
      isGroupLeader:false,
      isPresentLeader:false,
      isPreviousLeader:false,
      isXstudent:req.session.user.otherData.isXstudent
    }

    if(checkData.isUserLoggedIn){
      groupDetails.allLeaders.forEach((leader)=>{
        if(leader.regNumber==req.regNumber){
          checkData.isGroupLeader=true
        }
      })

      groupDetails.allMembers.forEach((member)=>{
        if(member.regNumber==req.regNumber){
          checkData.isGroupMember=true
        }
      })

      groupDetails.presentDepartments.forEach((department)=>{
        if(department.departmentCode==req.regNumber.slice(4,9)){
          checkData.isGroupDepartmentMember=true
        }
      })

      if(groupDetails.presentLeader){
        if(groupDetails.presentLeader.regNumber==req.regNumber){
          checkData.isPresentLeader=true
        }
      }
      
      if(groupDetails.previousLeader){
        if(batchDetails.previousLeader.regNumber==req.regNumber){
          checkData.isPreviousLeader=true
        }
      }
    
    }

    console.log("group details :",groupDetails)
    console.log("checkData:",checkData)
    res.render('get-group-details-page',{
      groupDetails:groupDetails,
      checkData:checkData
    })
  }catch{
    res.render('404')
  }
}

exports.getGroupPreviousDetailsPage = function (req, res) {
  try{
    res.render('group-previous-details-page')
  }catch{
    res.render('404')
  }
}