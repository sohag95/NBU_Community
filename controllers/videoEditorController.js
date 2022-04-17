exports.videoEditorHome = function (req, res) {
  try{
    res.render('videoEditor-home')
  }catch{
    res.render("404")
  }
}