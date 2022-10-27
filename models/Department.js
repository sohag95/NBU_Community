const departmentsCollection = require("../db").db().collection("Departments")
const Group = require("./Group")
const OfficialUsers = require("./OfficialUsers")
const OtherOperations = require("./OtherOperations")
const SessionBatch = require("./SessionBatch")
const SourceNotifications = require("./SourceNotifications")

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
    allPresentLeaders:[],
    allPresentMembers:[],
    allXMembers:[],
    allXLeaders:[],
    activeBatches:activeBatches,
    XBatches:[],
    presentActivity:null,
    previousActivity:null,
    completedActivities:[],
    departmentNotifications:[],
    newBatchMemberRequests:[],
    isVoteGoingOn:false,
    leaderVotingData:null,
  }
}

Department.prototype.createDepartment=function(){
  return new Promise(async (resolve, reject) => {
    try{
      this.prepareDepartmentDataField()
      await departmentsCollection.insertOne(this.data)
      await SourceNotifications.createSourceNotificationTable(this.data.departmentCode)
      resolve()
    }catch{
      reject()
    }
  })
}


Department.updateXMemberAndXLeaderOnDepartment= function(departmentData,XBatchId){
  return new Promise(async (resolve, reject) => {
    try{
      //getting new membership data of department
      let memberAndLeaderData=OtherOperations.getXstudentsAndXleadersOfDepartment(departmentData,XBatchId)
        await departmentsCollection.updateOne({departmentCode:departmentData.departmentCode},{
          $push:{
            "XBatches":newData.recentXBatch,
          },
          $set: {
            "allPresentMembers":memberAndLeaderData.allPresentMembers,
            "allPresentLeaders":memberAndLeaderData.allPresentLeaders,
            "allXMembers":memberAndLeaderData.allXMembers,
            "allXLeaders":memberAndLeaderData.allXLeaders
          } 
        })
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
      //Update the status of a batch after adding a new batch on department
      await SessionBatch.updateBatchStateAfterAddingNewBatch(newData.newActiveBatches)
      if(newData.recentXBatch){
        //Mark batch state as "X"
        await SessionBatch.updateBatchState(newData.recentXBatch.batchId,"X")
        //add batchId on admins Data Table to sent each individual member "thank you message"
        await OfficialUsers.addXBatchIdOnAdminsTable(newData.recentXBatch.batchId)
        //get X-members and X-leaders to store on department table|Removed x-leader/member from present leader/member field
        await Department.updateXMemberAndXLeaderOnDepartment(departmentData,newData.recentXBatch.batchId)
        //find group's x-members and leaders and update the group table
        await Group.updateXMemberAndXLeaderOnGroup(departmentData.groupId,newData.recentXBatch.batchId)
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

//This function's activity part shifted to student function as it was creating an error
Department.sentNewStudentRequestOnDepartment= function(departmentCode,studentData){
  return new Promise(async (resolve, reject) => {
    try{
      console.log("Department Code :",departmentCode)
      await departmentsCollection.updateOne(
        { departmentCode: departmentCode },
        {
          $push: {
            "newBatchMemberRequests": studentData
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

//this function addedon sessionBatch function as it creating some problem after calling the function from here
Department.addOnDepartmentPresentMember= function(departmentCode,memberData){
  return new Promise(async (resolve, reject) => {
    try{
      
       let memberInfo={
          regNumber:memberData.regNumber,
          userName:memberData.userName,
          createdDate:new Date()
        }
        console.log("infobefore:",memberInfo)
        await departmentsCollection.updateOne(
          {departmentCode:departmentCode},
          {
            $push:{
              "allPresentMembers":memberInfo
            }
          }
        )
        console.log("done properly")
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

Department.makeDepartmentPresentLeader=function(departmentCode,newLeaderData){
  return new Promise(async (resolve, reject) => {
    try{
      let newLeader=true
      let departmentDetails=await departmentsCollection.findOne({departmentCode:departmentCode})
      let newPreviousLeader=departmentDetails.presentLeader
      if(departmentDetails.allPresentLeaders.length){
        departmentDetails.allPresentLeaders.forEach((leader)=>{
          if(leader.regNumber==newLeaderData.regNumber){
            newLeader=false
          }
        })
      }
       //update new leader data
      await departmentsCollection.updateOne(
        {departmentCode:departmentCode},
        {
          $set: {
            "presentLeader": newLeaderData,
            "isVoteGoingOn":false,
            "leaderVotingData":null,
          }
        }
      )
      //in case of same present leader again,previous leader will remain same also
      if(departmentDetails.presentLeader){
        if(departmentDetails.presentLeader.regNumber!=newLeaderData.regNumber){
          await departmentsCollection.updateOne(
            { departmentCode: departmentCode },
            {
              $set: {
                previousLeader: newPreviousLeader
              }
            }
          )
        }
      }
      if(newLeader){//checking if selected leader is very first leader on department
        console.log("pushing data on department leaders")
        let leaderData={
          regNumber:newLeaderData.regNumber,
          userName:newLeaderData.userName,
        }
        await departmentsCollection.updateOne(
          {departmentCode:departmentCode},
          {
            $push:{
              "allPresentLeaders":leaderData
            }
          }
        )
        //new department leader is a member of academic-group
        let groupMemberData={
          regNumber:leaderData.regNumber,
          userName:leaderData.userName,
          departmentName:departmentDetails.departmentName,
          createdDate:new Date()
        }
        await Group.addOnGroupPresentMember(departmentDetails.groupId,groupMemberData)
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

//no need of this function any more
// Department.getAllAvailableActivityMemberOnDepartment= function(departmentCode){
//   return new Promise(async (resolve, reject) => {
//     try{
//       let departmentDetails=await Department.getDepartmentDataByDepartmentCode(departmentCode)
//       let batchIds=[]
//         if(departmentDetails.activeBatches.firstYear){
//           batchIds.push(departmentDetails.activeBatches.firstYear.batchId)
//         }
//         if(departmentDetails.activeBatches.secondYear){
//           batchIds.push(departmentDetails.activeBatches.secondYear.batchId)
//         }
//         if(departmentDetails.activeBatches.seniours){
//           batchIds.push(departmentDetails.activeBatches.seniours.batchId)
//         }
//         if(departmentDetails.courceDuration=="3"){
//           if(departmentDetails.activeBatches.thirdYear){
//             batchIds.push(departmentDetails.activeBatches.thirdyear.batchId)
//           }
//         }
//       let allMembers=[]
//       for (let batchId of batchIds) {
//         let batchMembers = await SessionBatch.getAllAvailableActivityMemberFromBatch(batchId)
//         allMembers=allMembers.concat(batchMembers)
//       }
      
//       resolve(allMembers)
//     }catch{
//       reject()
//     }
//   })
// }

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
              "previousActivity":id
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

Department.updatePresentActivityFieldAfterDeletion= function(departmentCode){
  return new Promise(async (resolve, reject) => {
    try{
        await departmentsCollection.updateOne(
          { departmentCode: departmentCode },
          {
            $set: {
              "presentActivity":null,
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
      let votingData={
        votingPoleId:poleId,
        votingDates:votingDates,
        wonLeader:null
      }
        await departmentsCollection.updateOne(
          { departmentCode: departmentCode },
          {
            $set: {
              "isVoteGoingOn":true,
              "leaderVotingData":votingData,
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