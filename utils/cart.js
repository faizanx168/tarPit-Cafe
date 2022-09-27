
'use strict';
const config = require('./config');

class Cart {

    static addToCart(product = null, qty = 1, cart) {
        if(!this.inCart(product, cart)) {
            cart.items.push(product);
            cart.totals = this.calculateTotals(cart);
            cart.formattedTotals = this.setFormattedTotals(cart);
        }
    }
    static inCart(product = null, cart) {
        let found = false;
        cart.items.forEach(item => {
           if(product.id.equals(item.id)) {
            item.qty += product.qty;
            cart.totals = this.calculateTotals(cart);
            cart.formattedTotals = this.setFormattedTotals(cart);
            found = true;
           }
        });
        return found;
    }
   
    static calculateTotals(cart) {
        let totals = 0.00;
        cart.items.forEach( (item) =>{
            let price = item.price;
            let qty = item.qty;
            let amount = price * qty;
            totals += amount;
        })
        return totals
    }



    static setFormattedTotals(cart) {
        let format = new Intl.NumberFormat(config.locale.lang, {style: 'currency', currency: config.locale.currency });
        let totals = cart.totals;
        return format.format(totals);
    }

}

module.exports = Cart;