const Department = require("./Department")
const Student = require("./Student")
const SessionBatch = require("./SessionBatch")
const Group = require("./Group")
const Notification = require("./Notification")

const studentsCollection = require("../db").db().collection("Students")
const departmentsCollection = require("../db").db().collection("Departments")
const groupsCollection = require("../db").db().collection("Groups")
const sessionBatchesCollection = require("../db").db().collection("sessionBatches")


let Verification=function(studentData,verifierData){
  this.studentData=studentData
  this.verifierData=verifierData
  this.errors=[]
  this.remainingRequests=[]
  this.studentShortInfo
}
 
Verification.prototype.validateData=function(){
  if(this.studentData.isVerified){
    this.errors.push("The account is already verified.")
  }
  if(!this.studentData.verificationType){
    this.errors.push("Verification type could not found.")
  }
  this.studentShortInfo={
    regNumber:this.studentData.regNumber,
    userName:this.studentData.userName,
    phone:this.studentData.phone,
    createdDate:new Date(),
    gole:"Making thecommunity batter.",
    votingPoleId:"auto"
  }
  console.log("User Data :",this.studentData)
  console.log("Verifier Data :",this.verifierData)
}
Verification.prototype.markAsVerfiedAccount=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      await studentsCollection.findOneAndUpdate({regNumber:this.studentData.regNumber},{
        $set:{
          "isVerified":true,
          "verifiedBy":this.verifierData
        }
      })
      let notification={
        message:"Your account has been verified successfully.",
        gotoLink:null,
        gotoText:null,
        createdDate:new Date()
      }
      await Notification.sentNotificationToOneUser(this.studentData.regNumber,notification)
      resolve()
    }catch{
      reject()
    }
  })
}

Verification.prototype.setAccountAsGroupMember=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      let memberData={
        regNumber:this.studentData.regNumber,
        userName:this.studentData.userName,
        departmentName:this.studentData.departmentName,
        createdDate:new Date()
      }
      await Group.addOnGroupMember(this.studentData.groupId,memberData)
      resolve()
    }catch{
      reject()
    }
  })
}

Verification.prototype.setAccountAsDepartmentMember=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      let memberData={
        regNumber:this.studentData.regNumber,
        userName:this.studentData.userName,
        createdDate:new Date()
      }
      await Department.addOnDepartmentPresentMember(this.studentData.departmentCode,memberData)
      resolve()
    }catch{
      reject()
    }
  })
}

Verification.prototype.getRemainingRequestsData=function(newBatchMemberRequests){

    let remains=[]
    newBatchMemberRequests.forEach((member)=>{
      if(member.regNumber!=this.studentData.regNumber){
        remains.push(member)
      }
    })
    console.log("remain members:",remains)
    return remains
}

Verification.prototype.updateRemainAccountsVerificationMessage=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      //have to work on this page
      //have to collect community controller details
      let verifiedBy={
        verificationType:"case3",
        message:"After your verification you would consider as batch student.",
        verifiers:[
          {
            type:"Present Batch Leader",
            regNumber:this.studentData.regNumber,
            userName:this.studentData.userName,
            phone:this.studentData.phone
          },
          {//i have to work on this part
            type:"Community controller",
            regNumber:"not given",
            userName:"Pranab Sinha",
            phone:"7468987072"//get current community controller phone number
          }
        ]
      }
      this.remainingRequests.forEach(async(member)=>{
        await Student.updateVerificationMessage(member.regNumber,verifiedBy)
      })
      resolve()
    }catch{
      reject()
    }
  })
}

Verification.prototype.pushAllRemainAccountsOnBatch=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      this.remainingRequests.forEach(async(memberData)=>{
        await SessionBatch.sentNewStudentRequestOnBatch(this.studentData.batchId,memberData)
      })
      resolve()
    }catch{
      reject()
    }
  })
}


