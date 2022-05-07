
const OtherOperations = require("./OtherOperations")
const SessionBatch = require("./SessionBatch")
const departmentsCollection = require("../db").db().collection("Departments")

let Department=function(data,groupId){
 this.data=data
 this.groupId=groupId
}

Department.prototype.prepareDepartmentDataField=function(){
  let activeBatches={}
  if(this.data.courseDuration=="2"){
    activeBatches={
      firstYear:null,
      secondYear:null,
      seniours:null
    }
  }else if(this.data.courseDuration=="3"){
    activeBatches={
      firstYear:null,
      secondYear:null,
      thirdYear:null,
      seniours:null
    }
  }
  // presentLeader={
  //   regNumber:"2122MATHS0021",
  //   userName:"Sohag Roy",
  //   Phone:"7468987072"
  // }
  this.data={
    departmentCode:this.data.departmentCode,
    departmentName:this.data.departmentName,
    courseDuration:this.data.courseDuration,
    groupId:this.groupId,
    presentLeader:null,
    previousLeader:null,
    allLeaders:[],
    allPresentMembers:[],
    activeBatches:activeBatches,
    XBatches:[],
    presentActivity:null,
    previosActivity:null,
    completedActivities:[],
    departmentNotifications:[],
    coverPhoto:null,
    newBatchMemberRequests:[]
  }
}

Department.prototype.createDepartment=function(){
  return new Promise(async (resolve, reject) => {
    try{
      this.prepareDepartmentDataField()
      await departmentsCollection.insertOne(this.data)
      resolve()
    }catch{
      reject()
    }
  })
}

Department.updateActiveBatchesSequenceYear=function(dataSet){
  return new Promise(async (resolve, reject) => {
    try{
      let departmentData=await departmentsCollection.findOne({departmentCode:dataSet.departmentCode})
     console.log("departmentData :",departmentData)
      let newData=OtherOperations.getNewActiveBatchesSequenceAndXBatch(departmentData,dataSet)
      // newData={
      //   newActiveBatches:newActiveBatches,
      //   recentXBatch:recentXBatch
      // }
      console.log("New Data:",newData)
      await departmentsCollection.updateOne({departmentCode:dataSet.departmentCode},{
        $set:{
          "activeBatches":newData.newActiveBatches
        }
      })
      if(newData.recentXBatch){
        await departmentsCollection.updateOne({departmentCode:dataSet.departmentCode},{
          $push:{
            "XBatches":newData.recentXBatch
          }
        })
      }
      resolve()
    }catch{
      reject()
    }
  })
}


Department.findDepartmentByDepartmentCode= function(departmentCode){
  return new Promise(async (resolve, reject) => {
    try{
      let departmentDetails=await departmentsCollection.findOne({departmentCode:departmentCode})
     if(departmentDetails){
        console.log("hello there")
        resolve(departmentDetails)
      }else{
        console.log("This line executed")
        reject()
      }
    }catch{
      reject()
    }
  })
}


Department.sentNewStudentRequestOnDepartment= function(departmentCode,studentData){
  return new Promise(async (resolve, reject) => {
    try{
      console.log("Department Code :",departmentCode)
      await departmentsCollection.updateOne(
        { departmentCode: departmentCode },
        {
          $push: {
            newBatchMemberRequests: studentData
          }
        }
      )
      resolve()
    }catch{
      reject()
    }
  })
}

Department.getAllDepartments=function(){
  return new Promise(async (resolve, reject) => {
    try{
      let allDepartments=await departmentsCollection.find().toArray()
      resolve(allDepartments)
    }catch{
      reject()
    }
  })
}

Department.getDepartmentDataByDepartmentCode=function(departmentCode){
  return new Promise(async (resolve, reject) => {
    try{
      let departmentDetails=await departmentsCollection.findOne({departmentCode:departmentCode})
      resolve(departmentDetails)
    }catch{
      reject()
    }
  })
}


Department.addOnDepartmentPresentMember= function(departmentCode,memberData){
  return new Promise(async (resolve, reject) => {
    try{
      await departmentsCollection.updateOne({departmentCode:departmentCode},{
        $push:{
          allPresentMembers:memberData
        }
      })
      resolve()
    }catch{
      reject()
    }
  })
}

Department.updateDepartmentRequestFieldEmpty=function(departmentCode){
  return new Promise(async (resolve, reject) => {
    try{
      let emptyArray=[]
      await departmentsCollection.updateOne({departmentCode:departmentCode},{
        $set:{
          newBatchMemberRequests:emptyArray
        }
      })
      resolve()
    }catch{
      reject()
    }
  })
}

