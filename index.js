const express = require('express');
const { MongoClient } = require('mongodb');
const cors =require('cors');
const app = express();
require('dotenv').config();

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

      // GET Products API
      app.get('/products', async(req, res)=>{
        const cursor = productCollection.find({});
        const products = await cursor.toArray();
        res.send(products);
      })
      // POST API
      app.post('/products', async(req, res)=>{
        const product = req.body;
        const result = await productCollection.insertOne(product);
        // console.log("hit the post");
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
  res.send('Hello World!');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})