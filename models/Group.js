const groupsCollection = require("../db").db().collection("Groups")
const OtherOperations=require('./OtherOperations')

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
    allMembers:[],
    allLeaders:[],
    presentActivity:null,
    previosActivity:null,
    completedActivities:[],
    groupNotifications:[],
    coverPhoto:null
  }
}

Group.prototype.createNewGroup=function(){
  return new Promise(async (resolve, reject) => {
    try{
      this.prepareGroupDataField()
      await groupsCollection.insertOne(this.data)
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

Group.addOnGroupMember= function(groupId,memberData){
  return new Promise(async (resolve, reject) => {
    try{
      await groupsCollection.updateOne({groupId:groupId},{
        $push:{
          allMembers:memberData
        }
      })
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
              "previousActivity":activityData
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

Group.updateLeaderVotingPoleData= function(groupId,poleId,votingDates){
  return new Promise(async (resolve, reject) => {
    try{
        await groupsCollection.updateOne(
          { groupId: groupId },
          {
            $set: {
              "isVoteGoingOn":true,
              "leaderVotingData.votingPoleId":poleId,
              "leaderVotingData.votingDates":votingDates
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