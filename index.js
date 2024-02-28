const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;

const uri = `mongodb+srv://${user}:${pass}@cluster0.hdpgq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("camzone");
    const usersCollection = database.collection("users");
    const productsCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviews");
    const comingSoonCollection = database.collection("coming-soon");

    //POST users API
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log("Hit the post API", user);
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    //GET users API
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });

    //GET single user API
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //GET products API
    app.get("/explore", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    //GET coming soon API
    app.get("/coming-soon", async (req, res) => {
      const cursor = comingSoonCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    //GET products API for home
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.limit(6).toArray();
      res.send(products);
    });

    //POST order API
    app.post("/orders", async (req, res) => {
      const order = req.body;
      console.log("Hit the post API", order);

      const result = await ordersCollection.insertOne(order);
      console.log(result);

      res.json(result);
    });

    //GET orders API
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    //DELETE order API
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    //POST review API
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      console.log("Hit the post API", review);

      const result = await reviewsCollection.insertOne(review);
      console.log(result);

      res.json(result);
    });

    //POST product API
    app.post("/products", async (req, res) => {
      const product = req.body;
      console.log("Hit the post API", product);
      const result = await productsCollection.insertOne(product);
      res.json(result);
    });

    //GET reviews API
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //Make admin API
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //UPDATE order API
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updatedOrder = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          status: "Confirmed",
          user_name: updatedOrder.user_name,
          user_email: updatedOrder.user_email,
          user_phone: updatedOrder.user_phone,
          user_address: updatedOrder.user_address,
          order_id: updatedOrder.order_id,
          order_name: updatedOrder.order_name,
          order_category: updatedOrder.order_category,
          order_description: updatedOrder.order_description,
          order_img: updatedOrder.order_img,
          order_price: updatedOrder.order_price,
        },
      };
      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    //DELETE product API
    app.delete("/explore/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running camzone server...");
});

app.listen(port, () => {
  console.log("Running camzone server on port", port);
});
