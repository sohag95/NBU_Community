const SessionBatch = require("../models/SessionBatch")
const Student = require("../models/Student")
const Verification = require("../models/Verification")
const Department = require("../models/Department")

exports.checkVerifier=async function(req,res,next){
  try{
      if(req.params.case=="rejected"){
        req.verifierData=null
        next()
      }else if(req.accountType=="societyController"){
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
  }catch{
    req.flash("errors", "There is some problem.")
    req.session.save(() => res.redirect("/"))
  }
  
}


exports.checkStudentAccount=async function(req,res,next){
  try{
      let studentData=await Student.getStudentDataByRegNumber(req.params.regNumber)
      if(studentData){
        req.studentData={
          regNumber:studentData.regNumber,
          userName:studentData.userName,
          phone:studentData.phone,
          gender:studentData.gender,
          sessionYear:studentData.sessionYear,
          groupId:studentData.groupId,
          batchId:studentData.regNumber.slice(0,9),
          departmentName:studentData.departmentName,
          email:studentData.email,
          isVerified:studentData.isVerified,
          verificationType:studentData.verifiedBy.verificationType,
          createdDate:studentData.createdDate,
          isRejected:false
        }
        req.verification=studentData.verification
        if(req.studentData.verificationType=="rejected"){
          req.studentData.isRejected=true
        }
        next()
      }else{
        req.flash("errors", "Student account deleted or you may modified data!!")
        req.session.save(() => res.render("404"))
      }
      
  }catch{
    req.flash("errors", "Sorry,there is some problem.Try again later.")
    req.session.save(() => res.redirect("/"))
  }
}

exports.checkifAlreadyVerified=function(req,res,next){
  if(!req.studentData.isVerified){
    next()
  }else{
    req.flash("errors", "The account is already verified!")
    req.session.save(() => res.redirect(`/verification/${req.studentData.verificationType}/${req.studentData.regNumber}/page`))
  }
}

exports.checkifAlreadyRejected=function(req,res,next){
  if(!req.studentData.isRejected){
    if(req.studentData.verificationType=="case3"){
      next()
    }else{
      req.flash("errors", "Only 'case3' verification type accounts can be rejected!!")
      req.session.save(() => res.redirect(`/verification/${req.studentData.verificationType}/${req.studentData.regNumber}/page`))
    }
  }else{
    req.flash("errors", "The is already rejected!")
    req.session.save(() => res.redirect(`/verification/${req.studentData.verificationType}/${req.studentData.regNumber}/page`))
  }
}

exports.getVerificationPage=function(req,res){
  console.log("Student data:",req.studentData)
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
    batchId:req.studentData.batchId,
    departmentName:req.studentData.departmentName,
    isVerified:req.studentData.isVerified,
    verificationType:req.studentData.verificationType,
    phone:req.studentData.phone,
    email:req.studentData.email
  }
  let verificationCode=req.body.verificationCode
  console.log("code :",req.verification.code," match :",verificationCode)
  if(verificationCode==String(req.verification.code)){
    let verification=new Verification(studentData,verifierData)
    verification.verifyStudentAccount().then(()=>{
      req.flash("success", "Account is verified successfully.")
      req.session.save(() => res.redirect(`/verification/${studentData.verificationType}/${studentData.regNumber}/page`))
    }).catch((e)=>{
      req.flash("errors", "Error occured somewhare. "+e)
      req.session.save(() => res.redirect(`/verification/${studentData.verificationType}/${studentData.regNumber}/page`))
    })
  }else{
    req.flash("errors", "Sorry!!Verification code has not matched!!")
    req.session.save(() => res.redirect(`/verification/${studentData.verificationType}/${studentData.regNumber}/page`))
  }
}


exports.accountReject=function(req,res){
  let studentData=req.studentData
  if(req.body.reason){
    let verification=new Verification(studentData,req.verifierData)
    verification.rejectAccount(req.body.reason).then(()=>{

      req.flash("success", "Account has rejected successfully.")
      req.session.save(() => res.redirect(`/verification/rejected/${studentData.regNumber}/page`))
    }).catch(()=>{
      req.flash("errors", "Error occured somewhare. ")
      req.session.save(() => res.redirect(`/verification/${studentData.verificationType}/${studentData.regNumber}/page`))
    })
  }else{
    req.flash("errors", "You must give the reason of rejection.")
    req.session.save(() => res.redirect(`/verification/${studentData.verificationType}/${studentData.regNumber}/page`))
  }
  
}
