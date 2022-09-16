import axios from 'axios'

export default class Search {
  // 1. Select DOM elements, and keep track of any useful data
  constructor() {
    this.injectHTML()
    this.headerSearchIcon = document.querySelector(".header-search-icon")
    this.overlay = document.querySelector(".search-overlay")
    this.closeIcon = document.querySelector(".close-live-search")
    this.inputField = document.querySelector("#live-search-field")
    this.resultsArea = document.querySelector(".live-search-results")
    this.loaderIcon = document.querySelector(".circle-loader")
    this.typingWaitTimer
    this.previousValue = ""
    this.events()
  }

  // 2. Events
  events() {
    this.inputField.addEventListener("keyup", () => this.keyPressHandler())
    this.closeIcon.addEventListener("click", () => this.closeOverlay())
    this.headerSearchIcon.addEventListener("click", (e) => {
      e.preventDefault()
      this.openOverlay()
    })
  }

  // 3. Methods
  keyPressHandler() {
    let value = this.inputField.value

    if (value == "") {
      clearTimeout(this.typingWaitTimer)
      this.hideLoaderIcon()
      this.hideResultsArea()
    }

    if (value != "" && value != this.previousValue) {
      clearTimeout(this.typingWaitTimer)
      this.showLoaderIcon()
      this.hideResultsArea()
      this.typingWaitTimer = setTimeout(() => this.sendRequest(), 750)
    }

    this.previousValue = value
  }

  sendRequest() {
    axios.post('/search-student', {searchTerm: this.inputField.value}).then(response => {
      console.log(response.data)
      this.renderResultsHTML(response.data)
    }).catch(() => {
      alert("Hello, the request failed.")
    })
  }

  renderResultsHTML(students) {
    if (students.length) {
      this.resultsArea.innerHTML = `<div class="list-group shadow-sm">
      <div class="list-group-item active"><strong>Search Results</strong> (${students.length > 1 ? `${students.length} students found` : '1 student found'})</div>
      ${students.map(student => {
        
        return `<a href="/student/${student.regNumber}/profile" class="list-group-item list-group-item-action">
        <div class="d-flex align-items-center student-room-container" >
              <div >
                <img class="avatar-small"  src="/image/profile/small/profile-${student.regNumber}" alt="">
              </div>
              <div class="ml-2">
                <span class="d-block"><strong>${student.userName}</strong><i> (session : ${student.sessionYear})</i> </span>
                <span class="d-block"><strong >Department : </strong>${student.departmentName}</span>
              </div>
            </div>
      </a>`
      }).join('')}
    </div>`
    } else {
      this.resultsArea.innerHTML = `<p class="alert alert-danger text-center shadow-sm">Sorry, we could not find any results for that search.</p>`
    }
    this.hideLoaderIcon()
    this.showResultsArea()
  }

  showLoaderIcon() {
    this.loaderIcon.classList.add("circle-loader--visible")
  }

  hideLoaderIcon() {
    this.loaderIcon.classList.remove("circle-loader--visible")
  }

  showResultsArea() {
    this.resultsArea.classList.add("live-search-results--visible")
  }

  hideResultsArea() {
    this.resultsArea.classList.remove("live-search-results--visible")
  }

  openOverlay() {
    this.overlay.classList.add("search-overlay--visible")
    setTimeout(() => this.inputField.focus(), 50)
  }

  closeOverlay() {
    this.overlay.classList.remove("search-overlay--visible")
  }


  injectHTML() {
    document.body.insertAdjacentHTML('beforeend', `<div class="search-overlay">
    <div class="search-overlay-top shadow-sm">
      <div class="container container--narrow">
        <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
        <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
        <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
      </div>
    </div>

    <div class="search-overlay-bottom">
      <div class="container container--narrow py-3">
        <div class="circle-loader"></div>
        <div class="live-search-results"></div>
      </div>
    </div>
  </div>`)
  }
}