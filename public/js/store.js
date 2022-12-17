"use strict";

const form = document.querySelector("#formQuery");
const formDrop = document.querySelector(".dropForm");
let dropForm = false;
const Store = {
  quantity: () => {
    let qtyWrap = document.querySelectorAll(".qty-wrap");
    if (qtyWrap.length > 0) {
      for (let i = 0; i < qtyWrap.length; i++) {
        let qty = qtyWrap[i];
        let minus = qty.querySelector(".qty-minus");
        let plus = qty.querySelector(".qty-plus");
        let input = qty.querySelector(".qty");
        let value = parseInt(input.value, 10);

        plus.addEventListener("click", () => {
          if (value < 10) {
            value = value + 1;
            input.value = value;
          }
        });

        minus.addEventListener("click", () => {
          value = value > 1 ? value - 1 : 1;
          input.value = value;
        });
      }
    }
  },
};
document.addEventListener("DOMContentLoaded", () => {
  Store.quantity();
});
if (formDrop) {
  formDrop.addEventListener("click", () => {
    dropForm = !dropForm;
    if (dropForm == true) {
      formDrop.classList.toggle("dropFormRotate");
      form.style.display = "inline";
    } else {
      form.style.display = "none";
      formDrop.classList.toggle("dropFormRotate");
    }
  });
}
