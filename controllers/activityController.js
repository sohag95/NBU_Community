const Activity = require("../models/Activity")
const Department = require("../models/Department")
const Group = require("../models/Group")
const SessionBatch = require("../models/SessionBatch")

exports.ifStudentPresentLeader=async function(req,res,next){
  try{
    let from=req.params.from.toLowerCase()
    let id=req.params.id.toUpperCase()
    let isIdPresent=false
    let isCreatorLeader=false
     req.detailsData=null
    if (from == "batch") {
      let batchId=id
      let batchDetails=await SessionBatch.findSessionBatchDetailsByBatchId(batchId)
      if(batchDetails){
        if(batchDetails.presentLeader.regNumber==req.regNumber || batchDetails.previousLeader.regNumber==req.regNumber){
          isIdPresent=true
          isCreatorLeader=true
          req.detailsData=batchDetails
        }
      }
    }else if(from=="department"){
      let departmentCode=id
      let departmetnDetails=await Department.findDepartmentByDepartmentCode(departmentCode)
      if(departmetnDetails){
        if(departmetnDetails.presentLeader.regNumber==req.regNumber || departmetnDetails.previousLeader.regNumber==req.regNumber){
          isIdPresent=true
          isCreatorLeader=true
          req.detailsData=departmetnDetails
        }
      }
    }else if(from=="group"){
      let groupId=id
      let groupDetails=await Group.findGroupByGroupId(groupId)
      if(groupDetails){
        if(groupDetails.presentLeader.regNumber==req.regNumber || groupDetails.previousLeader.regNumber==req.regNumber){
          isIdPresent=true
          isCreatorLeader=true
          req.detailsData=groupDetails
        }
      }
    } else {
      req.flash("errors", "Data manipulation ditected!!")
      req.session.save(()=>res.redirect("/"))
    }
    if(isIdPresent && isCreatorLeader){
      next()
    }else{
      req.flash("errors", "You don't have permission to perform that action.")
      req.session.save(()=>res.render("404"))
    }
  }catch{
    res.render("404")
  }
}

exports.getActivityCreationPage=function(req,res){
  try{
    req.detailsData=undefined//As in this router detailsData is not needed so value initialized as null
    //topics will be changed with the res.params.form value
    let topics=[
      "Having Fun",
      "Group Study",
      "Social Work",
      "Campus Tour"
    ]
    let activityData={
      from:req.params.from,
      id:req.params.id,
      topics:topics
    }

    res.render("activity-creation-form",{
      activityData:activityData
    })
  }catch{
    res.render("404")
  }
}

exports.getExtraData=function(req,res,next){
  req.creatorData={
    regNumber:req.regNumber,
    userName:req.userName
  }
  let assistantLead
  if(req.detailsData.previousLeader){
    assistantLead={
      regNumber:req.detailsData.previousLeader.regNumber,
      userName:req.detailsData.previousLeader.userName,
    }
  }else{
    assistantLead=null
  }
  let sourceName=null
  if(req.params.from=="batch" || req.params.from=="department"){
    sourceName=req.detailsData.departmentName
  }else{
    sourceName=req.detailsData.groupName
  }
  req.neededData={
    from:req.params.from,
    sourceId:req.params.id,
    sourceName:sourceName,
    leaders:{
      mainLead:{
        regNumber:req.detailsData.presentLeader.regNumber,
        userName:req.detailsData.presentLeader.userName,
      },
      assistantLead:assistantLead
    }
  }
  next()
}

exports.createNewActivity=function(req,res){
  let activity=new Activity(req.body,req.creatorData,req.neededData)
  console.log("body data :",req.body)
  console.log("Creator data:",req.creatorData)
  console.log("Needed data :",req.neededData)
  //free the space
  req.detailsData=undefined
  req.needeData=undefined
  //##############
  activity.createNewActivity().then(()=>{
    res.render("404")
  }).catch((e)=>{

  })
}