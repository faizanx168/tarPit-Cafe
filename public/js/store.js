'use strict';
const form  = document.querySelector('#formQuery');
const formDrop  = document.querySelector('.dropForm');
let dropForm = false;
const Store = {
    quantity: () => {
        let qtyWrap = document.querySelectorAll('.qty-wrap');
        if(qtyWrap.length > 0) {
            for(let i = 0; i < qtyWrap.length; i++) {
                let qty = qtyWrap[i];
                let minus = qty.querySelector('.qty-minus');
                let plus =  qty.querySelector('.qty-plus');
                let input = qty.querySelector('.qty');
                let value = parseInt(input.value, 10);

                plus.addEventListener('click', () => {
                    value = value + 1;
                    input.value = value;
                });

                minus.addEventListener('click', () => {
                    value = (value > 1) ? (value - 1) : 1;
                    input.value = value;
                });

            }
        }
    }
};
document.addEventListener('DOMContentLoaded', () => {
    Store.quantity();
});

formDrop.addEventListener('click', ()=>{
    dropForm = !dropForm;
    if(dropForm == true){
        formDrop.classList.toggle('dropFormRotate')
        form.innerHTML =' ';
        form.innerHTML = `  
        <form action="/products"  >
        <div>
        <input class="filterbox" type="checkbox" name="query" id="goods" value="goods">
        <input class="filterbox" type="checkbox" name="query" id="cloths" value="apparel">
        <input class="filterbox" type="checkbox" name="query" id="coffee" value="coffee">
        <input class="filterbox" type="checkbox" name="query" id="giftCard" value="giftcard">
        </div>
        <div class="filterLabel">
        <label class="filterbox" for="goods">Goods</label>
        <label class="filterbox" for="cloths">Apparel</label>
        <label class="filterbox" for="coffee">Coffee</label>
        <label class="filterbox" for="giftCard">Gift Card</label>
        </div>
        <div style="text-align: center;">
        <button class="btn" >Filter</button>
        </div>
        </form>
        `
    }else{
        formDrop.classList.toggle('dropFormRotate')
        form.innerHTML = ' ';
    }
})
