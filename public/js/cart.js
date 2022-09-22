// const { calculateTotals } = require("../../utils/cart");

// const { func } = require("joi");

const check = document.querySelectorAll('.itemCheck');
const itemCon = document.querySelectorAll('.itemContainer');
const quantity = document.querySelectorAll('.qty');
const increment = document.querySelectorAll('.qty-plus');
const decrement = document.querySelectorAll('.qty-minus');
const price = document.querySelectorAll('.price');
const deleteBtn = document.querySelectorAll('.delete');
const itemId= document.getElementsByClassName('itemId');
const checkout = document.querySelector('.checkout');
const noCon = document.querySelectorAll('.null');

let cost = 0;
let checked = false;

 function updateBill(cos){
    let billPrice = document.querySelector('.cost');
    billPrice.innerHTML = `$${cos}`;
}

const calculateTotals = (data)=>{
    cost = data.totals;
    itemCon.forEach((item, i)=>{
        increment[i].addEventListener('click',()=>{
            let bill = 0;
            data.items[i].qty++
            bill += data.items[i].price;
            cost += bill;
            console.log(cost, data.items[i].qty,price[i].innerHTML)
            updateBill(cost);
        })
        decrement[i].addEventListener('click',()=>{
            if( data.items[i].qty > 1){
            let bill = 0;
            data.items[i].qty--;
            cost -= data.items[i].price;
            console.log(cost, data.items[i].qty,price[i].innerHTML)
            updateBill(cost);
            }
    })
    })
    return cost;
}

const remove = (data)=>{
    check.forEach( (c , i)=>{ 
        c.addEventListener('click',() => {
            itemCon[i].classList.toggle('itemContainerhid')
            checked = !checked;
            if(checked){
            let total = 0;
            total = data.items[i].qty * data.items[i].price;
            cost = cost - total;
            updateBill(cost);
        }else{
            let total = 0;
            total = data.items[i].qty * data.items[i].price;
            cost = cost + total;
            updateBill(cost);
        }
         })

         deleteBtn[i].addEventListener('click',(e)=>{
            if(data.items[i].id === itemId[i].value){
                let total = 0;
                total = data.items[i].qty * data.items[i].price;
                cost = cost - total;
                updateBill(cost);
                data.items.splice(i);
                noCon[i].innerHTML = ' ';
                return data.items
            };
        })
     })
}



const fetchData = async () => {
    const res = await axios.get(`http://localhost:3000/cartdata`);
    const data = res.data;
    calculateTotals(data);
    remove(data);
    checkout.addEventListener('click', ()=>{
        console.log(data);
    })
}
fetchData();
