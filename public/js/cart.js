const itemCon = document.querySelectorAll(".itemContainer");
const quantity = document.querySelectorAll(".qty");
const increment = document.querySelectorAll(".qty-plus");
const decrement = document.querySelectorAll(".qty-minus");
const price = document.querySelectorAll(".price");
const deleteBtn = document.querySelectorAll(".delete");
const itemId = document.getElementsByClassName("itemId");
const checkout = document.querySelector(".checkout");
const noCon = document.querySelectorAll(".itemContainer");
const addToCart = document.querySelector(".addToCart");
let cost = 0;

function updateBill(cos) {
  let billPrice = document.querySelector(".cost");
  billPrice.innerHTML = cos;
}

itemCon.forEach((item, i) => {
  increment[i].addEventListener("click", async () => {
    let data = await fetchData();
    if (data.items[i].qty < data.items[i].stock && data.items[i].qty <= 10) {
      let cost = parseFloat(data.totals / 100);
      let bill = 0.0;
      data.items[i].qty++;
      bill += parseFloat(data.items[i].price);
      cost += bill;
      //   console.log(cost, data.items[i].qty, price[i].innerHTML);
      data.totals = cost * 100;
      cost = setFormattedTotals(cost);
      data.formattedTotals = cost;
      updateBill(cost);
      await postData(data);
    }
  });
  decrement[i].addEventListener("click", async () => {
    let data = await fetchData();
    let cost = parseFloat(data.totals / 100);
    if (data.items[i].qty > 1) {
      data.items[i].qty--;
      cost -= parseFloat(data.items[i].price);
      // console.log(cost, data.items[i].qty, price[i].innerHTML);
      data.totals = cost * 100;
      cost = setFormattedTotals(cost);
      data.formattedTotals = cost;
      updateBill(cost);
      await postData(data);
    }
  });
});

deleteBtn.forEach((it, i) => {
  deleteBtn[i].addEventListener("click", async (e) => {
    let data = await fetchData();
    let cost = parseFloat(data.totals) / 100;

    if (data.items[i].id === itemId[i].value) {
      let total = 0.0;
      total = parseInt(data.items[i].qty) * parseFloat(data.items[i].price);

      cost = cost - total;
      data.totals = cost * 100;
      cost = setFormattedTotals(cost);
      data.formattedTotals = cost;
      noCon[i].innerHTML = " ";
      data.items = data.items.filter((data, index) => index != i);
      await postData(data);
      location.reload(true);
      updateBill(cost);
    }
  });
});

const fetchData = async () => {
  const res = await axios.get(`/cartdata`);
  const data = res.data;
  return data;
};

const postData = async (data) => {
  await axios.put("/cartdata", {
    data: data,
  });
};

const setFormattedTotals = (total) => {
  let format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  return format.format(total);
};
