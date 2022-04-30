// let allAvailableMembers=[
//   {regNumber:"2022COMSC0001",userName:"Sohag Roy"},
//   {regNumber:"2022COMSC0002",userName:"Debarati Barman"},
//   {regNumber:"2022COMSC0003",userName:"Pranab Sinha"},
//   {regNumber:"2022COMSC0004",userName:"Akash Goshwami"},
//   {regNumber:"2022COMSC0005",userName:"Pabitra Sarkar"},
//   {regNumber:"2022COMSC0006",userName:"Arnab Sinha"},
//   {regNumber:"2022COMSC0007",userName:"Apurba Ghosh"}
// ]

let allAvailableMembers=allMembers

function allAvailableMembersTemplate(member) {
  return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  <span class="item-text d-block"><strong>Name : </strong>${member.userName}</span>
  <span class="item-text d-block"><strong>Registration No : </strong>${member.regNumber}</span>
  <div>
  <button  value="${member.userName}" id="${member.regNumber}" class="addAsParticipant btn btn-primary btn-sm">Add As Participant</button>
  </div>
  </li>`
}

let allAvailableMembersHTML = allAvailableMembers.map(function(member) {
  return allAvailableMembersTemplate(member)
}).join('')
document.getElementById("allAvailableMembers").insertAdjacentHTML("beforeend", allAvailableMembersHTML)
let addAsParticipantsButton=document.getElementsByClassName("addAsParticipant")

let participants=[]

function addOnParticipantsTemplate(member) {
  return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  <span class="item-text d-block"><strong>Name : </strong>${member.userName}</span>
  <span class="item-text d-block"><strong>Registration No : </strong>${member.regNumber}</span>
  <div>
  <button value="${member.userName}" id="${member.regNumber}" class="removeParticipant btn btn-danger btn-sm">Remove</button>
  </div>
  </li>`
}



document.addEventListener("click", function(e) {
  //select player from registered players
  if (e.target.classList.contains("addAsParticipant")) {
        let userName=e.target.parentElement.parentElement.querySelector("button").value
        let regNumber=e.target.parentElement.parentElement.querySelector("button").getAttribute('id')
        
        let member={
          regNumber:regNumber,
          userName:userName
        }
        participants.push(member)
        e.target.parentElement.parentElement.remove()
        document.getElementById("addedParticipants").insertAdjacentHTML("beforeend", addOnParticipantsTemplate(member))
  }


  // Remove player from playing 11
  if (e.target.classList.contains("removeParticipant")) {
    e.preventDefault()
    let userName=e.target.parentElement.parentElement.querySelector("button").value
    let regNumber=e.target.parentElement.parentElement.querySelector("button").getAttribute('id')
        
    if (confirm(`Do you really want to remove ${userName} from this activity?`)) {
        let member={
          regNumber:regNumber,
          userName:userName
        }
        //removing selected player from participants array list
        participants=participants.filter((member)=>{
          if(member.regNumber!=regNumber){
            return member
          }
        })
        e.target.parentElement.parentElement.remove()
        //adding department on remain departments
        document.getElementById("allAvailableMembers").insertAdjacentHTML("beforeend", allAvailableMembersTemplate(member))
        
    }
  }
})



document.getElementById("submitParticipantsButton").addEventListener("click", function(e) {
  e.preventDefault()
  if(participants.length<3){
    alert("Please add atleast 3 participant to the activity !!")
  }else{
    let totalParticipants=participants.length
    if (confirm(`Are you sure to submit those (${totalParticipants}) participants on this activity?`)) {
      let allParticipants=JSON.stringify(participants);
      console.log("All participants :",participants)
      document.getElementById("selectedParticipants").value=allParticipants
      document.getElementById("addParticipantsOnActivityForm").submit()
    }
  }
})