const studentsCollection = require("../db").db().collection("students")

let User=function(data){
 this.data=data
}

User.prototype.testDb=function(){
  return new Promise(async (resolve, reject) => {
    try {
     resolve()
    } catch {
      reject()
    }
  })
}

module.exports=User