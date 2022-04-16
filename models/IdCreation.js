const officialUsersCollection = require("../db").db().collection("officialDataTable")

let IdCreation=function(data){
  this.data=data
 }
 IdCreation.createGroupId=function(addedDepartments){
   console.log(addedDepartments.length)
    let totalDepartments=addedDepartments.length
    let number=totalDepartments.toString()
    let allDepartmentCodes=''
    addedDepartments.map((department)=>{
      allDepartmentCodes=allDepartmentCodes.concat(department.departmentCode)
    })
    let groupId=number+allDepartmentCodes
    return groupId
 }

 IdCreation.getStudentRegNumber=function(sessionYear,departmentCode){
  return new Promise(async(resolve, reject) => {
    try{
      let firstPart = sessionYear.slice(2,4)+sessionYear.slice(7,9)
      let middlePart = departmentCode.toUpperCase()

      let data = await officialUsersCollection.findOne({ dataType:"neededDataForCalculations" })
      
      let serialNumber = data.regSerialNumber + 1
      let number = serialNumber.toString()
      let digit = number.length
      let lastPart
      if (digit == 1) {
        let onedigit = "000".concat(number)
        lastPart = onedigit
      } else if (digit == 2) {
        let twodigit = "00".concat(number)
        lastPart = twodigit
      } else if (digit == 3) {
        let threedigit = "0".concat(number)
        lastPart = threedigit
      } else {
        lastPart = number
      }
      let regNumber=firstPart+middlePart+lastPart
      //regNumber(As:2122COMSC0001) contains sessionYear=2021-2022+departmentCode=COMSCS+batchId=2122COMSC
      resolve(regNumber)
    }catch{
      reject()
    }
  })
 }
 
 IdCreation.getBatchId=function(sessionYear,departmentCode){
  let firstPart = sessionYear.slice(2,4)+sessionYear.slice(7,9)
  let lastPart = departmentCode.toUpperCase()
  let batchId=firstPart+lastPart
  return batchId
}

 module.exports=IdCreation