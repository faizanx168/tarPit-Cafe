(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".validated-form");
  const addInput = document.querySelector(".addInputs");
  const plusInput = document.querySelector(".plusInput");
  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });

  plusInput.addEventListener("click", () => {
    add();
  });

  function add() {
    var input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("class", "form-control");
    input.setAttribute("id", "values");
    input.setAttribute("name", "values[]");
    input.setAttribute("placeholder", "eq. Small/Medium/Large");
    addInput.appendChild(input);
  }
})();
