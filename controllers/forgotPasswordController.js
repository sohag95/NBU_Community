const Student = require("../models/Student")

//email id taken from a form submission
exports.ifEmailIdRegistered = function (req, res,next) {
    console.log("Form Data :",req.body)
    Student.ifEmailIdRegistered(req.body.email.toLowerCase()).then((verificationData)=>{
        req.OTPData={
            email:req.body.email.toLowerCase(),
            validationTime:verificationData.resetPassword.validationTime,
            isUsed:verificationData.resetPassword.isUsed
        }
        req.OTP=verificationData.resetPassword.OTP
        next()
    }).catch((err)=>{
        req.flash("errors", err)
        req.session.save(() => res.redirect("/forgot-password-form"))
    })
}

exports.sentNewOTP = function (req, res) {
    Student.sentResetPasswordNewOTP(req.body.email.toLowerCase()).then((email)=>{
        res.redirect(`/reset-password-form/${email}`)
    }).catch((err)=>{
        req.flash("errors", err)
        req.session.save(() => res.redirect("/forgot-password-form"))
    })
}
//email id taken from param passing
exports.getVerifiedDataByEmailId = function (req, res,next) {
    Student.ifEmailIdRegistered(req.params.email.toLowerCase()).then((verificationData)=>{
        req.OTPData={
            email:req.params.email.toLowerCase(),
            validationTime:verificationData.resetPassword.validationTime,
            isUsed:verificationData.resetPassword.isUsed
        }
        next()
    }).catch((err)=>{
        req.flash("errors", err)
        req.session.save(() => res.redirect("/forgot-password-form"))
    })
}

exports.goToResetPasswordForm = function (req, res) {
    res.redirect(`/reset-password-form/${req.body.email}`)
}

exports.getForgotPasswordForm = function (req, res) {
    res.render("forgot-password-form")
}

exports.getResetPasswordForm = function (req, res) {
    let ifTimeOut=false
    let now=new Date()
    if(now>req.OTPData.validationTime){
        ifTimeOut=true
    }
    req.OTPData.ifTimeOut=ifTimeOut
    console.log("OTPData :",req.OTPData)
    res.render("reset-password-form",{
        OTPData:req.OTPData
    })
}

exports.checkNewPasswordData = function (req, res,next) {
    let errMsg=null
    let hasError=false
    if(req.body.newPassword!=req.body.confirmPassword){
        errMsg="Password and confirmation-password has not matched."  
        hasError=true
    }else{
        if (req.body.newPassword == "") {
            errMsg="You must provide a password."
            hasError=true
        }
        if(req.body.newPassword.length > 0 && req.body.newPassword.length < 8) {
            errMsg="Password must be at least 8 characters."
            hasError=true
        }
        if (req.body.newPassword.length > 50) {
            errMsg="Password cannot exceed 50 characters."
            hasError=true
        }
    }   
    if(!hasError){
        next()
    }else{
        if(req.regNumber){//used when set new password
            req.flash("errors", errMsg)
            req.session.save(() => res.redirect(`/profile-setting/${req.regNumber}`))
        }else{
            req.flash("errors", errMsg)
            req.session.save(() => res.redirect(`/reset-password-form/${req.body.email}`))
        }
    }    
}

exports.checkOTPData = function (req, res,next) {
    if(req.body.OTP==String(req.OTP)){
        let hasError=false
        let errMsg=null
        let now=new Date()
        if(now>req.OTPData.validationTime){
            hasError=true
            errMsg="Your OTP validation time is out.Please sent new OTP."
        }
        if(req.OTPData.isUsed){
            hasError=true
            errMsg="Your Have already used this OTP."
        }
        if(!hasError){
            next()
        }else{
            req.flash("errors", errMsg)
            req.session.save(() => res.redirect(`/reset-password-form/${req.body.email}`))    
        }
    }else{
        req.flash("errors", "Your Provided OTP has not matched.")
        req.session.save(() => res.redirect(`/reset-password-form/${req.body.email}`))
    }
}

exports.setNewPassword = function (req, res) {
    Student.setNewPassword(req.OTPData.email,req.body.newPassword).then(()=>{
        req.flash("success", "Successfully set new password!!Log in with new password.")
        req.session.save(() => res.redirect("/log-in"))        
    }).catch(()=>{
        req.flash("errors", "There is some problem.Please try again later.")
        req.session.save(() => res.redirect(`/reset-password-form/${req.OTPData.email}`))    
    }) 
}