# Redis with Node JS

## Install below dependencies

```
> npm i express redis node-fetch
```

## Optional dependencies

```
> npm i dotenv nodemon
```

## Spin up a redis Docker container

(you should have Docker Desktop installed in your computer)

```
> docker run -p 6379:6379 --name myRedis redis
```

## Spin up the express server

```
> nodemon index.js
```

## Make HTTP request(s) to test

### Basic-

[POST request](http://localhost:5000)

```

{
  //body
  "key": "name",
  "value": "John Doe"
}
```

[GET request](http://localhost:5000)

```
{
  //body
  "key": "name",
}
```

### Immitating Database-

[GET request](http://localhost:5000/post/1)

Change post id in the URL to see the difference in the time required to fetch the data.
