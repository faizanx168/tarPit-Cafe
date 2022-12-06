(() => {
  "use strict";
  const addInput = document.querySelector(".addInputs");
  const plusInput = document.querySelector(".plusInput");

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
