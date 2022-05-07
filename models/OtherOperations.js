
let OtherOperations=function(data){
this.data=data
}
OtherOperations.getDepartmentCodesFromGroupId=function(groupId){
  let number=Number(groupId.slice(0,1))
  console.log(number)
  let departmentCodes=[]
  let start=1
  let end=6
  for(let i=1;i<=number;i++){
    let code=groupId.slice(start,end)
    departmentCodes.push(code)
    start+=5
    end+=5
  }
  console.log("Codes :",departmentCodes)
  return departmentCodes
 }

 OtherOperations.getBatchId=function(sessionYear,departmentCode){
  let firstYear=sessionYear.slice(2,4)
  let secondYear=sessionYear.slice(7,9)
  let batchId=firstYear+secondYear+departmentCode
  return batchId
 }

 OtherOperations.getNewActiveBatchesSequenceAndXBatch=function(departmentData,dataSet){
  
  // let dataSet={
  //   departmentCode:req.body.departmentCode,
  //   newSession:sessionBatch.data.batchSessionYear,
  //   batchId:sessionBatch.data.batchId
  // }

  let newActiveBatches={}
  let recentXBatch={}
  if(departmentData.courseDuration=="2"){
    newActiveBatches={
      firstYear:{
        batchId:dataSet.batchId,
        sessionYear:dataSet.newSession
      },
      secondYear:departmentData.activeBatches.firstYear,
      seniours:departmentData.activeBatches.secondYear
    }
    recentXBatch=departmentData.activeBatches.seniours
  }else if(departmentData.courseDuration=="3"){
    newActiveBatches={
      firstYear:{
        batchId:dataSet.batchId,
        sessionYear:dataSet.newSession
      },
      secondYear:departmentData.activeBatches.firstYear,
      thirdYear:departmentData.activeBatches.secondYear,
      seniours:departmentData.activeBatches.thirdYear
    }
    recentXBatch=departmentData.activeBatches.seniours
  }

  let newData={
    newActiveBatches:newActiveBatches,
    recentXBatch:recentXBatch
  }
  return newData
 }


 OtherOperations.isSourceMemberOrVoter=function(source,sourceId,regNumber){
 let sourceMember=false
 if(source=="batch"){
  if(sourceId==regNumber.slice(0,9)){
    sourceMember=true
  }
 }else if(source=="department"){
  if(sourceId==regNumber.slice(4,9)){
    sourceMember=true
  }
 }else if(source=="group"){
   //i have to check this portion later wheather it works or not
  let departmentCodes=OtherOperations.getDepartmentCodesFromGroupId(sourceId)
  if(departmentCodes.includes(regNumber.slice(4,9))){
    sourceMember=true
  }
 }
  return sourceMember
 }

//Voting result array creation for both leader and topic
OtherOperations.getVotingResultData=function(votingDetails,from){
  //from :"toicResut"/"leaderResult"
  // let topicOptions=["Study","Discussion","Fun"]
  // let voters=[
  //   {votingIndex:1},
  //   {votingIndex:2},
  //   {votingIndex:1},
  //   {votingIndex:1},
  //   {votingIndex:0},
  //   {votingIndex:0},
  //   {votingIndex:1},
  //   {votingIndex:2},
  //   {votingIndex:1},
  //   {votingIndex:2},
  //   {votingIndex:1},
  // ]
  // let result=[
  //   {
  //     topicIndex:0,
  //     votes:1
  //   }
  // ]
  
 
  let voters=votingDetails.voters
  let result=[]
  if(from=="topicResult"){
    let topicOptions=votingDetails.topicOptions
    topicOptions.forEach((topic,index)=>{
      let field={
        topicIndex:index,
        votes:0
      }
      result.push(field)
    })
  }

   if(from=="leaderResult"){
    let nominationTakers=votingDetails.nominationTakers
    nominationTakers.forEach((topic,index)=>{
      let field={
        leaderIndex:index,
        votes:0
      }
      result.push(field)
    })
  }

  voters.forEach((voter)=>{
    let index=voter.votingIndex
    result[index].votes=result[index].votes+1
  })
  //sorting the result array in decending order by votes
  result.sort((a, b) => b.votes - a.votes);
  //first Index contains the winning result
  return result
}

OtherOperations.checkIfAllNominationTakerVotedOrNot=function(votingDetails){
  let nominatorVoter={
    isAllVoted:true,
    notVoted:[]
  }
  
  let voted
    votingDetails.nominationTakers.forEach((nominator)=>{
      voted=false
      votingDetails.voters.forEach((voter)=>{
        if(nominator.regNumber==voter.regNumber){
          voted=true
        }
      })
      if(!voted){
        nominatorVoter.isAllVoted=false
        nominatorVoter.notVoted.push(nominator.userName)
      }
    })

 
  return nominatorVoter

}

 module.exports=OtherOperations