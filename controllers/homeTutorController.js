const HomeTutor = require("../models/HomeTutor")
const Student = require("../models/Student")


exports.checkIfHomeTutorEnrolled=async function(req,res,next){
  try{
    let tutorData=await HomeTutor.getHomeTutorData(req.regNumber)
    if(tutorData){
      next()
    }else{
      req.flash("errors", "You are not enrolled as a home-tutor!!")
      req.session.save(() => res.redirect("/student-home"))
    }
  }catch{
    res.render("404")
  }
}

exports.checkIfAlreadyEnrolled=async function(req,res,next){
  try{
    let tutorData=await HomeTutor.getHomeTutorData(req.regNumber)
    if(!tutorData){
      next()
    }else{
      req.flash("errors", "You had already enrolled as a home tutor!!")
      req.session.save(() => res.redirect(`/tutor/${req.regNumber}/details`))
    }
  }catch{
    res.render("404")
  }
}


exports.getHomeTutorDetailsPage=async function(req,res){
  try{
    let isVisitorOwner=false
    let personalInfo=await Student.getStudentDataByRegNumber(req.params.regNumber)
    console.log("personalInfo:",personalInfo)
    if(req.regNumber==req.params.regNumber){
      isVisitorOwner=true
    }
    let tutorDetails={
      regNumber:personalInfo.regNumber,
      userName:personalInfo.userName,
      gender:personalInfo.gender,
      tutorData:req.tutorData
    }
    res.render("home-tuition-details",{
      tutorDetails:tutorDetails,
      isVisitorOwner:isVisitorOwner
    })
  }catch{
    res.render("404")
  }
}

exports.getTutorParsonalInfoEditPage=async function(req,res){
  try{
    let tutorData=await HomeTutor.getHomeTutorData(req.regNumber)
    res.render("home-tutor-info-edit-page",{
      tutorData:tutorData
    })
  }catch{
    res.render("404")
  }
}


exports.enrollAsHomeTutor=function(req,res){
  console.log("body data :",req.body)
  let homeTutor = new HomeTutor(req.body,req.regNumber)
  homeTutor.enrollAsHomeTutor("enrolling").then(()=>{
    req.flash("success", "Congratulations!! you have successfully enrolled as a home-tutor!!")
    req.session.user.otherData.isHomeTutor=true
    req.session.save(function () {
      res.redirect(`/tutor/${req.regNumber}/details`)
    })
  }).catch((regErrors)=>{
    req.flash("errors", regErrors)
    console.log("I am from here")
    req.session.save(function () {
      res.redirect(`/tutor/${req.regNumber}/details`)
    })
  })
}

exports.stopAsHomeTutor=function(req,res){
  HomeTutor.stopAsHomeTutor(req.regNumber).then(()=>{
    req.flash("success", "Your home-tutor option has stoped successfully!!")
    req.session.user.otherData.isHomeTutor=false
    req.session.save( ()=>res.redirect(`/tutor/${req.regNumber}/details`))
  }).catch(()=>{
    req.flash("errors", "There is some problem!!")
    req.session.save( ()=> {
      res.redirect(`/tutor/${req.regNumber}/details`)
    })
  })
}

exports.startAsHomeTutor=function(req,res){
  HomeTutor.startAsHomeTutor(req.regNumber).then(()=>{
    req.flash("success", "Congratulations!! you have successfully started as a home-tutor!!")
    req.session.user.otherData.isHomeTutor=true
    req.session.save( ()=> {
      res.redirect(`/tutor/${req.regNumber}/details`)
    })
  }).catch(()=>{
    req.flash("errors", "There is some problem!!")
    req.session.save( ()=> {
      res.redirect(`/tutor/${req.regNumber}/details`)
    })
  })
}

exports.updateAboutSelfInfo=function(req,res){
  HomeTutor.updateAboutSelfInfo(req.regNumber,req.body.aboutSelf).then(()=>{
    req.flash("success", "Successfully updated about yourself !!")
    req.session.save( ()=> {
      res.redirect(`/tutor/${req.regNumber}/details`)
    })
  }).catch((e)=>{
    req.flash("errors", e)
    req.session.save( ()=> {
      res.redirect(`/tutor/${req.regNumber}/details`)
    })
  })
}

exports.updateTutorParsonalInfo=function(req,res){
  console.log("body data :",req.body)
  let homeTutor = new HomeTutor(req.body,req.regNumber)
  homeTutor.updateTutorParsonalInfo("updating").then(()=>{
    req.flash("success", "Your home-tuition personal informations updated successfully!!")
    req.session.save(function () {
      res.redirect("/edit-tutor-personal-info")
    })
  }).catch((regErrors)=>{
    req.flash("errors", regErrors)
    console.log("I am from here")
    req.session.save(function () {
      res.redirect("/edit-tutor-personal-info")
    })
  })
}


exports.getTutorSearchPage=function(req,res){
  res.render("tutor-search-page")
}

exports.searchHomeTutor=function(req,res){
  HomeTutor.searchHomeTutor(req.body).then((tutors)=>{
    console.log("tutors:",tutors)
    res.render("tutor-search-result-page",{
      tutors:tutors,
      searchedData:{
        class:req.body.selectedClass,
        stream:req.body.selectedStream
      }
    })
  }).catch((e)=>{
    req.flash("errors", e)
    req.session.save( ()=> {
      res.redirect("/search-home-tutor")
    })
  })
}



exports.checkIfHomeTutorPresent=async function(req,res,next){
  try{
    let tutorData=await HomeTutor.getHomeTutorData(req.params.regNumber)
    if(tutorData){
      req.tutorData=tutorData
      next()
    }else{
      if(req.isUserLoggedIn){
        if(req.params.regNumber==req.regNumber){
          next()
        }else{
          req.flash("errors", "Tutor with given registration number is not enrolled!!")
          req.session.save(() => res.render("404"))
        }
      }else{
        req.flash("errors", "Tutor with given registration number is not enrolled!!")
        req.session.save(() => res.render("404"))
      }
    }
  }catch{
    res.render("404")
  }
}

