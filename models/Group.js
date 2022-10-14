const groupsCollection = require("../db").db().collection("Groups")
const Department = require("./Department")
const OtherOperations=require('./OtherOperations')
const SourceNotifications = require("./SourceNotifications")

let Group=function(data){
 this.data=data
}

Group.prototype.prepareGroupDataField=function(){
  this.data={
    groupId:this.data.groupId,
    groupName:this.data.groupName,
    presentDepartments:this.data.presentDepartments,
    presentLeader:null,
    previousLeader:null,
    allLeaders:[],
    allPresentMembers:[],//"present" added later may occure some error,i have to fix that
    allXMembers:[],
    allXLeaders:[],
    presentActivity:null,
    previosActivity:null,
    completedActivities:[],
    groupNotifications:[],
    isVoteGoingOn:false,
    leaderVotingData:null,
  }
}

Group.prototype.createNewGroup=function(){
  return new Promise(async (resolve, reject) => {
    try{
      this.prepareGroupDataField()
      await groupsCollection.insertOne(this.data)
      await SourceNotifications.createSourceNotificationTable(this.data.groupId)
      resolve()
    }catch{
      reject()
    }
  })
}

Group.prototype.addSessionYearAsBatchCreated=function(){
  return new Promise(async (resolve, reject) => {
    try{
     let departmentCodes=OtherOperations.getDepartmentCodesFromGroupId(this.data.groupId)
      //get code index
      let indexNumber
      departmentCodes.forEach((code,index)=>{
        if(code==this.data.departmentCode){
          indexNumber=index
        }
      })
      let number=indexNumber.toString()
      let departmentSessionYearPosition="presentDepartments."+number+".allBatchYears"
      await groupsCollection.findOneAndUpdate(
        { groupId: this.data.groupId },
        {
          $push: {
            [departmentSessionYearPosition]: this.data.newSession, 
          }
        }
      )
     resolve()
    }catch{
      reject()
    }
  })
}

Group.getAllGroups=function(){
  return new Promise(async (resolve, reject) => {
    try{
      let allGroups=await groupsCollection.find().toArray()
      resolve(allGroups)
    }catch{
      reject()
    }
  })
}

Group.findGroupByGroupId= function(groupId){
  return new Promise(async (resolve, reject) => {
    try{
      let groupDetails=await groupsCollection.findOne({groupId:groupId})
      if(groupDetails){
        resolve(groupDetails)
      }else{
        reject()
      }
    }catch{
      reject()
    }
  })
}

