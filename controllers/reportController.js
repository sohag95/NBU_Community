const Reporting = require("../models/Reporting")


exports.checkReportType=function(req,res,next){
    req.reportingData={
      reportType:{
        type:req.body.type,
        subType:req.body.subType,
      },
      reportedBy:{
        regNumber:req.regNumber,
        userName:req.userName
      }
  }
  
  console.log("Get data:",req.reportingData)
  let reporting=new Reporting(req.reportingData)
  let valid=reporting.checkReportingData()
    if(valid){
      next()
    }else{
      req.flash("errors", "Reporting type is not valid !!")
      req.session.save( () =>{
        res.redirect("/")
      })
    }
}


exports.checkIfAlreadyReported=async function(req,res,next){
  try{
    if(req.reportingData.reportType.subType=="badComment"){
      req.reportingData.reportingId={
        activityId:req.body.reportingId,
        commentIndex:Number(req.body.commentIndex)
      }
    }else if(req.reportingData.reportType.subType=="notParticipant"){
      req.reportingData.reportingId={
        activityId:req.body.reportingId,
        participantIndex:Number(req.body.participantIndex)
      }
    }else if(req.reportingData.reportType.subType=="fakeStudent"){
      req.reportingData.reportingId={
        regNumber:req.body.reportingId,
      }
    }else if(req.reportingData.reportType.subType=="fakeActivity"){
      req.reportingData.reportingId={
        activityId:req.body.reportingId,
      }
    }
    let reporting=new Reporting(req.reportingData)
    let found=await reporting.checkIfAlreadyReported()
    if(!found){
      next()
    }else{
      req.flash("errors", "You have already reported for this problem!!")
      req.session.save( () =>{
        res.redirect("/")
      })
    }
  }catch{
    res.render("404")
  }
}

exports.sentReport=async function(req,res){
  try{
    if(req.regNumber!=req.reportingData.reportingId){
      let reporting=new Reporting(req.reportingData)
      reporting.sentReport().then(()=>{
        req.flash("success", "Report accepted!!!")
        res.redirect("/test")
      }).catch((err)=>{
        req.flash("errors", err)
        res.redirect("/")
      })
    }else{
      req.flash("errors", "You can not report for yourself")
      res.redirect("/")
    }
  }catch{
    res.render("404")
  }
  
}