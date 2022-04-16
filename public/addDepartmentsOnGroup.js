// let allDepartments=[
//   {departmentName:"Bengali",departmentCode:"BENGL",courseDuration:"2"},
//   {departmentName:"English",departmentCode:"ENGLS",courseDuration:"2"},
//   {departmentName:"Mathematics",departmentCode:"MATHE",courseDuration:"2"},
//   {departmentName:"Physics",departmentCode:"PHYSC",courseDuration:"2"},
//   {departmentName:"Chemistry",departmentCode:"CHEMS",courseDuration:"2"},
//   {departmentName:"Computer Science",departmentCode:"COMSC",courseDuration:"2"},
//   {departmentName:"Computer Application",departmentCode:"COMAP",courseDuration:"2"}
// ]
let allDepartments=remainDepartments

function remainDepartmentsTemplate(department) {
  return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  <span class="item-text"><strong>Departmet Name : </strong>${department.departmentName}</span>
  <span class="item-text"><strong>Code : </strong>${department.departmentCode}</span>
  <div>
  <button data-id="${department.departmentName}" value="${department.departmentCode}" id="${department.courseDuration}" class="addOnGroup btn btn-primary btn-sm">Add On Group</button>
  </div>
  </li>`
}

let remainDepartmentsHTML = allDepartments.map(function(player) {
  return remainDepartmentsTemplate(player)
}).join('')
document.getElementById("remainDepartments").insertAdjacentHTML("beforeend", remainDepartmentsHTML)
let addOnGroupButtons=document.getElementsByClassName("addOnGroup")


let addedDepartments=[]

function addOnGroupTemplate(department) {
  return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  <span class="item-text"><strong>Department Name : </strong>${department.departmentName}</span>
  <span class="item-text"><strong>Code : </strong>${department.departmentCode}</span>
  <div>
  <button data-id="${department.departmentName}" value="${department.departmentCode}" id="${department.courseDuration}" class="removeDepartment btn btn-danger btn-sm">Remove</button>
  </div>
  </li>`
}

document.addEventListener("click", function(e) {
  //select player from registered players
  if (e.target.classList.contains("addOnGroup")) {
        let departmentName=e.target.parentElement.parentElement.querySelector("button").getAttribute('data-id')
        let departmentCode=e.target.parentElement.parentElement.querySelector("button").value
        let courseDuration=e.target.parentElement.parentElement.querySelector("button").getAttribute('id')
        
        let department={
          departmentName:departmentName,
          departmentCode:departmentCode,
          courseDuration:courseDuration,
          allBatchYears:[],
        }
        addedDepartments.push(department)
        e.target.parentElement.parentElement.remove()
        document.getElementById("addedDepartments").insertAdjacentHTML("beforeend", addOnGroupTemplate(department))
  }


  // Remove player from playing 11
  if (e.target.classList.contains("removeDepartment")) {
    e.preventDefault()
    let departmentName=e.target.parentElement.parentElement.querySelector("button").getAttribute('data-id')
    let departmentCode=e.target.parentElement.parentElement.querySelector("button").value
    let courseDuration=e.target.parentElement.parentElement.querySelector("button").getAttribute('id')
        
    if (confirm(`Do you really want to remove ${departmentName} from this group?`)) {
        let department={
          departmentName:departmentName,
          departmentCode:departmentCode,
          courseDuration:courseDuration
        }
        //removing selected player from addedDepartments array list
        addedDepartments=addedDepartments.filter((department)=>{
          if(department.departmentCode!=departmentCode){
            return department
          }
        })
        e.target.parentElement.parentElement.remove()
        //adding department on remain departments
        document.getElementById("remainDepartments").insertAdjacentHTML("beforeend", remainDepartmentsTemplate(department))
        
    }
  }
})


document.getElementById("submitGroupButton").addEventListener("click", function(e) {
  e.preventDefault()
  let groupName=document.getElementById("groupName").value
  if(!groupName){
    alert("Please enter 'GROUP NAME' !!")
  }else if(addedDepartments.length<2){
    alert("Please add atleast 2 departments to create group !!")
  }else{
    console.log(groupName)
    let totalDepartments=addedDepartments.length
    if (confirm(`Are you sure to submit those (${totalDepartments}) departments on this group?`)) {
      let departments=JSON.stringify(addedDepartments);
      document.getElementById("selectedDepartments").value=departments
      document.getElementById("addDepartmentsOnGroupForm").submit()
    }
  }
  
})