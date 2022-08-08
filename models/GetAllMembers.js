const OtherOperations = require("./OtherOperations")

const groupsCollection = require("../db").db().collection("Groups")
const sessionBatchesCollection = require("../db").db().collection("sessionBatches")
const departmentsCollection = require("../db").db().collection("Departments")
 
let GetAllMembers=function(data){
  this.data=data
}
GetAllMembers.getAllMembersFromBatch= function(batchId){
  return new Promise(async(resolve, reject) => {
    try{
      
      let batchDetails=await sessionBatchesCollection.findOne({batchId:batchId})
      
      let allBatchMembers=batchDetails.allMembers.map((member)=>{
        return member.regNumber
      })
      resolve(allBatchMembers)
    }catch{
     reject()
    }
  })
}
GetAllMembers.getAllMembersFromDepartment= function(departmentCode){
  return new Promise(async(resolve, reject) => {
    try{
      let allDepartmentMembers=[]
      let departmentDetails=await departmentsCollection.findOne({departmentCode:departmentCode})
      let presentBatchIds=[]
      if(departmentDetails.activeBatches.firstYear){
        presentBatchIds.push(departmentDetails.activeBatches.firstYear.batchId)
      }
      if(departmentDetails.activeBatches.secondYear){
        presentBatchIds.push(departmentDetails.activeBatches.secondYear.batchId)
      }
      if(departmentDetails.activeBatches.seniours){
        presentBatchIds.push(departmentDetails.activeBatches.seniours.batchId)
      }
      if(departmentDetails.courseDuration=="3"){
        if(departmentDetails.activeBatches.thirdYear){
          presentBatchIds.push(departmentDetails.activeBatches.thirdYear.batchId)
        }
      }
      for (let batchId of presentBatchIds) {
        let batchMembers = await GetAllMembers.getAllMembersFromBatch(batchId)
        allDepartmentMembers=allDepartmentMembers.concat(batchMembers)
      }
      
      resolve(allDepartmentMembers)
    }catch{
     reject()
    }
  })
}
GetAllMembers.getAllMembersFromGroup= function(groupId){
  return new Promise(async(resolve, reject) => {
    try{
      let allGroupMembers=[]
      // let groupDetails=await groupsCollection.findOne({groupId:groupId})
      // let departmentCodes=groupDetails.presentDepartments.map((department)=>{
      //   return department.departmentCode
      // })
      let departmentCodes=OtherOperations.getDepartmentCodesFromGroupId(groupId)
      for (let departmentCode of departmentCodes) {
        let departmentMembers = await GetAllMembers.getAllMembersFromDepartment(departmentCode)
        allGroupMembers=allGroupMembers.concat(departmentMembers)
      }
      resolve(allGroupMembers)
    }catch{
     reject()
    }
  })
}

GetAllMembers.getAllSourceMembers= function(sourceId,sourceType){
  return new Promise(async(resolve, reject) => {
    try{
      let allSourceMembers=[]
      if(sourceType=="batch"){
        allSourceMembers=await GetAllMembers.getAllMembersFromBatch(sourceId)
      }else if(sourceType=="department"){
        allSourceMembers=await GetAllMembers.getAllMembersFromDepartment(sourceId)
      }else{
        allSourceMembers=await GetAllMembers.getAllMembersFromGroup(sourceId)
      }
      resolve(allSourceMembers)
    }catch{
      console.log("error on getAllSourceMembers")
     reject()
    }
  })
  
}
module.exports=GetAllMembers