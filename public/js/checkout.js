const shippingBtn = document.querySelector(".shippingBtn");
const pickupBtn = document.querySelector(".pickupBtn");
const checkoutForm = document.querySelector(".formChange");

pickupBtn.addEventListener("click", () => {
  checkoutForm.innerHTML = " ";
  checkoutForm.innerHTML = `
    <div class="form-check">
    <input class="form-check-input" type="radio" name="shipping[mehtod]" id="exampleRadios1" value="Inperson Pickup" checked>
    <label class="form-check-label" for="exampleRadios1">
    Tarpit Coffe Woodpoint
    </label>
    </div>
    <div class = "pickupP">
    <p>TarPit Woodpoint</p>
    <p>Pickup Information</p>
    <p>135 Woodpoint Rd</p>
    <p>Brooklyn, NY 11211</p>
    <p>Please email ahead of time.</p>
    <p>hello@tarpitcoffee.com</p>
    <p>Mon-Fri</p>
    <p>8am-3pm</p>
    <p>Sat-Sun</p>
    <p>9am-4pm</p>
    </div>
    `;
});
shippingBtn.addEventListener("click", () => {
  checkoutForm.innerHTML = " ";
  checkoutForm.innerHTML = `
  <div class="formChange">
  <div class="field padding-bottom--24 name">
    <input
      type="text"
      name="shipping[firstname]"
      class="form-control"
      id="first-name"
      placeholder="First Name"
    />
    <input
      type="text"
      name="shipping[lastname]"
      class="form-control"
      id="last-name"
      placeholder="Last Name"
    />
  </div>
  <div class="field padding-bottom--24">
    <input
      type="text"
      name="shipping[address]"
      class="form-control"
      id="address"
      placeholder="Address"
    />
  </div>
  <div class="field padding-bottom--24">
    <input
      type="text"
      name="shipping[address2]"
      class="form-control"
      id="address"
      placeholder="Address 2"
    />
  </div>
  <div class="field padding-bottom--24">
    <input
      type="text"
      name="shipping[city]"
      class="form-control"
      id="city"
      placeholder="City / Town"
    />
  </div>
  <div class="field padding-bottom--24">
    <input
      type="text"
      name="shipping[zip]"
      class="form-control"
      id="zip"
      placeholder="ZIP code"
    />
  </div>
    `;
});
