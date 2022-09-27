const itemCon = document.querySelectorAll('.itemContainer');
const quantity = document.querySelectorAll('.qty');
const increment = document.querySelectorAll('.qty-plus');
const decrement = document.querySelectorAll('.qty-minus');
const price = document.querySelectorAll('.price');
const deleteBtn = document.querySelectorAll('.delete');
const itemId= document.getElementsByClassName('itemId');
const checkout = document.querySelector('.checkout');
const noCon = document.querySelectorAll('.null');
const addToCart = document.querySelector('.addToCart');
let cost = 0;

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
            console.log(cost, data.items[i].qty,price[i].innerHTML);
            data.totals = cost;
            data.formattedTotals = setFormattedTotals(cost);
            updateBill(cost);
            postData(data);
        })
        decrement[i].addEventListener('click',()=>{
            if( data.items[i].qty > 1){
            let bill = 0;
            data.items[i].qty--;
            cost -= data.items[i].price;
            console.log(cost, data.items[i].qty,price[i].innerHTML)
            data.totals = cost;
            data.formattedTotals = setFormattedTotals(cost);
            updateBill(cost);
            postData(data);
            }
    })
    })
    postData(data);
}

const remove = (data)=>{
    deleteBtn.forEach((it, i) => {
         deleteBtn[i].addEventListener('click',(e)=>{
            if(data.items[i].id === itemId[i].value){
                let total = 0;
                total = data.items[i].qty * data.items[i].price;
                cost = cost - total;
                data.totals = cost;
                noCon[i].innerHTML = ' ';
                data.formattedTotals = setFormattedTotals(cost);
                updateBill(cost);
                data.items = data.items.filter((data, index) => index != i);
                postData(data);
            };
        })
     })
     postData(data);

}


const fetchData = async () => {
    const res = await axios.get(`http://localhost:3000/cartdata`);
    const data = res.data;
    console.log(data);
    calculateTotals(data);
    remove(data);
    // postData(data);
}
fetchData();

const postData = async (data) => {
    // checkSlice(data);
    axios.put('http://localhost:3000/cartdata',{
        data: data
    }).then((data) => {
        console.log('posted', data)
    }).catch((err) => {
        console.log('error');
    });
}

const setFormattedTotals = (total) => {
    let format = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD' });
    return format.format(total);
}