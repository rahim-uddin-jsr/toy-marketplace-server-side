const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ztr719a.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const kiddoZone1 = client.db("kiddoZone1");

    const toysCollection = kiddoZone1.collection("toysCollection");
    app.get("/toys", async (req, res) => {
      const searchText = req.query.search;
      if (searchText) {
        const query = {
          productName: {
            $regex: new RegExp(searchText, "i"), // 'i' indicates case-insensitive search
          },
        };

        const result = await toysCollection.find(query).toArray();
        console.log(result);
        res.send(result);
        return;
      }
      const result = await toysCollection.find().toArray();
      res.send(result);
    });

    app.get("/toys/:email", async (req, res) => {
      const email = req.params.email;
      const result = await toysCollection.find({ email: email }).toArray();
      res.send(result);
    });

    app.get("/toys/:category", async (req, res) => {
      const category = req.params.category;
      const result = await toysCollection
        .find({ subCategory: category })
        .toArray();
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const result = await toysCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const updatedDoc = req.body;
      const result = await toysCollection.insertOne(updatedDoc);
      res.send(result);
    });
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const result = await toysCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Kiddo Zone server is running");
});

app.listen(port, () => {
  console.log("Kiddo Zone server run on port=", port);
});
