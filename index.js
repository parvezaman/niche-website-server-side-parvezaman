const express = require('express');
const { MongoClient } = require('mongodb');
const cors =require('cors');
const app = express();
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

//PORT
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

//MongoBD Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kbuol.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
      await client.connect();
      const database = client.db("shop-and-shoot");
      const haiku = database.collection("test");
      const productCollection = database.collection("productCollection");
      const purchaseInitCollection = database.collection("purchaseInitCollection");
      const ordersCollection = database.collection("ordersCollection");

      // GET Products API
      app.get('/products', async(req, res)=>{
        const cursor = productCollection.find({});
        const products = await cursor.toArray();
        res.send(products);
      });
      // GET Orders API
      app.get('/orders', async(req, res)=>{
        const cursor = ordersCollection.find({});
        const orders = await cursor.toArray();
        res.send(orders);
      });
      // GET specific Orders API 
      app.get('/orders/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const singleOrder = await ordersCollection.findOne(query);
        res.send(singleOrder);
      });

      // GET API (Get single product by id)
      app.get('/products/:id', async(req, res)=>{
        const id = req.params.id;
        console.log('getting a single product', id);
        const query = {_id: ObjectId(id)};
        const singleProduct = await productCollection.findOne(query);
        res.json(singleProduct);
      });
      

      // POST API (Post Orders)
      app.post('/orders', async(req, res)=>{
        const order = req.body;
        const status2 ={status:'pending'};
        const userOrder ={...order, ...status2};
        const result = await ordersCollection.insertOne(userOrder);
        res.json(result);
      })

      // POST API (Proceed Order)
      app.post('/purchaseinit', async(req, res)=>{
        const purchaseInit = req.body;
        const result = await purchaseInitCollection.insertOne(purchaseInit);
        res.json(result);
      });

      // POST API (Add new Product)
      app.post('/products', async(req, res)=>{
        const product = req.body;
        const result = await productCollection.insertOne(product);
        // console.log("hit the post");
        res.json(result);
      });

      // DELETE API (Delete order from my orders)
      app.delete('/orders/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await ordersCollection.deleteOne(query);
        console.log('deleting id', result)
        res.json(result);
      })


      // const result = await haiku.insertOne(doc);
      // console.log(`A document was inserted with the _id: ${result.insertedId}`);
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World! the shop and shoot server has just started! Happy Browsing!!! X-D');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})