const studentsCollection = require("../db").db().collection("Students")
const notificationCollection = require("../db").db().collection("Notifications")
const studentDataCollection = require("../db").db().collection("Student_Data")

const IdCreation = require("./IdCreation")
const SessionBatch = require("./SessionBatch")
const bcrypt = require("bcryptjs")
const Department = require("./Department")
const OfficialUsers = require("./OfficialUsers")
const validator = require("validator")
const Notification = require("./Notification")

let Student=function(regData,batchData,communityController){
  this.data=regData
  this.batchData=batchData
  this.communityController=communityController
  this.notification
  this.studentData
  this.case=""
  this.errors=[]
 }
 Student.prototype.cleanUp=async function(){
   try{
    let regNumber=await IdCreation.getStudentRegNumber(this.data.sessionYear,this.data.departmentCode)
    
    if (typeof this.data.userName != "string") {
      this.data.userName = ""
    }
    if (typeof this.data.phone != "string") {
      this.data.phone = ""
    }
    if (typeof this.data.gender != "string") {
      this.data.gender = ""
    }
    if (typeof this.data.departmentCode != "string") {
      this.data.departmentCode = ""
    }
    if (typeof this.data.phone != "string") {
      this.data.phone = ""
    }
    if (typeof this.data.sessionYear != "string") {
      this.data.sessionYear = ""
    }
    if (typeof this.data.password != "string") {
      this.data.password = ""
    }
    //set verified by field with the user details by whome the account can be verified
    let verifiedBy={}
    if(!this.batchData.batchLeader && !this.batchData.departmentLeader){
      verifiedBy={
        verificationType:"case1",
        message:"You are one of the first candidates,so you can become batch leader,department leader as well as group member.",
        verifiers:[
          {
            type:"Community controller",
            regNumber:this.communityController.regNumber,
            userName:this.communityController.userName,
            phone:this.communityController.phone
          }
        ]
      }
      this.case="case1"
    }
    if(!this.batchData.batchLeader && this.batchData.departmentLeader){
      verifiedBy={
        verificationType:"case2",
        message:"You are one of the first candidates in your batch,so you can become batch leader.",
        verifiers:[
          {
            type:"Department Leader",
            regNumber:this.batchData.departmentLeader.regNumber,
            userName:this.batchData.departmentLeader.userName,
            phone:"7468987072"
          },
          {
            type:"Community controller",
            regNumber:this.communityController.regNumber,
            userName:this.communityController.userName,
            phone:this.communityController.phone
          }
        ]
      }
      this.case="case2"
    }
    if(this.batchData.batchLeader && this.batchData.departmentLeader){
      verifiedBy={
        verificationType:"case3",
        message:"After your verification you would consider as batch student.",
        verifiers:[
          {
            type:"Present Batch Leader",
            regNumber:this.batchData.batchLeader.regNumber,
            userName:this.batchData.batchLeader.userName,
            phone:"7468987072"
          },
          {
            type:"Community controller",
            regNumber:this.communityController.regNumber,
            userName:this.communityController.userName,
            phone:this.communityController.phone
          }
        ]
      }
      this.case="case3"
    }
    this.data={
      regNumber:regNumber,
      userName:this.data.userName,
      departmentName:this.batchData.departmentName,
      groupId:this.batchData.groupId,
      sessionYear:this.data.sessionYear,
      gender:this.data.gender,
      email:null,
      phone:this.data.phone,
      password:this.data.password,
      isVerified:false,
      verifiedBy:verifiedBy,
      isXstudent:false,
      isHomeTutor:false,
      createdDate:new Date(),
      creditPoints:0
    }
    //for users notification storage
    this.notification={
      regNumber:this.data.regNumber,
      unseenNotificationNumber:0,
      notifications:[]
    }
    //for students other needed record fields
    this.studentData={
      regNumber:this.data.regNumber,
      activities:{
        leadActivities:[],
        participatedActivities:[]
      },
      winningVotingPoles:{
        batchLeader:[],
        departmentLeader:[],
        groupLeader:[]
      },
      nominationTakenPoles:[],
      voteGivenPoles:[],
      activityGroupIds:[]
    }
   }catch{
    this.errors.push("Sorry,there is some problem!")
   }
 }
 Student.prototype.validate=function(){
    return new Promise(async (resolve, reject) => {
      try{
        if (this.data.userName == "") {
          this.errors.push("You must provide your name.")
        }
        if (this.data.phone == "") {
          this.errors.push("You must provide your phone number.")
        }
        if (this.data.gender == "") {
          this.errors.push("You must select your gender.")
        }
        if (!(this.data.gender == "male" || this.data.gender == "female" || this.data.gender == "custom") ) {
          this.errors.push("Your gender selection is wrong.")
        }
        if (this.data.password == "") {
          this.errors.push("You must provide a password.")
        }
        if (this.data.password.length > 0 && this.data.password.length < 8) {
          this.errors.push("Password must be at least 8 characters.")
        }
        if (this.data.password.length > 50) {
          this.errors.push("Password cannot exceed 50 characters.")
        }
        if (this.data.userName.length > 0 && this.data.userName.length < 3) {
          this.errors.push("Username must be at least 3 characters.")
        }
        if (this.data.userName.length > 50) {
          this.errors.push("Your name cannot exceed 50 characters.")
        }
       
        if (this.data.phone.length =! 10) {
          this.errors.push("Your phone number should contain 10 digits.")
        }
        
        // if (this.data.password!=this.data.rePassword) {
        //   this.errors.push("Your confirmation password did not match.")
        // }
        // Only if phone number is valid then check to see if it's already taken
        if (this.data.phone.length == 10) {
          let phoneNumberExists = await studentsCollection.findOne({phone:this.data.phone})
          if (phoneNumberExists) {
            this.errors.push("Sorry,your phone number has already been registered.")
          }
        }
        resolve()
      }catch{
        this.errors.push("Sorry,there is some problem!")
      }
  })
}


