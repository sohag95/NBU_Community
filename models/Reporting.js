
const reportingCollection = require("../db").db().collection("Problem_Reports")

let Reporting=function(data){
  this.data=data
  // data={
  //   reportType:{
  //     type:"abc",//"student","activity"
  //     subType:"def"//student-fakeStudent,badLeader | activity-notParticipant,fakeActivity,badComment 
  //   },
  //   reportingId:{
  //    /regNumber,activityId.indexNumbers
  //   }
  //   commentIndex:2,//comment index number(if subType is badComment)
  //   reportBy:{
  //     regNumber:"123",
  //     userName:"123"
  //   }
  // }
}
Reporting.prototype.checkReportingData=function(){
  if(this.data.reportType.type=="student"){
    if(this.data.reportType.subType=="fakeStudent"){
      return true
    }
  }else if(this.data.reportType.type=="activity"){
    if(this.data.reportType.subType=="notParticipant" || this.data.reportType.subType=="fakeActivity" || this.data.reportType.subType=="badComment"){
      return true
    }
  }else{
    return false
  }
  return false
}



Reporting.prototype.checkIfAlreadyReported=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      let data=await reportingCollection.findOne({$and:[{reportType:this.data.reportType},{reportingId:this.data.reportingId},{reportedBy:this.data.reportedBy}]})
      console.log("match Data :",data)
      if(data){
        resolve(true)
      }else{
        resolve(false)
      }
    }catch{
      console.log("I executed from catch section of checkIfAlreadyReported")
      reject("There is some problem.")
    }
  })
}

Reporting.prototype.getReportData=function(){ 
  this.data.isResolved=false
  this.data.createdDate=new Date()
}

Reporting.prototype.sentReport=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      this.getReportData()
      await reportingCollection.insertOne(this.data)
      console.log("get report data :",this.data)
      resolve()
    }catch{
      reject("There is some problem.")
    }
  })
}
module.exports=Reporting