const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dpnco.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

client.connect(err => {
    const eventsCollection = client.db("volunteerNetwork").collection("events");
    console.log('Database connection established...');

    app.get('/events', (req, res) => {
        eventsCollection.find({})
        .toArray((err, documents) => {
            if(err){
                res.send(err.message);
            }
            res.send(documents);
        })
    })
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Listening to port ${port}...`);
})