Department.makeDepartmentPresentLeader=function(departmentCode,studentData){
  return new Promise(async (resolve, reject) => {
    try{
      let newLeader=true
      let departmentDetails=await departmentsCollection.findOne({departmentCode:departmentCode})
      if( departmentDetails.allLeaders.length){
        departmentDetails.allLeaders.forEach((leader)=>{
          if(leader.regNumber==studentData.regNumber){
            newLeader=false
          }
        })
      }
      await departmentsCollection.updateOne({departmentCode:departmentCode},{
        $set:{
          presentLeader:studentData
        }
      })
      if(newLeader){
        console.log("pushing data on department leaders")
        await departmentsCollection.updateOne({departmentCode:departmentCode},{
          $push:{
            allLeaders:studentData
          }
        })
      }
      resolve()
    }catch{
      reject()
    }
  })
}


Department.updatePresentActivityField= function(departmentCode,activityData){
  return new Promise(async (resolve, reject) => {
    try{
        await departmentsCollection.updateOne(
          { departmentCode: departmentCode },
          {
            $set: {
              "presentActivity": activityData
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}

Department.getAllAvailableActivityMemberOnDepartment= function(departmentCode){
  return new Promise(async (resolve, reject) => {
    try{
      let departmentDetails=await Department.getDepartmentDataByDepartmentCode(departmentCode)
      let batchIds=[]
        if(departmentDetails.activeBatches.firstYear){
          batchIds.push(departmentDetails.activeBatches.firstYear)
        }
        if(departmentDetails.activeBatches.secondYear){
          batchIds.push(departmentDetails.activeBatches.secondYear)
        }
        if(departmentDetails.activeBatches.seniours){
          batchIds.push(departmentDetails.activeBatches.seniours)
        }
        if(departmentDetails.courceDuration=="3"){
          if(departmentDetails.activeBatches.thirdYear){
            batchIds.push(departmentDetails.activeBatches.thirdyear)
          }
        }
      let allMembers=[]
      batchIds.forEach(async(batchId)=>{
        let members=await SessionBatch.getAllAvailableActivityMemberOnDepartment(batchId)
        allMembers.concat(members)
      })
      resolve(allMembers)
    }catch{
      reject()
    }
  })
}

Department.updatePresentActivityFieldAfterResultDeclaration= function(departmentCode,wonTopic){
  return new Promise(async (resolve, reject) => {
    try{
        await departmentsCollection.updateOne(
          { departmentCode: departmentCode },
          {
            $set: {
              "presentActivity.isVoteCompleted": true,
              "presentActivity.topic":wonTopic
            }
          }
        )
        console.log("updatePresentActivityFieldAfterResultDeclaration ok")
      resolve()
    }catch{
      console.log("Error updatePresentActivityFieldAfterResultDeclaration")
      reject()
    }
  })
}

Department.updatePresentActivityFieldAfterEditDetails= function(departmentCode,data){
  return new Promise(async (resolve, reject) => {
    try{
        await departmentsCollection.updateOne(
          { departmentCode: departmentCode },
          {
            $set: {
              "presentActivity.topic":data.topic,
              "presentActivity.title":data.title,
              "presentActivity.activityDate":data.activityDate
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}

Department.updatePreviousActivityFieldOnDepartment= function(departmentCode,activityData){
  return new Promise(async (resolve, reject) => {
    try{
      let id=activityData._id
      await departmentsCollection.updateOne(
        { departmentCode: departmentCode },
        {
          $set: {
              "presentActivity":null,
              "previousActivity":activityData
            },
            $push:{
              "completedActivities":id
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}

Department.updateLeaderVotingPoleData= function(departmentCode,poleId,votingDates){
  return new Promise(async (resolve, reject) => {
    try{
        await departmentsCollection.updateOne(
          { departmentCode: departmentCode },
          {
            $set: {
              "isVoteGoingOn":true,
              "leaderVotingData.votingPoleId":poleId,
              "leaderVotingData.votingDates":votingDates
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}

Department.updateLeaderVotingDataAfterResultDeclaration= function(departmentCode,wonLeader){
  return new Promise(async (resolve, reject) => {
    try{
        await departmentsCollection.updateOne(
          { departmentCode: departmentCode },
          {
            $set: {
              "leaderVotingData.wonLeader": wonLeader,
              "leaderVotingData.votingDates.resultDate":new Date()
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}
module.exports=Department