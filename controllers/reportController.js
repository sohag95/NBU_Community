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
        commentIndex:Number(req.body.commentIndex),
        comment:req.body.comment
      }
    }else if(req.reportingData.reportType.subType=="notParticipant"){
      req.reportingData.reportingId={
        activityId:req.body.reportingId,
        regNumber:req.body.regNumber,
        userName:req.body.userName,
        participantIndex:Number(req.body.participantIndex)
      }
    }else if(req.reportingData.reportType.subType=="fakeStudent"){
      req.reportingData.reportingId={
        regNumber:req.body.reportingId,
        userName:req.body.userName
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
      req.flash("errors", "You have already reported for this issue!!")
      if(req.body.subType=="fakeStudent"){
        //go to batch page
        res.redirect(`/batch/${req.regNumber.slice(0,9)}/details`)
      }else{
        //goto activity page
        res.redirect(`/activity/${req.body.reportingId}/details`)
      }
    }
  }catch{
    res.render("404")
  }
}

exports.sentReport=async function(req,res){
  try{
    if(req.regNumber!=req.body.reportingId){
      let reporting=new Reporting(req.reportingData)
      reporting.sentReport().then(()=>{
        req.flash("success", "Report accepted!!!")
        if(req.body.subType=="fakeStudent"){
          //go to batch page
          res.redirect(`/batch/${req.regNumber.slice(0,9)}/details`)
        }else{
          //goto activity page
          res.redirect(`/activity/${req.body.reportingId}/details`)
        }
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

exports.reportResolved= function(req,res){
    Reporting.markReportAsResolved(req.body.reportId).then(()=>{
      req.flash("success", "Successfully resolved the report!!")
      res.redirect("/handle-reporting-page")
    }).catch(()=>{
      req.flash("errors", "Sorry there is some problem!!")
      res.redirect("/handle-reporting-page")
    })
}