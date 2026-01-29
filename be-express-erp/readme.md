# How to use

please make sure install the dependencies before running the project or else it won't work

```bash
npm install
```

## Setting up database

You need to make .env file in order to connect the project to the database. The .env must have:

```bash
PORT

DB_DATABASE
DB_USERNAME
DB_PASSWORD
DB_HOST
DB_PORT
DB_DBMS

SECRET_KEY
```

> plase make sure SECRET_KEY aren't a daily use words or else the hash will not be safe

Refer to [this](https://secretkeygen.vercel.app/) website for generating a secret key

## Running the apps

```bash
npm run dev
```

or

```bash
node server.js
```
