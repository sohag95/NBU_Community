const AWSS3Bucket = require("../models/awsS3Bucket")
const sharp=require("sharp")

exports.uploadPhoto=function(req,res){
  console.log("Data",req.file)
  let awsS3Bucket=new AWSS3Bucket()
  awsS3Bucket.uploadPhoto(req.file.buffer,"checkImg").then(()=>{
    req.flash("success", "Photo uploaded successfully!!")
    res.redirect("/test")
  }).catch(()=>{
    req.flash("errors", "There is some problem")
    res.render("404")
  })
  
}

exports.getPhoto=function(req,res){
  let awsS3Bucket=new AWSS3Bucket()
  awsS3Bucket.getPhoto(req.params.size,req.params.key).then((bodyData)=>{
    bodyData.pipe(res)
  }).catch(()=>{
    // default image url(In case of image is not uploaded)
    if(req.params.from=="profile"){
      res.redirect("/images/defaultProfilePic.jfif");
    }else if(req.params.from=="cover"){
      res.redirect("/images/defaultProfilePic.jfif");
    }else if(req.params.from=="batch-banner"){
      res.redirect("/images/defaultProfilePic.jfif");
    }else if(req.params.from=="department-banner"){
      res.redirect("/images/defaultProfilePic.jfif");
    }else if(req.params.from=="group-banner"){
      res.redirect("/images/defaultProfilePic.jfif");
    }else if(req.params.from=="campusGroup-banner"){
      res.redirect("/images/defaultProfilePic.jfif");
    }else if(req.params.from=="activity-banner"){
      res.redirect("/images/defaultProfilePic.jfif");
    }
  })
  
}

exports.uploadProfilePhoto=function(req,res){
  let fileName="profile-"+req.regNumber
  let awsS3Bucket=new AWSS3Bucket()
  awsS3Bucket.uploadProfilePhoto(req.file.buffer,fileName).then(()=>{
    req.flash("success", "Profile Photo successfully uploaded!!")
    res.redirect(`/student/${req.regNumber}/profile`)
  }).catch(()=>{
    req.flash("errors", "There is some problem")
    res.render("404")
  })
  
}

exports.uploadCoverPhoto=function(req,res){
  let fileName="cover-"+req.regNumber
  let awsS3Bucket=new AWSS3Bucket()
  awsS3Bucket.uploadCoverPhoto(req.file.buffer,fileName).then(()=>{
    req.flash("success", "Cover photo successfully uploaded!!")
    res.redirect(`/student/${req.regNumber}/profile`)
  }).catch(()=>{
    req.flash("errors", "There is some problem")
    res.render("404")
  })
}

exports.uploadBatchBannerPhoto=function(req,res){
  let fileName=req.batchDetails.batchId
  let awsS3Bucket=new AWSS3Bucket()
  awsS3Bucket.uploadBannerPhoto(req.file.buffer,fileName).then(()=>{
    req.flash("success", "Batch banner photo successfully uploaded !!")
    res.redirect(`/batch/${fileName}/details`)
  }).catch(()=>{
    req.flash("errors", "There is some problem")
    res.render("404")
  })
}


exports.uploadCampusGroupBannerPhoto=function(req,res){
  let fileName=req.params.id
  let awsS3Bucket=new AWSS3Bucket()
  awsS3Bucket.uploadBannerPhoto(req.file.buffer,fileName).then(()=>{
    req.flash("success", "Campus Group Banner photo successfully uploaded !!")
    res.redirect(`/campus-group/${fileName}/details`)
  }).catch(()=>{
    req.flash("errors", "There is some problem")
    res.render("404")
  })
}


/////belowed functions not done yet
exports.uploadDepartmentBannerPhoto=function(req,res){
  let fileName=req.departmentDetails.departmentCode
  let awsS3Bucket=new AWSS3Bucket()
  awsS3Bucket.uploadBannerPhoto(req.file.buffer,fileName).then(()=>{
    req.flash("success", "Department banner photo successfully uploaded !!")
    res.redirect(`/department/${fileName}/details`)
  }).catch(()=>{
    req.flash("errors", "There is some problem")
    res.render("404")
  })
}

exports.uploadGroupBannerPhoto=function(req,res){
  let fileName=req.groupDetails.groupId
  let awsS3Bucket=new AWSS3Bucket()
  awsS3Bucket.uploadBannerPhoto(req.file.buffer,fileName).then(()=>{
    req.flash("success", "Group banner photo successfully uploaded !!")
    res.redirect(`/group/${fileName}/details`)
  }).catch(()=>{
    req.flash("errors", "There is some problem")
    res.render("404")
  })
}



exports.uploadActivityCoverPhoto=function(req,res){
  let fileName=req.params.id
  let awsS3Bucket=new AWSS3Bucket()
  awsS3Bucket.uploadBannerPhoto(req.file.buffer,fileName).then(()=>{
    req.flash("success", "Video cover photo successfully uploaded!!")
    res.redirect(`/activity/${fileName}/details`)
  }).catch(()=>{
    req.flash("errors", "There is some problem")
    res.render("404")
  })
}