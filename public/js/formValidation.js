// Form Validation
(() => {
  "use strict";
  // const form = document.getElementById("registration");
  const forms = document.querySelectorAll(".validated-form");
  const username = document.getElementById("username");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const password2 = document.getElementById("re-password");
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const address = document.getElementById("address");
  const address2 = document.getElementById("address2");
  const country = document.getElementById("country");
  const zip = document.getElementById("zip");
  const city = document.getElementById("city");
  const state = document.getElementById("state");
  const phone = document.getElementById("phone");

  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        const valid = checkInputs();
        form.classList.add("was-validated");
        if (valid) {
          HTMLFormElement.prototype.submit.call(form);
        }
      },
      false
    );
  });
  function checkInputs() {
    let isUsernameValid;
    let fnameValid;
    let lnameValid;
    let emailValid;
    let pass1Valid;
    let pass2Valid;
    let addressValid;
    let address2Valid;
    let countryValid;
    let zipValid;
    let cityValid;
    let stateValid;
    let phoneValid;
    if (username) {
      const usernameValue = username.value.trim();
      if (usernameValue === "") {
        setErrorFor(username, "Username cannot be blank");
        isUsernameValid = false;
      } else {
        setSuccessFor(username, usernameValue);
        isUsernameValid = true;
      }
    } else {
      isUsernameValid = true;
    }
    if (firstName) {
      const fName = firstName.value.trim();
      if (fName === "") {
        setErrorFor(firstName, "Name cannot be blank");
        fnameValid = false;
      } else {
        setSuccessFor(firstName, fName);
        fnameValid = true;
      }
    } else {
      fnameValid = true;
    }
    if (lastName) {
      const lName = lastName.value.trim();
      if (lName === "") {
        setErrorFor(lastName, "Name cannot be blank");
        lnameValid = false;
      } else {
        setSuccessFor(lastName, lName);
        lnameValid = true;
      }
    } else {
      lnameValid = true;
    }
    if (email) {
      const emailValue = email.value.trim();
      if (emailValue === "") {
        setErrorFor(email, "Email cannot be blank");
        emailValid = false;
      } else if (!isEmail(emailValue)) {
        setErrorFor(email, "Not a valid email");
        emailValid = false;
      } else {
        setSuccessFor(email, emailValue);
        emailValid = true;
      }
    } else {
      emailValid = true;
    }
    if (password) {
      const passwordValue = password.value.trim();
      if (passwordValue === "") {
        setErrorFor(password, "Password cannot be blank");
        pass1Valid = false;
      } else if (passwordValue.length < 8) {
        setErrorFor(password, "Password cannot be less than 8 characters!");
        pass1Valid = false;
      } else {
        setSuccessFor(password, passwordValue);
        pass1Valid = true;
      }
    } else {
      pass1Valid = true;
    }
    if (password2) {
      const passwordValue = password.value.trim();
      const password2Value = password2.value.trim();
      if (password2Value === "") {
        setErrorFor(password2, "Password cannot be blank");
        pass2Valid = false;
      } else if (password2Value.length < 8) {
        setErrorFor(password2, "Password cannot be less than 8 characters!");
        pass2Valid = false;
      } else if (passwordValue != password2Value) {
        setErrorFor(password2, "Passwords does not match");
        pass2Valid = false;
      } else {
        setSuccessFor(password2, password2Value);
        pass2Valid = true;
      }
    } else {
      pass2Valid = true;
    }
    if (address) {
      const addressValue = address.value.trim();
      if (addressValue === "") {
        setErrorFor(address, "Address cannot be blank");
        addressValid = false;
      } else {
        setSuccessFor(address, addressValue);
        addressValid = true;
      }
    } else {
      addressValid = true;
    }
    if (address2) {
      const address2Value = address2.value.trim();
      if (address2Value === "") {
        setErrorFor(address2, "Address line 2 cannot be blank");
        address2Valid = false;
      } else {
        setSuccessFor(address2, address2Value);
        address2Valid = true;
      }
    } else {
      address2Valid = true;
    }
    if (country) {
      const countryValue = country.value.trim();
      if (countryValue === "") {
        setErrorFor(country, "Country cannot be blank");
        countryValid = false;
      } else {
        setSuccessFor(country, countryValue);
        countryValid = true;
      }
    } else {
      countryValid = true;
    }
    if (city) {
      const cityValue = city.value.trim();
      if (cityValue === "") {
        cityValid = false;
      } else {
        setSuccessFor(city, cityValue);
        cityValid = true;
      }
    } else {
      cityValid = true;
    }
    if (state) {
      const stateValue = state.value.trim();
      if (stateValue === "") {
        stateValid = false;
      } else {
        setSuccessFor(state, stateValue);
        stateValid = true;
      }
    } else {
      stateValid = true;
    }
    if (zip) {
      const zipValue = zip.value.trim();
      if (zipValue === "") {
        zipValid = false;
      } else if (zipValue.length < 5 || zipValue.length > 5) {
        zipValid = false;
      } else {
        setSuccessFor(zip, zipValue);
        zipValid = true;
      }
    } else {
      zipValid = true;
    }
    if (phone) {
      const phoneValue = phone.value.trim();
      if (phoneValue === "") {
        setErrorFor(phone, "Phone cannot be blank");
        phoneValid = false;
      } else {
        setSuccessFor(phone, phoneValue);
        phoneValid = true;
      }
    } else {
      phoneValid = true;
    }
    let formValid =
      pass2Valid &&
      pass1Valid &&
      emailValid &&
      lnameValid &&
      fnameValid &&
      isUsernameValid &&
      addressValid &&
      address2Valid &&
      countryValid &&
      zipValid &&
      cityValid &&
      stateValid &&
      phoneValid;

    return formValid;
  }

  function setErrorFor(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    formControl.className = "formControl error";
    small.innerText = message;
  }

  function setSuccessFor(input, value) {
    const formControl = input.parentElement;
    formControl.className = "formControl success";
    const small = formControl.querySelector("small");
    if (small) {
      small.innerText = "";
    }
    input.value = value;
  }

  function isEmail(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    );
  }
})();
