const shippingBtn = document.querySelector(".shippingBtn");
const pickupBtn = document.querySelector(".pickupBtn");
const checkoutForm = document.querySelector(".formChange");
const pickupForm = document.querySelector(".PickUp");
pickupBtn.addEventListener("click", () => {
  checkoutForm.style.display = "none";
  pickupForm.style.display = "inline";
});
shippingBtn.addEventListener("click", () => {
  checkoutForm.style.display = "inline";
  pickupForm.style.display = "none";
});
