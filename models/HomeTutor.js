const OtherOperations = require("./OtherOperations")
const Student = require("./Student")
const homeTutorCollection = require("../db").db().collection("Home_tutors")

let HomeTutor=function(data,regNumber){
  this.data=data
  this.regNumber=regNumber
  this.studentData={
    departmentName:null,
    stream:null
  }
  this.errors=[]
}


HomeTutor.prototype.cleanUp=async function(from){
  try{
    if(from=="enrolling"){
      let studentDetails=await Student.getStudentDataByRegNumber(this.regNumber)
      this.studentData.departmentName=studentDetails.departmentName
      this.studentData.stream=OtherOperations.getTutorStream(this.studentData.departmentName)
      
      if (typeof this.data.aboutSelf != "string") {
        this.data.aboutSelf = ""
      }
    }
   
   if (typeof this.data.higherSecondaryParcentage != "string") {
     this.data.higherSecondaryParcentage = ""
   }
   if (typeof this.data.secondaryParcentage != "string") {
     this.data.secondaryParcentage = ""
   }
   if (typeof this.data.graduationParcentage != "string") {
     this.data.graduationParcentage = ""
   }
   if (typeof this.data.departmentCode != "string") {
     this.data.departmentCode = ""
   }
   if (typeof this.data.isExperienced != "string") {
     this.data.isExperienced = ""
   }
   if (typeof this.data.selectedClass != "string") {
     this.data.selectedClass = ""
   }
   if (typeof this.data.contactType != "string") {
     this.data.contactType = ""
   }
   if (typeof this.data.contactId != "string") {
    this.data.contactId = ""
  }
  
  
   this.data={
     regNumber:this.regNumber,
     departmentName:this.studentData.departmentName,
     stream:this.studentData.stream,
     isExperienced:this.data.isExperienced,
     willingToTeach:this.data.selectedClass,
     gradeParcentage:{
        secondary:this.data.secondaryParcentage,
        higherSecondary:this.data.higherSecondaryParcentage,
        graduation:this.data.graduationParcentage
     },
     contact:{
      type:this.data.contactType,
      id:this.data.contactId
     },
     aboutSelf:this.data.aboutSelf,
     isRunning:true,
     lastEditDate:new Date(),
     createdDate:new Date(),
   }
   
  }catch{
   this.errors.push("Sorry,there is some problem!")
  }
}

HomeTutor.prototype.validate=function(from){
   return new Promise(async (resolve, reject) => {
     try{

      if(from=="enrolling"){
        if(!this.data.stream){
          this.errors.push("No stream matched.Contact with society controller.")
        }
        if (this.data.aboutSelf == "") {
          this.errors.push("You should write something about yourself.")
        }
         
        if (this.data.aboutSelf.length > 300) {
          this.errors.push("Write about yourself within 200 characters.")
        }
      }
      
       if (this.data.gradeParcentage.secondary == "") {
         this.errors.push("You must provide madhyamik parcentage.")
       }
       if (this.data.gradeParcentage.higherSecondary == "") {
         this.errors.push("You must provide H.S. parcentage.")
       }
       if (this.data.gradeParcentage.graduation == "") {
         this.errors.push("You must select graduation parcentage.")
       }
       if (this.data.isExperienced == "") {
         this.errors.push("You should provide your experiance status.")
       }
       if (this.data.willingToTeach == "") {
        this.errors.push("Select the class-section you are willing to teach.")
      }
      if (this.data.contact.type == "") {
        this.errors.push("You should provide contact type.")
      }
      if (this.data.contact.id == "") {
        this.errors.push("You should provide contact number/id.")
      }
      if (!(this.data.willingToTeach == "1-10" || this.data.willingToTeach == "11-12" || this.data.willingToTeach == "graduation" || this.data.willingToTeach == "any")) {
        this.errors.push("Class selection to teach data is corrupted.")
      }
      resolve()
     }catch{
       this.errors.push("Sorry,there is some problem!")
       reject()
     }
 })
}


HomeTutor.prototype.enrollAsHomeTutor=function(from){
  return new Promise(async (resolve, reject) => {
    try{
      await this.cleanUp(from)
      this.validate(from)
      if(!this.errors.length){
        await homeTutorCollection.insertOne(this.data)
        await Student.markAsHomeTutor(this.data.regNumber)
        resolve()
      }else{
        reject(this.errors)
      }
    }catch{
      reject()
    }
  })
}

HomeTutor.prototype.updateTutorParsonalInfo=function(from){
  return new Promise(async (resolve, reject) => {
    try{
      await this.cleanUp(from)
      this.validate(from)
      if(!this.errors.length){
        await homeTutorCollection.updateOne({regNumber:this.regNumber},{
          $set:{
            "isExperienced":this.data.isExperienced,
            "willingToTeach":this.data.willingToTeach,
            "gradeParcentage":this.data.gradeParcentage,
            "contact":this.data.contact,
            "lastEditDate":this.data.lastEditDate
          }
        })
        resolve()
      }else{
        reject(this.errors)
      }
    }catch{
      reject()
    }
  })
}

