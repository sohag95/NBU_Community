
let OtherOperations=function(data){
this.data=data
}
OtherOperations.getDepartmentCodesFromGroupId=function(groupId){
  let number=Number(groupId.slice(0,1))
  let departmentCodes=[]
  let start=1
  let end=6
  for(let i=1;i<=number;i++){
    let code=groupId.slice(start,end)
    departmentCodes.push(code)
    start+=5
    end+=5
  }
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
  //get x-members/x-leaders of department

  let newData={
    newActiveBatches:newActiveBatches,
    recentXBatch:recentXBatch
  }
  return newData
 }

 OtherOperations.getBatchId=function(sessionYear,departmentCode){
  let firstYear=sessionYear.slice(2,4)
  let secondYear=sessionYear.slice(7,9)
  let batchId=firstYear+secondYear+departmentCode
  return batchId
 }

 OtherOperations.getXstudentsAndXleadersOfDepartment=function(departmentData,XBatchId){
  let allPresentMembers=departmentData.allPresentMembers
  let allPresentLeaders=departmentData.allLeaders
  let allXMembers=departmentData.allXMembers
  let allXLeaders=departmentData.allXLeaders
  allPresentMembers=allPresentMembers.filter((member)=>{
    if(member.regNumber.slice(0,9)==XBatchId){
      allXMembers.push(member)
    }else{
      return member
    }
  })

  allPresentLeaders=allPresentLeaders.filter((member)=>{
    if(member.regNumber.slice(0,9)==XBatchId){
      allXLeaders.push(member)
    }else{
      return member
    }
  })

  let memberAndLeaderData={
    allPresentMembers:allPresentMembers,
    allPresentLeaders:allPresentLeaders,
    allXMembers:allXMembers,
    allXLeaders:allXLeaders
  }

  return memberAndLeaderData
 }


 
 OtherOperations.getXstudentsAndXleadersOfGroup=function(groupData,XBatchId){
  let allPresentMembers=groupData.allPresentMembers
  let allPresentLeaders=groupData.allLeaders
  let allXMembers=groupData.allXMembers
  let allXLeaders=groupData.allXLeaders
  allPresentMembers=allPresentMembers.filter((member)=>{
    if(member.regNumber.slice(0,9)==XBatchId){
      allXMembers.push(member)
    }else{
      return member
    }
  })

  allPresentLeaders=allPresentLeaders.filter((member)=>{
    if(member.regNumber.slice(0,9)==XBatchId){
      allXLeaders.push(member)
    }else{
      return member
    }
  })

  let memberAndLeaderData={
    allPresentMembers:allPresentMembers,
    allPresentLeaders:allPresentLeaders,
    allXMembers:allXMembers,
    allXLeaders:allXLeaders
  }

  return memberAndLeaderData
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

OtherOperations.getActivityLeadersRegNumbers=function(leaders){
  let leadRegNumbers=[]
  leadRegNumbers.push(leaders.mainLead.regNumber)
  if(leaders.assistantLead){//assistantLead might get null value
    leadRegNumbers.push(leaders.assistantLead.regNumber)
  }
  return leadRegNumbers
}

OtherOperations.getParticipantsRegNumbers=function(activityParticipants){
  let participantsRegNumbers= activityParticipants.map((participant)=>{
    return participant.regNumber
  })
  return participantsRegNumbers
}


//data should get dynamically
//all departments name have to add on stream based arrays
OtherOperations.getTutorStream=function(departmentName){
  let scienceGroup=["Computer Science","Computer Application","Physics","Chemistry","Mathematics"]
  let artsGroup=["History","English","Bengali","Geography"]
  let commartsGroup=["Accounting"]
  if(scienceGroup.includes(departmentName)){
    return "science"
  }else if(artsGroup.includes(departmentName)){
    return "arts"
  }else if(commartsGroup.includes(departmentName)){
    return "commarts"
  }else{
    return false
  }
 }


 module.exports=OtherOperations