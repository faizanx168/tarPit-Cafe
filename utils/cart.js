
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
           if(item.id.equals(product.id)) {
            item.qty += product.qty;
            cart.totals = this.calculateTotals(cart);
            cart.formattedTotals = this.setFormattedTotals(cart);
            found = true;
           }
        });
        return found;
    }

    static removeFromCart(id = 0, cart) {
        for(let i = 0; i < cart.items.length; i++) {
            let item = cart.items[i];
            if(item.id === id) {
                cart.items.splice(i, 1);
                this.calculateTotals(cart);
            }
        }

    }

    static updateCart(ids = [], qtys = [], cart) {
        let map = [];
        let updated = false;

        ids.forEach(id => {
           qtys.forEach(qty => {
              map.push({
                  id: parseInt(id, 10),
                  qty: parseInt(qty, 10)
              });
           });
        });
        map.forEach(obj => {
            cart.items.forEach(item => {
               if(item.id === obj.id) {
                   if(obj.qty > 0 && obj.qty !== item.qty) {
                       item.qty = obj.qty;
                       updated = true;
                   }
               }
            });
        });
        if(updated) {
            this.calculateTotals(cart);
        }
    }

   
    static calculateTotals(cart) {
        let totals = 0.00;
        cart.items.forEach( (item) =>{
            let price = item.price;
            let qty = item.qty;
            // console.log('price', price, qty)
            let amount = price * qty;
            // console.log('amou' ,amount)111
            totals += amount;
        })
        // console.log(' my totoal', totals)
        return totals
    }

   static emptyCart(request) {
        
        if(request.session) {
            request.session.cart.items = [];
            request.session.cart.totals = 0.00;
            request.session.cart.formattedTotals = '';
        }


    }

    static setFormattedTotals(cart) {
        let format = new Intl.NumberFormat(config.locale.lang, {style: 'currency', currency: config.locale.currency });
        let totals = cart.totals;
        return format.format(totals);
    }

}

module.exports = Cart;