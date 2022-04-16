const officialUsersCollection = require("../db").db().collection("officialDataTable")
const IdCreation=require('./IdCreation')
const Group=require('./Group')
const Department=require('./Department')
const OfficialUsers = require("./OfficialUsers")

let Admin=function(data){
 this.data=data
 this.errors=[]
}

Admin.prototype.cleanUpDepartmentData=function(){
  if (typeof this.data.departmentName != "string") {
    this.data.departmentName = ""
  }
  if (typeof this.data.departmentCode != "string") {
    this.data.departmentCode = ""
  }
  if (typeof this.data.CourseDuration != "string") {
    this.data.CourseDuration = ""
  }
  this.data={
    departmentName:this.data.departmentName.trim(),
    departmentCode:this.data.departmentCode.trim().toUpperCase(),
    courseDuration:Number(this.data.courseDuration),
    groupId:null
  }
}

Admin.prototype.validateDepartmentData=function(){
  if (this.data.departmentCode.length != 5) {
    this.errors.push("Department Code should contain 5 characters.")
  }
  if (this.data.departmentName.length==0) {
    this.errors.push("You should give department name.")
  }
  if (!this.data.courseDuration || this.data.courseDuration > 3) {
    this.errors.push("Course duration can not more then 3 years.")
  }
}

Admin.prototype.addDepartment=function(){
  return new Promise(async (resolve, reject) => {
    // Step #1: Validate user data
    this.cleanUpDepartmentData()
    this.validateDepartmentData()
    
    if (!this.errors.length) {
      // hash user password
      await officialUsersCollection.updateOne(
        { dataType: "allDepartments" },
        {
          $push: {
            departments: this.data
          }
        }
      )
      resolve()
    } else {
      reject(this.errors)
    }
  })
}


Admin.prototype.cleanUpGroupData=function(){
  if (typeof this.data.groupName != "string") {
    this.data.groupName = ""
  }
  this.data={
    groupName:this.data.groupName.trim().toUpperCase(),
    addedDepartments:this.data.addedDepartments
  }
}

Admin.prototype.validateGroupData=function(){
  if (this.data.groupName=="") {
    this.errors.push("You should enter group name.")
  }
  if (this.data.addedDepartments.length<2) {
    this.errors.push("Each group should contain atleast 2 departments.")
  }
}

Admin.prototype.addNewGroup=function(){
  return new Promise(async (resolve, reject) => {
    // Step #1: Validate user data
    this.cleanUpGroupData()
    this.validateGroupData()
  
    if (!this.errors.length) {
      //create group id
      let groupId=IdCreation.createGroupId(this.data.addedDepartments)
      let groupData={
        groupId:groupId,
        groupName:this.data.groupName,
        presentDepartments:this.data.addedDepartments
      }
      //create group on db
      let group=new Group(groupData)
      await group.createNewGroup()
      //update official allDepartments table in departments array on to the groupId=generated group id for all presented departments field
      await OfficialUsers.updateDepartmentsGroupIds(this.data.addedDepartments,groupId)
      //create individual departments
      this.data.addedDepartments.forEach(async(departmentData)=>{
        let department=new Department(departmentData,groupId)
        await department.createDepartment()
      })
      resolve()
    } else {
      reject(this.errors)
    }
  })
}
Admin.checkFunction=function(){
  console.log("Check function ran!")
}
Admin.addNewSessionYear=function(newSession){
  return new Promise(async (resolve, reject) => {
    try{
      if (newSession.length!=9) {
        reject("Session year form is not correct.")
      }
      Admin.checkFunction()
      await officialUsersCollection.updateOne(
        { dataType: "adminAuthData" },
        {
          $set: {
            "presentSession": newSession,
          },
          $push: {
            "allSessionYears": newSession
          }
        }
      )
      await officialUsersCollection.updateOne(
        { dataType: "allDepartments" },
        {
          $push: {
            "allSessionYears": newSession
          }
        }
      )
      resolve()
    }catch{
      reject("There is some problem.")
    }
  })
}

Admin.setPresentSessionYear=function(newSession){
  return new Promise(async (resolve, reject) => {
    try{
      if (newSession.length!=9) {
        reject("Session year form is not correct.")
      }
      await officialUsersCollection.updateOne(
        { dataType: "adminAuthData" },
        {
          $set: {
            "presentSession": newSession,
          }
        }
      )
      resolve()
    }catch{
      reject("There is some problem.")
    }
  })
}
module.exports=Admin