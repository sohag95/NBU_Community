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
const SentEmail = require("./SentEmail")
 
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
    
    if (typeof this.data.gender != "string") {
      this.data.gender = ""
    }
    if (typeof this.data.departmentCode != "string") {
      this.data.departmentCode = ""
    }
    if (typeof this.data.email != "string") {
      this.data.email = ""
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
        message:"You are one of the first candidates,so you can become batch leader as well as a department leader.",
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
        message:"You are one of the first candidates of your batch,so you can become default batch leader.",
        verifiers:[
          {
            type:"Department Leader",
            regNumber:this.batchData.departmentLeader.regNumber,
            userName:this.batchData.departmentLeader.userName,
            phone:this.batchData.departmentLeader.phone
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
        message:"After verification of your accounty, you would consider as a batch student.",
        verifiers:[
          {
            type:"Present Batch Leader",
            regNumber:this.batchData.batchLeader.regNumber,
            userName:this.batchData.batchLeader.userName,
            phone:this.batchData.batchLeader.phone,
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

    //this code will be used during verification of a user account
    let verificationCode = Math.floor(1000 + Math.random() * 9000);

    this.data={
      regNumber:regNumber,
      userName:this.data.userName,
      departmentName:this.batchData.departmentName,
      groupId:this.batchData.groupId,
      sessionYear:this.data.sessionYear,
      gender:this.data.gender,
      phone:this.data.phone,
      email:this.data.email.toLowerCase(),
      password:this.data.password,
      isVerified:false,
      verifiedBy:verifiedBy,
      isXstudent:false,
      isHomeTutor:false,
      createdDate:new Date(),
      creditPoints:0,
      bioStatus:null,
      guestAllowedToViewProfile:false,
      verification:{//this data will be used for verification as well as reset password
        code:verificationCode,//to verify new account
        resetPassword:{
          OTP:null,
          validationTime:null,
          isUsed:null
        }
      }
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
      voteGivenPoles:{
        leaderVote:[],
        topicVote:[]
      },
      campusGroupIds:[]
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
        if (this.data.email == "") {
          this.errors.push("You must provide your Email Id.")
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
      
        if (!validator.isEmail(this.data.email)) {this.errors.push("You must provide a valid email address.")}

        // if (this.data.password!=this.data.rePassword) {
        //   this.errors.push("Your confirmation password did not match.")
        // }
        // Only if phone number is valid then check to see if it's already taken
        if (this.data.phone.length == 10) {
          let phoneNumberExists = await studentsCollection.findOne({phone:this.data.phone})
          if (phoneNumberExists) {
            this.errors.push("Sorry,your phone number has already been used.")
          }
        }
        if (validator.isEmail(this.data.email)) {
          let emailExists = await studentsCollection.findOne({email:this.data.email})
          if (emailExists) {
            if (emailExists) {this.errors.push("Given email Id has already been used.")}
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
        //sent confirmation message on email id
        //if could not sent email then show error message as not valid email id
        //if sent,show confirmation message to user

        let sentEmail=new SentEmail()
        sentEmail.mailAsAccountCreated(this.data.email,this.data.verification.code,this.data.regNumber,this.data.password).then(async()=>{
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
        }).catch(()=>{
          reject("We could not able to sent confirmation message on your email id.Please enter valid email id or try again later.")
        })
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
              departmentName:attemptedUser.departmentName,
              isXstudent:attemptedUser.isXstudent,
              isHomeTutor:attemptedUser.isHomeTutor
            }
          }
          // if(!attemptedUser.email){
          //   this.data.otherData.emailNotSet=true
          // }
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

Student.checkPresentPassword = function (presentPassword,regNumber) {
  return new Promise(async(resolve, reject) => {
    try{
      let studentData=await studentsCollection.findOne({regNumber:regNumber})
      if(bcrypt.compareSync(presentPassword, studentData.password)){
        resolve()
      }else{
        reject("Present password has not matched!!")
      }  
    }catch{
      reject("Sorry there is some problem.")
    }
  })
}

//not used
// Student.prototype.checkEmailData=function(){
//   if (typeof this.data.email != "string") {
//     this.data.email=""
//   }
//   if(this.data.from!="setNow" && this.data.from!="setLater" && this.data.from!="update"){
//     this.errors.push("Data manipulation ditected!")
//   }
//   if(this.data.from=="setLater"){
//     this.data.email=="Not_Given"
//   }
//   if(this.data.from=="setNow" || this.data.from=="update"){
//     if (!validator.isEmail(this.data.email)) {
//       this.errors.push("You must provide a valid email address.")
//     }
//   }

// }

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

//not used
// Student.prototype.setEmailId = function (regNumber) {
//   return new Promise((resolve, reject) => {
//     try{
//       this.checkEmailData()
//       if(!this.errors.length){
//         studentsCollection.findOneAndUpdate({regNumber:regNumber},{
//           $set:{
//             "email":this.data.email
//           }
//         })
//         resolve()
//       }else{
//         reject(this.errors)
//       }  
//     }catch{
//       reject("Sorry there is some problem.")
//     }
//   })
// }


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

Student.ifEmailIdRegistered = function (email) {
  return new Promise(async(resolve, reject) => {
    try{
      if (!validator.isEmail(email)) {
        reject("Invalid email id.")
      }
      let data=await studentsCollection.findOne({email:email})
      if(data){
        resolve(data.verification)
      }else{
        reject("Email id is not registered!!")
      }
    }catch{
      reject("There is some problem!!Try again later.")
    }
  })
}

Student.ifPhoneNumberRegistered = function (phone) {
  return new Promise(async(resolve, reject) => {
    try{
      let data=await studentsCollection.findOne({phone:phone})
      if(data){
        resolve()
      }else{
        reject()
      }
    }catch{
      reject()
    }
  })
}

Student.sentResetPasswordNewOTP = function (email) {
  return new Promise(async(resolve, reject) => {
    try{
      let OTP = Math.floor(100000 + Math.random() * 900000);
      let twentyMinutesLater = new Date();
      twentyMinutesLater.setMinutes(twentyMinutesLater.getMinutes() + 20);
      let OTPDetails={
        OTP:OTP,
        validationTime:twentyMinutesLater,
        isUsed:false
      }
      //store otpDetails on database
      await studentsCollection.updateOne({email:email},{
        $set:{
          "verification.resetPassword":OTPDetails
        }
      })
      //Sent otp to email Id
      let sentEmail=new SentEmail()
      await sentEmail.sentResetPasswordOTPDetails(email,OTPDetails)
      
      resolve(email)
    }catch{
      reject("There is some problem!!Try again later.")
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

Student.setNewPassword = function (email,newPassword) {
  return new Promise(async(resolve, reject) => {
    try{
      let salt = bcrypt.genSaltSync(10)
      let password = bcrypt.hashSync(newPassword, salt)

      await studentsCollection.updateOne({email:email},{
        $set:{
          password:password,
          "verification.resetPassword.isUsed":true
        }
      })
      resolve()
    }catch{
      reject()
    }
  })
}

Student.resetNewPassword = function (regNumber,newPassword) {
  return new Promise(async(resolve, reject) => {
    try{
      let salt = bcrypt.genSaltSync(10)
      let password = bcrypt.hashSync(newPassword, salt)

      await studentsCollection.updateOne({regNumber:regNumber},{
        $set:{
          password:password
        }
      })
      resolve()
    }catch{
      reject()
    }
  })
}

Student.onProfileViewToGuest = function (regNumber) {
  return new Promise(async(resolve, reject) => {
    try{
      await studentsCollection.updateOne({regNumber:regNumber},{
        $set:{
          guestAllowedToViewProfile:true
        }
      })
      resolve()
    }catch{
      reject()
    }
  })
}  

Student.offProfileViewToGuest = function (regNumber) {
  return new Promise(async(resolve, reject) => {
    try{
      await studentsCollection.updateOne({regNumber:regNumber},{
        $set:{
          guestAllowedToViewProfile:false
        }
      })
      resolve()
    }catch{
      reject()
    }
  })
} 

Student.setBioStatus = function (bioStatus,regNumber) {
  return new Promise(async(resolve, reject) => {
    try{
      let hasError=false
      let errMsg=null
      if (typeof bioStatus != "string") {
        bioStatus = ""
      }
      if (bioStatus == "") {
        errMsg="You must provide bio-status."
        hasError=true
      }
      if (bioStatus.length > 150) {
        errMsg="Your bio-status must be within 150 characters."
        hasError=true
      }
      if(!hasError){
        await studentsCollection.updateOne({regNumber:regNumber},{
          $set:{
            bioStatus:bioStatus,
          }
        })
        console.log("hello yhere")
        resolve()
      }else{
        reject(errMsg)
      }
    }catch{
      reject("There is some problem!!")
    }
  })
}

Student.searchStudent = function(searchTerm) {
  return new Promise(async (resolve, reject) => {
    if (typeof searchTerm == "string") {
      let students = await studentsCollection.aggregate([{ $match: { $text: { $search: searchTerm } } }, { $sort: { score: { $meta: "textScore" } } }]).toArray()
      let studentsData = students.map(student => {
        data = {
          regNumber: student.regNumber,
          userName: student.userName,
          departmentName:student.departmentName,
          sessionYear:student.sessionYear
        }
        return data
      })
      resolve(studentsData)
    } else {
      reject()
    }
  })
}

module.exports=Student