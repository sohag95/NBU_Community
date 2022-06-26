const officialUsersCollection = require("../db").db().collection("officialDataTable")
const { ObjectId } = require("mongodb")

let OfficialUsers=function(data){
 this.data=data
}

OfficialUsers.prototype.cleanUp = function () {
  if (typeof this.data.regNumber != "string") {
    this.data.regNumber = ""
  }
  if (typeof this.data.password != "string") {
    this.data.password = ""
  }
  this.data = {
    regNumber: this.data.regNumber.trim().toUpperCase(),
    password: this.data.password
  }
}

OfficialUsers.prototype.adminLogIn=function(){
  return new Promise((resolve, reject) => {
    try {
      this.cleanUp()
      officialUsersCollection
        .findOne({ dataType: "adminAuthData" })
        .then(attemptedUser => {
          if (attemptedUser && (this.data.regNumber===attemptedUser.regNumber && this.data.password===attemptedUser.password)) {
            this.data = attemptedUser
            resolve("Congrats!")
          } else {
            reject("Invalid registration number / password.")
          }
        })
        .catch(function () {
          reject("Please try again later.")
        })
    } catch {
      reject()
    }
  })
}

OfficialUsers.prototype.NBUCommunityControllerLogIn=function(){
  return new Promise((resolve, reject) => {
    try {
      this.cleanUp()
      officialUsersCollection
        .findOne({ dataType: "societyControllerAuthData" })
        .then(attemptedUser => {
          if (attemptedUser && (this.data.regNumber===attemptedUser.regNumber && this.data.password===attemptedUser.password)) {
            this.data = attemptedUser
            resolve("Congrats!")
          } else {
            reject("Invalid registration number / password.")
          }
        })
        .catch(function () {
          reject("Please try again later.")
        })
    } catch {
      reject()
    }
  })
}

OfficialUsers.prototype.postControllerLogIn=function(){
  return new Promise((resolve, reject) => {
    try {
      this.cleanUp()
      officialUsersCollection
        .findOne({ dataType: "postControllerAuthData" })
        .then(attemptedUser => {
          if (attemptedUser && (this.data.regNumber===attemptedUser.regNumber && this.data.password===attemptedUser.password)) {
            this.data = attemptedUser
            resolve("Congrats!")
          } else {
            reject("Invalid registration number / password.")
          }
        })
        .catch(function () {
          reject("Please try again later.")
        })
    } catch {
      reject()
    }
  })
}


OfficialUsers.prototype.videoEditorLogIn=function(){
  return new Promise((resolve, reject) => {
    try {
      this.cleanUp()
      officialUsersCollection
        .findOne({ dataType: "videoEditorAuthData" })
        .then(attemptedUser => {
          if (attemptedUser && (this.data.regNumber===attemptedUser.regNumber && this.data.password===attemptedUser.password)) {
            this.data = attemptedUser
            resolve("Congrats!")
          } else {
            reject("Invalid registration number / password.")
          }
        })
        .catch(function () {
          reject("Please try again later.")
        })
    } catch {
      reject()
    }
  })
}

OfficialUsers.getAllDepartments=function(){
  return new Promise((resolve, reject) => {
    try {
      officialUsersCollection
        .findOne({ dataType: "allDepartments" })
        .then(data => {
          let allDepartments=data.departments
          resolve(allDepartments)
        })
        .catch(function () {
          reject("Please try again later.")
        })
    } catch {
      reject()
    }
  })
}


OfficialUsers.updateDepartmentsGroupIds=function(addedDepartments,groupId){
  return new Promise(async(resolve, reject) => {
    try {
      let departmentCodes=[]
      addedDepartments.forEach((department)=>{
        departmentCodes.push(department.departmentCode)
      })

      let departmentsData=await officialUsersCollection.findOne({ dataType: "allDepartments" })
      let allDepartments=departmentsData.departments.map((department)=>{
        if(departmentCodes.includes(department.departmentCode)){
          let data={
            departmentName:department.departmentName,
            departmentCode:department.departmentCode,
            courseDuration:department.courseDuration,
            groupId:groupId
          }
          return data
        }else{
          return department
        }
      })
      
      await officialUsersCollection.updateOne({dataType:"allDepartments"},
      {
        $set:{
          "departments":allDepartments
        }
      })
      
      resolve()
    } catch {
      reject()
    }
  })
}

OfficialUsers.getDepartmentAndSessionData=function(){
  return new Promise((resolve, reject) => {
    try {
      officialUsersCollection
        .findOne({ dataType: "allDepartments" })
        .then(data => {
          let departmentsData=data.departments.map((department)=>{
            let neededFields={
              departmentName:department.departmentName,
              departmentCode:department.departmentCode
            }
            return neededFields
          })
          let neededData={
            allDepartments:departmentsData,
            allSessionYears:data.allSessionYears
          }
          resolve(neededData)
        })
        .catch(function () {
          reject("Please try again later.")
        })
    } catch {
      reject()
    }
  })
}


