const OfficialUser=require('../models/OfficialUsers')

exports.adminMustBeLoggedIn = function (req, res, next) {
  if(req.session.user){
    if (req.session.user.accountType == "admin") {
      next()
    } else {
      req.flash("errors", "You are not allowed to perform that action!!")
      req.session.save(function () {
        res.redirect("/")
      })
    }
  }else{
    req.flash("errors", "You should log-in first to perform that action.")
    req.session.save(() => res.redirect("/log-in"))
  }
}

exports.societyControllerMustBeLoggedIn = function (req, res, next) {
  if(req.session.user){
    if (req.session.user.accountType == "societyController") {
      next()
    } else {
      req.flash("errors", "You are not allowed to perform that action!!")
      req.session.save(function () {
        res.redirect("/")
      })
    }
  }else{
    req.flash("errors", "You should log-in first to perform that action.")
    req.session.save(() => res.redirect("/log-in"))
  }
}



