const SessionBatch = require("../models/SessionBatch")
const Student = require("../models/Student")
const Verification = require("../models/Verification")
const Department = require("../models/Department")

exports.checkVerifier=async function(req,res,next){
  try{
    if(req.session.user){
      if(req.accountType=="societyController"){
        req.verifierData={
          verifierType:"Society Controller",
          regNumber:req.regNumber,
          userName:req.userName,
          verificationDate:new Date()
        }
        next()
      }else if(req.session.user.accountType=="student"){
        if(req.params.case=="case2"){
          //verifier should be a department leader
          let isDepartmentLeader=false
          let departmentDetails=await Department.findDepartmentByDepartmentCode(req.params.regNumber.slice(4,9))
          departmentDetails.allLeaders.forEach((leader)=>{
            if(leader.regNumber==req.regNumber){
              isDepartmentLeader=true
            }
          })
          if(isDepartmentLeader){
            req.verifierData={
              verifierType:"Department leader",
              regNumber:req.regNumber,
              userName:req.userName,
              verificationDate:new Date()
            }
            console.log("This is case2 verification.")
            next()
          }else{
            req.flash("errors", "You don't have permission to perform that action.")
            req.session.save(() => res.redirect("/"))
          }
        }else if(req.params.case=="case3"){
          //verifier should be a batch leader
          let isBatchLeader=false
          let batchDetails=await SessionBatch.findSessionBatchDetailsByBatchId(req.params.regNumber.slice(0,9))
          batchDetails.allLeaders.forEach((leader)=>{
            if(leader.regNumber==req.regNumber){
              isBatchLeader=true
            }
          })
          if(isBatchLeader){
            req.verifierData={
              verifierType:"Batch leader",
              regNumber:req.regNumber,
              userName:req.userName,
              verificationDate:new Date()
            }
            console.log("This is case3 verification.")
            next()
          }else{
            req.flash("errors", "You don't have permission to perform that action.")
            req.session.save(() => res.redirect("/"))
          }
        }else{
          req.flash("errors", "You don't have permission to perform that action.")
          req.session.save(() => res.redirect("/"))
        }
      }else{
        req.flash("errors", "You don't have permission to perform that action.")
        req.session.save(() => res.redirect("/"))
      } 
    }else{
      req.flash("errors", "You should log-in first to perform that action.")
      req.session.save(() => res.redirect("/log-in"))
    }
  }catch{
    req.flash("errors", "There is some problem.")
    req.session.save(() => res.redirect("/"))
  }
  
}


exports.checkStudentAccount=async function(req,res,next){
  try{
    if(req.session.user){
      let studentData=await Student.getStudentDataByRegNumber(req.params.regNumber)
      if(studentData){
        req.studentData={
          regNumber:studentData.regNumber,
          userName:studentData.userName,
          phone:studentData.phone,
          gender:studentData.gender,
          sessionYear:studentData.sessionYear,
          groupId:studentData.groupId,
          departmentName:studentData.departmentName,
          email:studentData.email,
          isVerified:studentData.isVerified,
          verificationType:studentData.verifiedBy.verificationType,
          createdDate:studentData.createdDate,
        }
      }else{
        res.render("404")
      }
      next()
    }else{
      req.flash("errors", "You should log-in first to perform that action.")
      req.session.save(() => res.redirect("/log-in"))
    }
  }catch{
    req.flash("errors", "Sorry,there is some problem.Try again later.")
    req.session.save(() => res.redirect("/"))
  }
}


exports.getVerificationPage=function(req,res){
  res.render("verification-page",{
    studentData:req.studentData
  })
}

exports.accountVerified=function(req,res){
  let verifierData=req.verifierData
  let studentData={
    regNumber:req.studentData.regNumber,
    userName:req.studentData.userName,
    groupId:req.studentData.groupId,
    departmentCode:req.studentData.regNumber.slice(4,9),
    batchId:req.studentData.regNumber.slice(0,9),
    departmentName:req.studentData.departmentName,
    isVerified:req.studentData.isVerified,
    verificationType:req.studentData.verificationType,
    phone:req.studentData.phone
  }
  let verification=new Verification(studentData,verifierData)
  verification.verifyStudentAccount().then(()=>{
    req.flash("success", "Account is verified successfully.")
    req.session.save(() => res.redirect(`/verification/${studentData.verificationType}/${studentData.regNumber}/page`))
  }).catch((e)=>{
    req.flash("errors", "Error occured somewhare. "+e)
    req.session.save(() => res.redirect(`/verification/${studentData.verificationType}/${studentData.regNumber}/page`))
  })
}


exports.accountReject=function(req,res){
  let studentData=req.studentData
  let verification=new Verification()
  
  res.render("verification-page",{
    studentData:req.studentData
  })
}
