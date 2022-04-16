const Department = require('../models/Department')
const Group=require('../models/Group')
const SessionBatch=require('../models/SessionBatch')

exports.createNewSessionBatch=async function(req,res){
  try{
    console.log("Form data:",req.body)
    //new sessionBatch has to create
    let sessionBatch= new SessionBatch(req.body)
    sessionBatch.createSessionBatch().then(async()=>{
      //add the session year on group's batch year array to know wheather for a particular year batch created or not
      let group=new Group(req.body)
      await group.addSessionYearAsBatchCreated()
      //update activeBatches year sequences in department table
      let dataSetToDept={
        departmentCode:req.body.departmentCode,
        newSession:sessionBatch.data.batchSessionYear,
        batchId:sessionBatch.data.batchId
      }
      await Department.updateActiveBatchesSequenceYear(dataSetToDept)
      req.flash("success", "New batch added successfully!!")
      req.session.save(function () {
        res.redirect("/admin-home")
      })
      
    }).catch((error)=>{
      req.flash("errors", error)
      req.session.save(function () {
        res.redirect("/admin-home")
      })
    })
  }catch{
    res.render("404")
  }
  
}



exports.isSessionBatchExists = function (req, res, next) {
  SessionBatch.findSessionBatchDetailsByBatchId(req.params.batchId)
  .then((batchDetails)=> {
    req.batchDetails=batchDetails
    next()
  }).catch( ()=> {
    res.render("404")
  })
}



exports.getSessionBatchDetailsPage = function (req, res) {
  try{
    let batchDetails=req.batchDetails
    let checkData={
      isUserLoggedIn:req.isUserLoggedIn,
      isBatchMember:false,
      isBatchLeader:false,
      isPresentLeader:false,
      isPreviousLeader:false,
    }
    
    if(checkData.isUserLoggedIn){
      batchDetails.allLeaders.forEach((leader)=>{
        if(leader.regNumber==req.regNumber){
          checkData.isBatchLeader=true
        }
      })

      if(req.regNumber.slice(0,9)==batchDetails.batchId){
        if(req.otherData.isVerified){
          checkData.isBatchMember=true
        }
      }

      if(batchDetails.presentLeader){
        if(batchDetails.presentLeader.regNumber==req.regNumber){
          checkData.isPresentLeader=true
        }
      }
      
      if(batchDetails.previousLeader){
        if(batchDetails.previousLeader.regNumber==req.regNumber){
          checkData.isPreviousLeader=true
        }
      }
    
    }
    
    console.log("batch Details :",batchDetails)
    console.log("checkData: ",checkData)
    res.render('get-batch-details-page',{
      batchDetails:batchDetails,
      checkData:checkData
    })
  }catch{
    res.render('404')
  }
}
