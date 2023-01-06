"use strict";

class Cart {
  static addToCart(product = null, qty = 1, cart) {
    if (!this.inCart(product, cart)) {
      cart.items.push(product);
      cart.totals = this.calculateTotals(cart);
      cart.formattedTotals = this.setFormattedTotals(cart);
    }
  }
  static inCart(product = null, cart) {
    let found = false;
    cart.items.forEach((item) => {
      if (product.id.equals(item.id)) {
        item.qty += product.qty;
        cart.totals = this.calculateTotals(cart);
        cart.formattedTotals = this.setFormattedTotals(cart);
        found = true;
      }
    });
    return found;
  }

  static calculateTotals(cart) {
    let totals = 0.0;
    cart.items.forEach((item) => {
      let price = item.price * 100;
      let qty = item.qty;
      let amount = price * qty;
      totals += amount;
    });
    return totals;
  }

  static setFormattedTotals(cart) {
    let format = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });
    let totals = cart.totals / 100;
    return format.format(totals);
  }
}

module.exports = Cart;
/* last */