Group.updateXMemberAndXLeaderOnGroup= function(groupId,XBatchId){
  return new Promise(async (resolve, reject) => {
    try{
      let groupData=await Group.findGroupByGroupId(groupId)
      //getting new membership data of group
      let memberAndLeaderData=OtherOperations.getXstudentsAndXleadersOfGroup(groupData,XBatchId)
        await groupsCollection.updateOne(
          { groupId: groupId },
          {
            $set: {
              "allPresentMembers":memberAndLeaderData.allPresentMembers,
              "allLeaders":memberAndLeaderData.allPresentLeaders,
              "allXMembers":memberAndLeaderData.allXMembers,
              "allXLeaders":memberAndLeaderData.allXLeaders
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}


Group.addOnGroupPresentMember= function(groupId,memberData){
  return new Promise(async (resolve, reject) => {
    try{
      //#########--Need not to check as only new selected leader can fetch this function---#############
      // let groupDetails=await groupsCollection.findOne({groupId:groupId})
      // let isAlreadyMember=false
      // groupDetails.allMembers.forEach((member)=>{
      //   if(member.regNumber==memberData.regNumber){
      //     isAlreadyMember=true
      //   }
      // })
      // //if student is already a member then need not to add him/her again
      
      // if(!isAlreadyMember){
      // }
        await groupsCollection.updateOne({groupId:groupId},{
          $push:{
            allPresentMembers:memberData
          }
        })
      
      resolve()
    }catch{
      reject()
    }
  })
}

Group.makeGroupPresentLeader=function(groupId,newLeaderData){
  return new Promise(async (resolve, reject) => {
    try{
      // newLeaderData={
      //   regNumber:
      //   userName:
      //   phone:
      //   departmentName:
      //   createdDate:
      //   aim:
      //   votingPoleId:auto
      // }
      let newLeader=true
      let groupDetails=await groupsCollection.findOne({groupId:groupId})
      let newPreviousLeader=groupDetails.presentLeader
      if( groupDetails.allLeaders.length){
        groupDetails.allLeaders.forEach((leader)=>{
          if(leader.regNumber==newLeaderData.regNumber){
            newLeader=false
          }
        })
      }
       //update new leader data
      await groupsCollection.updateOne(
        {groupId:groupId},
        {
          $set: {
            "presentLeader": newLeaderData,
            "isVoteGoingOn":false,
            "leaderVotingData":null,
          }
        }
      )
       //in case of same present leader again,previous leader will remain same also
       if(groupDetails.presentLeader.regNumber!=newLeaderData.regNumber){
        await groupsCollection.updateOne(
          { groupId: groupId },
          {
            $set: {
              previousLeader: newPreviousLeader
            }
          }
        )
      }
      if(newLeader){
        console.log("pushing data on department leaders")
        let leaderData={
          regNumber:newLeaderData.regNumber,
          userName:newLeaderData.userName,
          phone:newLeaderData.phone
        }
        await groupsCollection.updateOne(
          {groupId:groupId},
          {
            $push:{
              "allLeaders":leaderData
            }
          }
        )
       
      }
      resolve()
    }catch{
      reject()
    }
  })
}


Group.addFirstCase1UserAsDefaultGroupLeader= function(groupId,leaderData){
  return new Promise(async (resolve, reject) => {
    try{
      let groupDetails=await groupsCollection.findOne({groupId:groupId})
      if(!groupDetails.presentLeader){
        await Group.makeGroupPresentLeader(groupId,leaderData)
      }
      resolve()
    }catch{
      reject()
    }
  })
}


Group.updatePresentActivityField= function(groupId,activityData){
  return new Promise(async (resolve, reject) => {
    try{
        await groupsCollection.updateOne(
          { groupId: groupId },
          {
            $set: {
              "presentActivity": activityData
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}

Group.getAllAvailableActivityMemberOnGroup= function(groupId){
  return new Promise(async(resolve, reject) => {
    try{
      let allGroupMembers=[]
      // let groupDetails=await groupsCollection.findOne({groupId:groupId})
      // let departmentCodes=groupDetails.presentDepartments.map((department)=>{
      //   return department.departmentCode
      // })
      let departmentCodes=OtherOperations.getDepartmentCodesFromGroupId(groupId)
      for (let departmentCode of departmentCodes) {
        let departmentMembers = await Department.getAllAvailableActivityMemberOnDepartment(departmentCode)
        allGroupMembers=allGroupMembers.concat(departmentMembers)
      }
      resolve(allGroupMembers)
    }catch{
     reject()
    }
  })
}

Group.updatePresentActivityFieldAfterResultDeclaration= function(groupId,wonTopic){
  return new Promise(async (resolve, reject) => {
    try{
        await groupsCollection.updateOne(
          { groupId: groupId },
          {
            $set: {
              "presentActivity.isVoteCompleted": true,
              "presentActivity.topic":wonTopic
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}

Group.updatePresentActivityFieldAfterEditDetails= function(groupId,data){
  return new Promise(async (resolve, reject) => {
    try{
        await groupsCollection.updateOne(
          { groupId: groupId },
          {
            $set: {
              "presentActivity.topic":data.topic,
              "presentActivity.title":data.title,
              "presentActivity.activityDate":data.activityDate
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}

Group.updatePreviousActivityFieldOnGroup= function(groupId,activityData){
  return new Promise(async (resolve, reject) => {
    try{
      let id=activityData._id
      await groupsCollection.updateMany(
        { groupId: groupId },
        {
          $set: {
              "presentActivity":null,
              "previousActivity":id
            },
          $push:{
            "completedActivities":id
          }
        }
      )
      resolve()
    }catch{
      reject()
    }
  })
}

Group.updatePresentActivityFieldAfterDeletion= function(groupId){
  return new Promise(async (resolve, reject) => {
    try{
        await groupsCollection.updateOne(
          { groupId: groupId },
          {
            $set: {
              "presentActivity":null,
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}

Group.updateLeaderVotingPoleData= function(groupId,poleId,votingDates){
  return new Promise(async (resolve, reject) => {
    try{

      let votingData={
        votingPoleId:poleId,
        votingDates:votingDates,
        wonLeader:null
      }
        await groupsCollection.updateOne(
          { groupId: groupId },
          {
            $set: {
              "isVoteGoingOn":true,
              "leaderVotingData":votingData,
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}

Group.updateLeaderVotingDataAfterResultDeclaration= function(groupId,wonLeader){
  return new Promise(async (resolve, reject) => {
    try{
        await groupsCollection.updateOne(
          { groupId: groupId },
          {
            $set: {
              "leaderVotingData.wonLeader": wonLeader,
              "leaderVotingData.votingDates.resultDate":new Date()
            }
          }
        )
      resolve()
    }catch{
      reject()
    }
  })
}
module.exports=Group