Verification.prototype.case1andcase2LeadOperations=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      let departmentDetails=await Department.getDepartmentDataByDepartmentCode(this.studentData.departmentCode)
      let newBatchMemberRequests=departmentDetails.newBatchMemberRequests
      this.remainingRequests=this.getRemainingRequestsData(newBatchMemberRequests)
      console.log("remain members :",this.remainingRequests)
      if(this.remainingRequests.length){
        await this.updateRemainAccountsVerificationMessage()
        await this.pushAllRemainAccountsOnBatch()
        console.log("functions ran.")
      }
      await SessionBatch.addOnBatchMember(this.studentData.batchId,this.studentShortInfo)
      await this.setAccountAsDepartmentMember()
      await Department.updateDepartmentRequestFieldEmpty(this.studentData.departmentCode)
      resolve()
    }catch{
      reject()
    }
  })
}

//case1 : user account is very first one on department,this function can run only by community controller
Verification.prototype.case1Verification=function(){
  //update users verified data and upgrade account as verified with verifier details
  //set user as group member
  //set user as department's present leader
  //set user as batch present leader
  //if there are multiple requests,then remaining accounts verifiedBy data should change and push all those account on sessionBatche's member request field
  return new Promise(async (resolve, reject) => { 
    try{
      await this.markAsVerfiedAccount()
      await this.setAccountAsGroupMember()
      await this.case1andcase2LeadOperations()
      await Department.makeDepartmentPresentLeader(this.studentData.departmentCode,this.studentShortInfo)
      await SessionBatch.makeSessionBatchPresentLeader(this.studentData.batchId,this.studentShortInfo)
      resolve()
    }catch{
      reject()
    }
  })
  
}




Verification.prototype.updateNewMemberRequestsFieldOnBatch=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      let batchDetails=await SessionBatch.findSessionBatchDetailsByBatchId(this.studentData.batchId)
      batchDetails.newMemberRequests.forEach((member)=>{
        if(member.regNumber!=this.studentData.regNumber){
          this.remainingRequests.push(member)
        }
      })
      await sessionBatchesCollection.updateOne(
        { batchId: this.studentData.batchId },
        {
          $set: {
            "newMemberRequests": this.remainingRequests
          }
        }
      )
      resolve()
    }catch{
      reject()
    }
  })
}

//case3 : user account is created when batch leader is present,this function can  by community controller and sessionBatch present leader
Verification.prototype.case3Verification=function(){
  //update users verified data and upgrade account as verified with verifier details 
  //add account on batch member
  //remove account data from newMemberRequests
  return new Promise(async (resolve, reject) => { 
    try{
      await this.markAsVerfiedAccount()
      await SessionBatch.addOnBatchMember(this.studentData.batchId,this.studentShortInfo)
      await this.updateNewMemberRequestsFieldOnBatch()
      resolve()
    }catch{
      reject(this.errors)
    }
  })
}


//case2 : user account is very first on sessionBatch,this function can run  by community controller and department present leader
Verification.prototype.case2Verification=function(){
  //update users verified data and upgrade account as verified with verifier details
  //set user as batch present leader
  //if there are multiple requests,then remaining accounts verifiedBy data should change and push all those account on sessionBatche's member request field
  return new Promise(async (resolve, reject) => { 
    try{
      await this.markAsVerfiedAccount()
      await this.case1andcase2LeadOperations()
      await SessionBatch.makeSessionBatchPresentLeader(this.studentData.batchId,this.studentShortInfo)
      resolve()
    }catch{
      reject(this.errors)
    }
  })
}

Verification.prototype.verifyStudentAccount=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      this.validateData()
      if(!this.errors.length){
        if(this.studentData.verificationType=="case1"){
          await this.case1Verification() 
        }else if(this.studentData.verificationType=="case2"){
          await this.case2Verification()
        }else if(this.studentData.verificationType=="case3"){
          await this.case3Verification()
        }
        resolve()
      }else{
        reject(this.errors)
      }
    }catch{
      reject("error from main function")
    }
  })
}

module.exports=Verification