
let OtherOperations=function(data){
this.data=data
}
OtherOperations.getDepartmentCodesFromGroupId=function(groupId){
  let number=Number(groupId.slice(0,1))
  console.log(number)
  let departmentCodes=[]
  let start=1
  let end=6
  for(let i=1;i<=number;i++){
    let code=groupId.slice(start,end)
    departmentCodes.push(code)
    start+=5
    end+=5
  }
  console.log("Codes :",departmentCodes)
  return departmentCodes
 }

 OtherOperations.getBatchId=function(sessionYear,departmentCode){
  let firstYear=sessionYear.slice(2,4)
  let secondYear=sessionYear.slice(7,9)
  let batchId=firstYear+secondYear+departmentCode
  return batchId
 }

 OtherOperations.getNewActiveBatchesSequenceAndXBatch=function(departmentData,dataSet){
  
  // let dataSet={
  //   departmentCode:req.body.departmentCode,
  //   newSession:sessionBatch.data.batchSessionYear,
  //   batchId:sessionBatch.data.batchId
  // }

  let newActiveBatches={}
  let recentXBatch={}
  if(departmentData.courseDuration=="2"){
    newActiveBatches={
      firstYear:{
        batchId:dataSet.batchId,
        sessionYear:dataSet.newSession
      },
      secondYear:departmentData.activeBatches.firstYear,
      seniours:departmentData.activeBatches.secondYear
    }
    recentXBatch=departmentData.activeBatches.seniours
  }else if(departmentData.courseDuration=="3"){
    newActiveBatches={
      firstYear:{
        batchId:dataSet.batchId,
        sessionYear:dataSet.newSession
      },
      secondYear:departmentData.activeBatches.firstYear,
      thirdYear:departmentData.activeBatches.secondYear,
      seniours:departmentData.activeBatches.thirdYear
    }
    recentXBatch=departmentData.activeBatches.seniours
  }

  let newData={
    newActiveBatches:newActiveBatches,
    recentXBatch:recentXBatch
  }
  return newData
 }

 module.exports=OtherOperations