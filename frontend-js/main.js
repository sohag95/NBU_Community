import Search from './modules/search'
import RegistrationForm from './modules/signUpForm'

if (document.querySelector("#signUp-form")) {
  console.log("run the code")
  new RegistrationForm()
}
if (document.querySelector(".header-search-icon")) {
  new Search()
}

if (document.querySelector("#student-home-page")) {
  var element = document.getElementById("home-icon");
  element.classList.add("navigate-mark");
}
if (document.querySelector("#student-notification-page")) {
  var element = document.getElementById("notification-icon");
  element.classList.add("navigate-mark");
}
if (document.querySelector("#student-batch-page")) {
  var element = document.getElementById("batch-icon");
  element.classList.add("navigate-mark");
}
if (document.querySelector("#student-department-page")) {
  var element = document.getElementById("department-icon");
  element.classList.add("navigate-mark");
}
if (document.querySelector("#student-group-page")) {
  var element = document.getElementById("group-icon");
  element.classList.add("navigate-mark");
}
if (document.querySelector("#student-profile-page")) {
  var element = document.getElementById("profile-icon");
  element.classList.add("navigate-mark");
}