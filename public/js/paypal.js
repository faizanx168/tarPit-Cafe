paypal
  .Buttons({
    // Sets up the transaction when a payment button is clicked
    createOrder: async function () {
      return fetch("/api/orders", {
        method: "post",
      })
        .then((response) => response.json())
        .then((order) => order.id);
    },
    // Finalize the transaction after payer approval
    onApprove: function (data, actions) {
      return fetch(`/api/orders/${data.orderID}/capture`, {
        method: "post",
      })
        .then((response) => response.json())
        .then((orderData) => {
          actions.redirect(`${orderData.url}/paypal/success`);
        });
    },
  })
  .render("#paypal-button-container");
// last
