const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
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
    const usersCollection = database.collection("usersCollection");
    const reviewCollection = database.collection("reviewCollection");
    const accessoriesCollection = database.collection("accessoriesCollection");

    // GET Products API
    app.get('/products', async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });
    // GET Accessories API for home page
    app.get('/accessories', async (req, res) => {
      const cursor = accessoriesCollection.find({});
      const accessory = await cursor.toArray();
      res.send(accessory);
    });
    
    // GET all users API
    app.get('/users', async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });
    // GET Orders API
    app.get('/orders', async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });
    // GET specific Orders API 
    app.get('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const singleOrder = await ordersCollection.findOne(query);
      res.send(singleOrder);
    });

    // GET API (Get single product by id)
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      console.log('getting a single product', id);
      const query = { _id: ObjectId(id) };
      const singleProduct = await productCollection.findOne(query);
      res.json(singleProduct);
    });


    // GET API (Check whether admin or not)
    app.get('/users/:email', async(req, res)=>{
      const email = req.params.email;
      const query = {email : email};
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if(user?.role === 'admin'){
        isAdmin = true;
      }
      res.json({admin: isAdmin});
    })

    // POST API (Post users info email password regestration)
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    })

    // PUT API ( upsert userinfo for Google login)
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter ={email : user.email};
      const option = {upsert:true};
      const updateDoc = {$set: user};
      const result = await usersCollection.updateOne(filter, updateDoc, option);
      res.json(result);
    })

    // PUT API (add role to Make an admin)
    app.put('/users/admin', async(req, res)=>{
      const user = req.body;
      const filter = {email : user.email};
      const updateDoc ={$set:{role: 'admin'}};
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    })

    // POST API (Post Orders)
    app.post('/orders', async (req, res) => {
      const order = req.body;
      const status2 = { status: 'pending' };
      const userOrder = { ...order, ...status2 };
      const result = await ordersCollection.insertOne(userOrder);
      res.json(result);
    })

    // POST API (Proceed Order)
    app.post('/purchaseinit', async (req, res) => {
      const purchaseInit = req.body;
      const result = await purchaseInitCollection.insertOne(purchaseInit);
      res.json(result);
    });

    // POST Review API
    app.post('/reviews', async (req, res)=>{
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    // GET Review API
    app.get('/reviews', async (req, res) => {
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // POST API (Add new Product)
    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      // console.log("hit the post");
      res.json(result);
    });

    // UPDATE API (Update shipping info)
    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "Shipped"
        },
      };
      const result = await ordersCollection.updateOne(query, updateDoc);
      // console.log(result);
      res.json(result);
    })

    // DELETE API (Delete order from my orders)
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
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