//during sign up new account this function will be called
//for each account there might be 3 cases:
//case 1:account is very first so account can be batch leader,department leader,and group member
//case 2:batch leader is not set,account will be verified by department leader
//case 3:batch leader is set,account will be verified by batch present leader

Student.prototype.createNewAccount=function(){
  return new Promise(async (resolve, reject) => {
    try{
      // Step #1: Validate user data
      await this.cleanUp()
      await this.validate()
      // Step #2: Only if there are no validation errors
      // then save the user data into a database
      if (!this.errors.length) {
        // hash user password
        let salt = bcrypt.genSaltSync(10)
        this.data.password = bcrypt.hashSync(this.data.password, salt)
        await studentsCollection.insertOne(this.data)
        await notificationCollection.insertOne(this.notification)
        await studentDataCollection.insertOne(this.studentData)
        
        //student's needed data to store request array
        let studentData={
          regNumber:this.data.regNumber,
          userName:this.data.userName,
          phone:this.data.phone,
          createdDate:new Date()
        }
        if(this.case=="case3"){
          //sent request when batch leader is set
          await SessionBatch.sentNewStudentRequestOnBatch(this.batchData.batchId,studentData)
        }else if(this.case=="case2" || this.case=="case1"){
          //sent request when batch leader is not set but department leader is not set
          //sent request when no leader is set
          //In both cases request will go to the department...
          //-if department leader is set then the students account 
          //-will be verified by the department leader otherwise by the community controller
          //regNumber(As:2122COMSC0001) contains sessionYear=2021-2022+departmentCode=COMSCS+batchId=2122COMSC
          
          await Department.sentNewStudentRequestOnDepartment(this.batchData.batchId.slice(4,9),studentData)
        }
        await OfficialUsers.increaseRegSerialNumber()
        
        resolve()
      } else {
        reject(this.errors)
      }
    }catch{
      reject()
    }
  })
}


Student.deleteAccount=function(regNumber){
  return new Promise(async (resolve, reject) => {
    try{
      await studentDataCollection.deleteOne({regNumber:regNumber})
      await notificationCollection.deleteOne({regNumber:regNumber})
      await studentDataCollection.deleteOne({regNumber:regNumber})
      await OfficialUsers.removeRejectedIdFromAdminAccountedArray(regNumber)
      resolve()
    }catch{
      reject()
    }
  })
}

Student.prototype.studentLogIn = function () {
  return new Promise((resolve, reject) => {
    if (typeof this.data.phone != "string") {
      reject("Try with valide data!")
    }
    if (typeof this.data.password != "string") {
      reject("Try with valide data!")
    }
    console.log("Auth data :",this.data)
    studentsCollection
      .findOne({ phone:this.data.phone })
      .then(async(attemptedUser) => {
        if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
          this.data = {
            regNumber:attemptedUser.regNumber,
            userName:attemptedUser.userName,
            otherData:null
          }
          if(!attemptedUser.isVerified){
            this.data.otherData={
              isVerified:false,
              verifiedBy:attemptedUser.verifiedBy
            }
          }else{
            this.data.otherData={
              isVerified:true,
              groupId:attemptedUser.groupId,
              isXstudent:attemptedUser.isXstudent,
              isHomeTutor:attemptedUser.isHomeTutor
            }
          }
          if(!attemptedUser.email){
            this.data.otherData.emailNotSet=true
          }
          //get unseen notification number
          let unseenNotifications=await Notification.getUnseenNotificationNumbers(this.data.regNumber)
          this.data.otherData.unseenNotifications=unseenNotifications
          console.log("Other data :",this.data.otherData)
          resolve("Congrats!")
        } else {
          reject("Invalid username / password.")
        }
      })
      .catch(function () {
        reject("Please try again later.")
      })
  })
}

