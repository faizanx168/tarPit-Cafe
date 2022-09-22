const mongoose = require('mongoose');
const Products = require('../models/Product');
const { coffee, descriptors } = require('./seedsHelper');


mongoose.connect('mongodb://localhost:27017/tarpit', {useNewUrlparser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', ()=>{
    console.log('database Connected Successfully');
})
const categories = ['goods', 'apparel', 'giftcard', 'coffee']

const sample = array => array[Math.floor(Math.random()* array.length)];


const seedDB = async() =>{
    await Products.deleteMany({});
    
for(let i = 0; i <20 ; i++){
    const i = Math.floor(Math.random()*3);
    const price = Math.floor(Math.random()*20) +10;
    const product = new Products({
        title: `${sample(descriptors)} ${sample(coffee)}`,
        image:[{
         url: 'https://source.unsplash.com/collection/483251',
         filename: 'seeds/splashimage'
        }],
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque molestiae tempore eligendi itaque vel accusamus fugiat ad aspernatur doloribus nesciunt, facilis, nisi obcaecati sit optio sapiente animi reiciendis quaerat. Illo.',
        price: price,
        category: `${categories[i]}`
    })
    await product.save();
}
}

seedDB().then(() =>{
    mongoose.connection.close();
})