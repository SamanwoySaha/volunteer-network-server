const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
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
  const volunteersCollection = client.db("volunteerNetwork").collection("volunteers");

  app.get('/volunteerList', (req, res) => {
    volunteersCollection.find({})
      .toArray((err, documents) => {
        if (err) {
          res.status(404).send(err.message);
        }
        res.send(documents);
      })
  })

  app.get('/volunteerDetail', (req, res) => {
    volunteersCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        if (err) {
          res.status(404).send(err.message);
        }
        res.send(documents);
      })
  })

  app.get('/events', (req, res) => {
    eventsCollection.find({})
      .toArray((err, documents) => {
        if (err) {
          res.status(404).send(err.message);
        }
        res.send(documents);
      })
  })

  app.get('/eventById/:id', (req, res) => {
    eventsCollection.find({_id : ObjectId(req.params.id)})
      .toArray((err, documents) => {
        if (err) {
          res.status(404).send(err.message);
        }
        res.send(documents);
      })
  })

  app.get('/specificEvents', (req, res) => {
    eventsCollection.find({ name: new RegExp('.*' + req.query.search + '.*', 'i') })
      .toArray((err, documents) => {
        if (err) {
          res.status(404).send(err.message);
        }
        res.send(documents);
      })
  })

  app.post('/addVolunteer', (req, res) => {
    volunteersCollection.find({
      email: req.body.email,
      eventDate: req.body.eventDate,
      eventName: req.body.eventName
    }).toArray((err, documents) => {
      if (documents.length > 1) {
        res.status(404).send('already added');
      }
      else {
        volunteersCollection.insertOne(req.body)
          .then(result => {
            if(result.insertedCount > 0){
              res.send(result.insertedCount > 0)
            }
            else{
              res.status(404).send('Error 404');
            }
          })
      }
    })
  })

  app.post('/addEvent', (req, res) => {
    eventsCollection.insertOne(req.body)
      .then(result => {
        if(result.insertedCount > 0){
          res.send(result.insertedCount > 0)
        }
        else{
          res.status(404).send('Error 404');
        }
      })
  })

  app.delete('/removeEvent', (req, res) => {
    volunteersCollection.deleteOne({ _id: ObjectId(req.body.id) })
      .then(result => {
        if (result.deletedCount > 0) {
          volunteersCollection.find({ email: req.body.email })
            .toArray((err, documents) => {
              res.send(documents);
            })
        }
        else{
          res.status(404).send('Error 404');
        }
      })
  })

  app.delete('/removeVolunteer', (req, res) => {
    volunteersCollection.deleteOne({ _id: ObjectId(req.body.id) })
      .then(result => {
        if (result.deletedCount > 0) {
          volunteersCollection.find({})
            .toArray((err, documents) => {
              res.send(documents);
            })
        }
        else {
          res.status(404).send('error 404')
        }
      })
  })
});

app.listen(port);