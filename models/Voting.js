const votingCollection = require("../db").db().collection("Votes")

let Voting=function(data){
  this.data=data
}
Voting.prototype.getData=function(){
  this.data={
    voteType:null,

    createdDate:new Date(),
    votingLastDate:""
  }
}

Voting.prototype.createVottingPole=function(){
  return new Promise(async (resolve, reject) => { 
    try{
      
      resolve()
    }catch{
      reject()
    }
  })
}

module.exports=Voting