HomeTutor.getHomeTutorData=function(regNumber){
  return new Promise(async (resolve, reject) => {
    try{
      let tutorData=await homeTutorCollection.findOne({regNumber:regNumber})
      resolve(tutorData)
    }catch{
      reject()
    }
  })
}

HomeTutor.stopAsHomeTutor=function(regNumber){
  return new Promise(async (resolve, reject) => {
    try{
      await homeTutorCollection.updateOne({regNumber:regNumber},{
        $set:{
          "isRunning":false
        }
      })
      await Student.markAsNotHomeTutor(regNumber)
      resolve()
    }catch{
      reject()
    }
  })
}

HomeTutor.startAsHomeTutor=function(regNumber){
  return new Promise(async (resolve, reject) => {
    try{
      await homeTutorCollection.updateOne({regNumber:regNumber},{
        $set:{
          "isRunning":true
        }
      })
      await Student.markAsHomeTutor(regNumber)
      resolve()
    }catch{
      reject()
    }
  })
}

HomeTutor.updateAboutSelfInfo=function(regNumber,aboutSelf){
  return new Promise(async (resolve, reject) => {
    try{
      let errMsg=null
      if (typeof aboutSelf != "string") {
        errMsg="Invalide input string!!"
      }
      if (aboutSelf > 300) {
        errMsg="Write about yourself within 300 characters."
      }
      if(!errMsg){
        await homeTutorCollection.updateOne({regNumber:regNumber},{
          $set:{
            "aboutSelf":aboutSelf
          }
        })
        resolve()
      }else{
        reject(errMsg)
      }
    }catch{
      reject("There is some problem.")
    }
  })
}


HomeTutor.searchHomeTutor=function(data){
  return new Promise(async (resolve, reject) => {
    try{
      let selectedClass=data.selectedClass
      let stream=data.selectedStream
      let errMsg=null
      if (typeof data.selectedStream != "string") {
        errMsg="Invalide input string!!"
      }
      if(!(selectedClass=="1-10" || selectedClass=="11-12" || selectedClass=="graduation")){
        errMsg="Selected class formate is not valide!!"
      }
      if(!errMsg){
        let aggOperations = [
          {$match: {$and:[{$or:[{willingToTeach:selectedClass},{willingToTeach:"any"}]},{isRunning:true},{$or:[{stream:stream},{departmentName:stream}]}]}},
          {$lookup: {from: "Students", localField: "regNumber", foreignField: "regNumber", as: "tutorData"}},
          {$project: {
            willingToTeach: 1,
            stream:1,
            gradeParcentage: 1,
            tutor: {$arrayElemAt: ["$tutorData", 0]}
          }},{$sort: {"tutor.creditPoints": -1}}
        ]
      
        let tutors = await homeTutorCollection.aggregate(aggOperations).toArray()
        let availableTutors=tutors.map((tutor)=>{
          let data={
            regNumber:tutor.tutor.regNumber,
            userName:tutor.tutor.userName,
            gender:tutor.tutor.gender,
            departmentName:tutor.tutor.departmentName,
            stream:tutor.stream,
            willingToTeach:tutor.willingToTeach,
            gradeParcentage:tutor.gradeParcentage,
            creditPoints:tutor.tutor.creditPoints
          }
          return data
        })
        resolve(availableTutors)
      }else{
        reject(errMsg)
      }
    }catch{
      reject("There is some problem!!")
    }
  })
}





module.exports=HomeTutor



// let aggOperations = [
//   {$match: {$and:[{willingToTeach:selectedClass},{isRunning:true},{$or:[{stream:stream},{departmentName:stream}]}]}}
// ].concat([
//   {$lookup: {from: "Students", localField: "regNumber", foreignField: "regNumber", as: "tutorData"}},
//   {$project: {
//     willingToTeach: 1,
//     isExperienced: 1,
//     departmentName:1,
//     stream:1,
//     createdDate:1,
//     lastEditDate:1,
//     contact:1,
//     gradeParcentage: 1,
//     tutorRegNumber: "$regNumber",
//     tutor: {$arrayElemAt: ["$tutorData", 0]}
//   }},{$sort: {"tutor.creditPoints": -1}},
// ])

// let aggOperations = [
//   {$match: {author: {$in: followedUsers}}},
//   {$sort: {createdDate: -1}}
// ].concat([
//   {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
//   {$project: {
//     topic: 1,
//     body: 1,
//     postStream:1,
//     postSemester:1,
//     postType:1,
//     unit:1,
//     subject:1,
//     createdDate: 1,
//     authorId: "$author",
//     author: {$arrayElemAt: ["$authorDocument", 0]}
//   }}
// ])

// let posts = await homeTutorCollection.aggregate(aggOperations).toArray()
