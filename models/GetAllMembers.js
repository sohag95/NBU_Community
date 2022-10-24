const OtherOperations = require("./OtherOperations")

const groupsCollection = require("../db").db().collection("Groups")
const sessionBatchesCollection = require("../db").db().collection("sessionBatches")
const departmentsCollection = require("../db").db().collection("Departments")
 
let GetAllMembers=function(data){
  this.data=data
}
GetAllMembers.getAllMembersFromBatch= function(batchId,type){
  return new Promise(async(resolve, reject) => {
    try{
      
      let batchDetails=await sessionBatchesCollection.findOne({batchId:batchId})
      
      let allBatchMembers=batchDetails.allMembers.map((member)=>{
        if(type=="details"){
          return{
            userName:member.userName,
            regNumber:member.regNumber
          }
        }else{
          return member.regNumber
        } 
      })
      console.log("allBatchMembers :",allBatchMembers)
      resolve(allBatchMembers)
    }catch{
     reject()
    }
  })
}
GetAllMembers.getAllMembersFromDepartment= function(departmentCode,type){
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
        let batchMembers = await GetAllMembers.getAllMembersFromBatch(batchId,type)
        allDepartmentMembers=allDepartmentMembers.concat(batchMembers)
      }
      
      resolve(allDepartmentMembers)
    }catch{
     reject()
    }
  })
}
GetAllMembers.getAllMembersFromGroup= function(groupId,type){
  return new Promise(async(resolve, reject) => {
    try{
      let allGroupMembers=[]
      // let groupDetails=await groupsCollection.findOne({groupId:groupId})
      // let departmentCodes=groupDetails.presentDepartments.map((department)=>{
      //   return department.departmentCode
      // })
      let departmentCodes=OtherOperations.getDepartmentCodesFromGroupId(groupId)
      for (let departmentCode of departmentCodes) {
        let departmentMembers = await GetAllMembers.getAllMembersFromDepartment(departmentCode,type)
        allGroupMembers=allGroupMembers.concat(departmentMembers)
      }
      resolve(allGroupMembers)
    }catch{
     reject()
    }
  })
}

GetAllMembers.getAllSourceMembers= function(sourceId,sourceType,type){
  return new Promise(async(resolve, reject) => {
    try{
      //type=details/undefined
      //here type=details will give users-userName+regNumber otherwise only regNumber
      let allSourceMembers=[]
      if(sourceType=="batch"){
        allSourceMembers=await GetAllMembers.getAllMembersFromBatch(sourceId,type)
      }else if(sourceType=="department"){
        allSourceMembers=await GetAllMembers.getAllMembersFromDepartment(sourceId,type)
      }else{
        allSourceMembers=await GetAllMembers.getAllMembersFromGroup(sourceId,type)
      }
      resolve(allSourceMembers)
    }catch{
      console.log("error on getAllSourceMembers")
     reject()
    }
  })
  
}
module.exports=GetAllMembers