OfficialUsers.getCommunityControllerData=function(){
  return new Promise(async(resolve, reject) => {
    try {
      let data=await officialUsersCollection.findOne({dataType:"societyControllerAuthData"})
      let neededData={
        regNumber:null,
        userName:data.userName,
        phone:data.phone
      }
      resolve(neededData)
    } catch {
      reject()
    }
  })
}

OfficialUsers.increaseRegSerialNumber=function(){
  return new Promise(async(resolve, reject) => {
    try {
      await officialUsersCollection.updateOne(
        { dataType: "neededDataForCalculations" },
        {
          $inc: {
            regSerialNumber: 1
          }
        }
      )
      resolve()
    } catch {
      reject()
    }
  })
}


OfficialUsers.getAllActivityTopics=function(){
  return new Promise((resolve, reject) => {
    try {
      officialUsersCollection
        .findOne({ dataType: "activityTopicsBySource" })
        .then((allTopics) => {
          resolve(allTopics)
        })
        .catch(()=> {
          reject("Please try again later.")
        })
    } catch {
      reject()
    }
  })
}

OfficialUsers.getPostControllerDetails=function(){
  return new Promise((resolve, reject) => {
    try {
      officialUsersCollection
        .findOne({ dataType: "postControllerAuthData" })
        .then((postController) => {
          let postControllerDetails={
            regNumber:postController.regNumber,
            userName:postController.userName,
            phone:postController.phone
          }
          resolve(postControllerDetails)
        })
        .catch(()=> {
          reject("Please try again later.")
        })
    } catch {
      reject()
    }
  })
}


OfficialUsers.addSubmittedAcivityIdOnPostControllerAccount=function(id){
  return new Promise(async(resolve, reject) => {
    try {
      await officialUsersCollection.updateOne(
        { dataType: "postControllerAuthData" },
        {
          $push: {
            submittedActivities: id
          }
        }
      )
      resolve()
    } catch {
      reject()
    }
  })
}

OfficialUsers.getAllSubmittedActivityIdsFromPostController=function(){
  return new Promise(async(resolve, reject) => {
    try {
      let data=await officialUsersCollection.findOne({ dataType: "postControllerAuthData" })
      let activityIds=data.submittedActivities
      resolve(activityIds)
    } catch {
      reject()
    }
  })
}


OfficialUsers.getVideoEditorData=function(){
  return new Promise((resolve, reject) => {
    try {
      officialUsersCollection
        .findOne({ dataType: "videoEditorAuthData" })
        .then((videoEditor) => {
          let videoEditorData={
            regNumber:videoEditor.regNumber,
            userName:videoEditor.userName,
            phone:videoEditor.phone
          }
          resolve(videoEditorData)
        })
        .catch(()=> {
          reject("Please try again later.")
        })
    } catch {
      reject()
    }
  })
}


OfficialUsers.assignActivityIdToEditorAccount=function(id){
  return new Promise(async(resolve, reject) => {
    try {
      await officialUsersCollection.updateOne(
        { dataType: "videoEditorAuthData" },
        {
          $push: {
            assignedActivities: id
          }
        }
      )
      resolve()
    } catch {
      reject()
    }
  })
}

OfficialUsers.getAllAssignedActivityIdsOfEditor=function(){
  return new Promise(async(resolve, reject) => {
    try {
      let data=await officialUsersCollection.findOne({ dataType: "videoEditorAuthData" })
      let assignedIds=data.assignedActivities
      resolve(assignedIds)
    } catch {
      reject()
    }
  })
}

//this function will be called after publishing the activity by post controller
OfficialUsers.removeAssignedActivityIdFromEditor=function(id){
  return new Promise(async(resolve, reject) => {
    try {
      await officialUsersCollection.updateMany(
        { dataType: "videoEditorAuthData" },
        {
          $push: {
            completedActivities: id
          },
          $pull:{
            assignedActivities:id
          }
        }
      )
      console.log("Successfully ran!!")
      resolve()
    } catch {
      reject()
    }
  })
}

OfficialUsers.removeSubmittedActivityIdFromPostController=function(id){
  return new Promise(async(resolve, reject) => {
    try {
      await officialUsersCollection.updateMany(
        { dataType: "postControllerAuthData" },
        {
          $push: {
            completedActivities: id
          },
          $pull:{
            submittedActivities:id
          }
        }
      )
      console.log("Successfully ran!!")
      resolve()
    } catch {
      reject()
    }
  })
}


OfficialUsers.allDepartments=function(){
  return new Promise((resolve, reject) => {
    try {
      officialUsersCollection
        .findOne({ dataType: "allDepartments" })
        .then((allData) => {
          resolve(allData.departments)
        })
        .catch(()=> {
          reject("Please try again later.")
        })
    } catch {
      reject()
    }
  })
}
module.exports=OfficialUsers

    