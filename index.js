import express from "express";
// const util = require("util");
import redis from "redis";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

let redisClient;
async function connectRedis() {
  redisClient = redis.createClient("redis://127.0.0.1:6379");
  await redisClient.connect();
  // redis library inherently works with callbacks and not promises
  // so the trick to use/return promise is to use promisify method of the built-in util module
  // no need for below for redis version starting from 4.0.0
  // redisClient.get = util.promisify(redisClient.get);
  // redisClient.set = util.promisify(redisClient.set);
}

connectRedis();

const app = express();
app.use(express.json());

app.get("/", async (req, res) => {
  const { key } = req.body;
  try {
    //return value of get is always going to be a number or a string
    const val = await redisClient.get(key);
    res.json(val);
  } catch (error) {
    console.error(error);
  }
});

app.post("/", async (req, res) => {
  const { key, value } = req.body;

  try {
    const val = await redisClient.set(key, value);
    res.json(val);
  } catch (error) {
    console.error(error);
  }
});

// directly fetching as data is already there in jsonplaceholder database
// so we dont need to create database and work with it
app.get("/post/:id", async (req, res) => {
  let { id } = req.params;
  id = parseInt(id);
  if (!id) return res.json("Post id not provided");
  if (typeof id !== "number")
    return res.json("Post id should be of type number");

  try {
    // "get" returns null if corresponsding value is not found!
    const post = await redisClient.get(`post-${id}`);

    //Note - JSON.parse can tie up the current thread because it is a synchronous method.
    //So if you are planning to parse big JSON objects use a streaming json parser.
    if (post) {
      //return value of get is always going to be a number or a string
      return res.json(JSON.parse(post));
    }

    try {
      const resp = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${id}`
      );
      const postData = await resp.json();
      const setPost = redisClient.set(
        `post-${id}`,
        JSON.stringify(postData),
        "EX",
        10
      ); // EX === expiration 10 === ten seconds
      res.json(setPost);
    } catch (error) {
      console.error({ "fetch error": error });
    }
  } catch (error) {
    console.error({ error });
  }
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => console.log("Server is running on PORT " + PORT));