Student.prototype.checkEmailData=function(){
  if (typeof this.data.email != "string") {
    this.data.email=""
  }
  if(this.data.from!="setNow" && this.data.from!="setLater" && this.data.from!="update"){
    this.errors.push("Data manipulation ditected!")
  }
  if(this.data.from=="setLater"){
    this.data.email=="Not_Given"
  }
  if(this.data.from=="setNow" || this.data.from=="update"){
    if (!validator.isEmail(this.data.email)) {
      this.errors.push("You must provide a valid email address.")
    }
  }

}

Student.markAsHomeTutor = function (regNumber) {
  return new Promise((resolve, reject) => {
    try{
      studentsCollection.findOneAndUpdate({regNumber:regNumber},{
          $set:{
            "isHomeTutor":true
          }
        })
        resolve()
        
    }catch{
      reject("Sorry there is some problem.")
    }
  })
}

Student.markAsNotHomeTutor = function (regNumber) {
  return new Promise((resolve, reject) => {
    try{
      studentsCollection.findOneAndUpdate({regNumber:regNumber},{
          $set:{
            "isHomeTutor":false
          }
        })
        resolve()
        
    }catch{
      reject("Sorry there is some problem.")
    }
  })
}

Student.prototype.setEmailId = function (regNumber) {
  return new Promise((resolve, reject) => {
    try{
      this.checkEmailData()
      if(!this.errors.length){
        studentsCollection.findOneAndUpdate({regNumber:regNumber},{
          $set:{
            "email":this.data.email
          }
        })
        resolve()
      }else{
        reject(this.errors)
      }  
    }catch{
      reject("Sorry there is some problem.")
    }
  })
}


Student.getStudentDataByRegNumber = function (regNumber) {
  return new Promise((resolve, reject) => {
    try{
      if (typeof regNumber != "string") {
        reject()
      }
      studentsCollection.findOne({regNumber:regNumber}).then((studentData)=>{
        resolve(studentData)
      }).catch((e)=>{
        reject()
      })
    }catch{
      reject()
    }
  })
}

Student.getAccountDetailsByRegNumbers = function (regNumbers) {
  return new Promise(async(resolve, reject) => {
    try{  
    let accountsDetails= await studentsCollection.find({regNumber:{$in:regNumbers}}).toArray()
    accountsDetails=accountsDetails.map((account)=>{
      return  {
        regNumber:account.regNumber,
        userName:account.userName,
        departmentName:account.departmentName,
        verifiedBy:account.verifiedBy
      }
    })
    console.log("accounts:",accountsDetails)
    resolve(accountsDetails)
    }catch{
      reject()
    }
  })
}


Student.getStudentOtherDataByRegNumber = function (regNumber) {
  return new Promise((resolve, reject) => {
    try{
      if (typeof regNumber != "string") {
        reject()
      }
      studentDataCollection.findOne({regNumber:regNumber}).then((studentOtherData)=>{
        resolve(studentOtherData)
      }).catch((e)=>{
        reject()
      })
    }catch{
      reject()
    }
  })
}

Student.updateVerificationMessage = function (regNumber,verifiedBy) {
  return new Promise(async(resolve, reject) => {
    try{
      await studentsCollection.updateOne({regNumber:regNumber},{
        $set:{
          verifiedBy:verifiedBy
        }
      })
      resolve()
    }catch{
      reject()
    }
  })
}


Student.searchStudent = function(searchTerm) {
  return new Promise(async (resolve, reject) => {
    if (typeof searchTerm == "string") {
      let students = await studentsCollection.aggregate([{ $match: { $text: { $search: searchTerm } } }, { $sort: { score: { $meta: "textScore" } } }]).toArray()
      studentsData = students.map(student => {
        data = {
          regNumber: student.regNumber,
          userName: student.userName,
          departmentName:student.departmentName,
          sessionYear:student.sessionYear
        }
        return data
      })
      console.log(studentsData)
      resolve(studentsData)
    } else {
      reject()
    }
  })
}

module.exports=Student