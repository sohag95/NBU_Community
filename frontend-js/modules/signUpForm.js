import axios from 'axios'
import validator from "validator"

export default class SignUpForm {
  constructor() {
   this.form = document.querySelector("#signUp-form")
    this.allFields = document.querySelectorAll("#signUp-form .form-control")
    this.insertValidationElements() 
    this.userName = document.querySelector("#userName-register")
    this.userName.previousValue = ""

    this.department = document.querySelector("#department")
    this.sessionYear = document.querySelector("#sessionYear")
    

    this.email = document.querySelector("#email-register")
    this.email.previousValue = ""

    this.phone = document.querySelector("#phone-register")
    this.phone.previousValue = ""
    
    this.password = document.querySelector("#password-register")
    this.password.previousValue = ""

    this.rePassword = document.querySelector("#re-password-register")
    this.rePassword.previousValue = ""
    
    this.email.isUnique = false
    this.phone.isUnique = false
    this.events()
  }

  // Events
  events() {
    this.form.addEventListener("submit", e => {
      e.preventDefault()
      this.formSubmitHandler()
    })

    this.userName.addEventListener("keyup", () => {
      this.isDifferent(this.userName, this.userNameHandler)
    })
    this.email.addEventListener("keyup", () => {
      this.isDifferent(this.email, this.emailHandler)
    })
    this.phone.addEventListener("keyup", () => {
        this.isDifferent(this.phone, this.phoneHandler)
    })

    this.password.addEventListener("keyup", () => {
      this.isDifferent(this.password, this.passwordHandler)
    })
    this.rePassword.addEventListener("keyup", () => {
      this.isDifferent(this.rePassword, this.rePasswordHandler)
    })
    

    this.userName.addEventListener("blur", () => {
      this.isDifferent(this.userName, this.userNameHandler)
    })
    this.email.addEventListener("blur", () => {
      this.isDifferent(this.email, this.emailHandler)
    })
    this.phone.addEventListener("blur", () => {
        this.isDifferent(this.phone, this.phoneHandler)
    })
    this.password.addEventListener("blur", () => {
      this.isDifferent(this.password, this.passwordHandler)
    })
    this.rePassword.addEventListener("blur", () => {
      this.isDifferent(this.rePassword, this.rePasswordHandler)
    })
    
  }

  // Methods
  formSubmitHandler() {
    this.userNameImmediately()
    this.userNameAfterDelay()
    this.emailAfterDelay()
    this.phoneAfterDelay()
    this.passwordImmediately()
    this.rePasswordImmediately()
    this.passwordAfterDelay()
   
    if (
        !this.userName.errors &&
        this.email.isUnique &&
        !this.email.errors &&
        this.phone.isUnique &&
        !this.phone.errors &&
        !this.password.errors &&
        !this.rePassword.errors
      ) {
        let selectedDepartmentIndex=this.department.selectedIndex
        if (confirm(`According to your provided data, Your department is : '${this.department.options[selectedDepartmentIndex].text}' and Your batch session year is : '${this.sessionYear.value}' .You can not change it later!! `)) {
          this.form.submit()
        }
    }

  }
  
  isDifferent(el, handler) {
    if (el.previousValue != el.value) {
      handler.call(this)
    }
    el.previousValue = el.value
  }

  userNameHandler() {
    this.userName.errors = false
    this.userNameImmediately()
    clearTimeout(this.userName.timer)
    this.userName.timer = setTimeout(() => this.userNameAfterDelay(), 800)
  }

  passwordHandler() {
    this.password.errors = false
    this.passwordImmediately()
    clearTimeout(this.password.timer)
    this.password.timer = setTimeout(() => this.passwordAfterDelay(), 800)
  }
  rePasswordHandler() {
    this.rePassword.errors = false
    this.rePasswordImmediately()
  }
  rePasswordImmediately() {
    if (this.rePassword.value!=this.password.value) {
      this.showValidationError(this.rePassword, "Confirmation password has not matched.")
    }
    if (!this.rePassword.errors) {
      this.hideValidationError(this.rePassword)
    }
  }

  passwordImmediately() {
    if (this.password.value.length > 50) {
      this.showValidationError(this.password, "Password cannot exceed 50 characters.")
    }

    if (!this.password.errors) {
      this.hideValidationError(this.password)
    }
  }

  passwordAfterDelay() {
    if (this.password.value.length < 8) {
      this.showValidationError(this.password, "Password must be at least 8 characters.")
    }
  }

  emailHandler() {
    this.email.errors = false
    clearTimeout(this.email.timer)
    this.email.timer = setTimeout(() => this.emailAfterDelay(), 800)
  }
  phoneHandler() {
    this.phone.errors = false
    clearTimeout(this.phone.timer)
    this.phone.timer = setTimeout(() => this.phoneAfterDelay(), 800)
  }

  emailAfterDelay() {
    
    if (!validator.isEmail(this.email.value)) {
      this.showValidationError(this.email, "You must provide a valid email-Id.")
    }

    if (!this.email.errors) {
      axios.post('/doesEmailExists', {email: this.email.value}).then((response) => {
        if (response.data) {
          this.email.isUnique = false
          this.showValidationError(this.email, "Given email is already being used.")
        } else {
          this.email.isUnique = true
          this.hideValidationError(this.email)
        }
      }).catch(() => {
        console.log("Please try again later.")
      })
    }
  }

  phoneAfterDelay() {
    if (this.phone.value.length!=10) {
      this.showValidationError(this.phone, "Provide a valid 10-digit phone number.")
    }
    if (!this.phone.errors) {
      axios.post('/doesPhoneNumberExists', {phone: this.phone.value}).then((response) => {
        if (response.data) {
          this.phone.isUnique = false
          this.showValidationError(this.phone, "Given phone number is already being used.")
        } else {
          this.phone.isUnique = true
          this.hideValidationError(this.phone)
        }
      }).catch(() => {
        console.log("Please try again later.")
      })
    }
  }

  userNameImmediately() {
    if (this.userName.value.length > 30) {
      this.showValidationError(this.userName, "User Name cannot exceed 30 characters.")
    }
    if (!this.userName.errors) {
      this.hideValidationError(this.userName)
    }
  }

  userNameAfterDelay() {
    if (this.userName.value.length < 5) {
      this.showValidationError(this.userName, "Give your full name.")
    }
  }

  hideValidationError(el) {
    el.nextElementSibling.classList.remove("liveValidateMessage--visible")
  }

  showValidationError(el, message) {
    el.nextElementSibling.innerHTML = message
    el.nextElementSibling.classList.add("liveValidateMessage--visible")
    el.errors = true
  }

  insertValidationElements() {
    this.allFields.forEach(function(el) {
      el.insertAdjacentHTML('afterend', '<div class="alert alert-danger small liveValidateMessage"></div>')
    })
  }
}