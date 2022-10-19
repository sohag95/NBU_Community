import Search from './modules/search'
import RegistrationForm from './modules/signUpForm'

if (document.querySelector("#signUp-form")) {
  console.log("run the code")
  new RegistrationForm()
}
if (document.querySelector(".header-search-icon")) {
  new Search()
}