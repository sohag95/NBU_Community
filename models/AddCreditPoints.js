const studentsCollection = require("../db").db().collection("Students")

let AddCreditPoints=function(data){
  this.data=data
}
AddCreditPoints.prototype.addOnSingleRegNumber=function(regNumber){
  return new Promise(async (resolve, reject) => {
    try{
      await studentsCollection.updateMany(
        {regNumber:regNumber},
        {
          $inc:{
            creditPoints:1
        }})
      resolve()
    }catch{
      reject()
    }
  })
}
AddCreditPoints.prototype.addOnMultipleRegNumber=function(regNumbers){
  return new Promise(async (resolve, reject) => {
    try{
      await studentsCollection.updateMany(
        {regNumber:{$in:regNumbers}},
        {
          $inc:{
            creditPoints:1
        }})

      resolve()
    }catch{
      reject()
    }
  })
}
module.exports=AddCreditPoints
