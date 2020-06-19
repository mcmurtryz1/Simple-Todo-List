const mongodb = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const auth = require('./auth.js');
const app = express();

app.use(cors());
app.use(express.json()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const url = 'mongodb://localhost:27017';

const dbName = 'todoList';
let dbCon;
 
mongodb.connect(url, {useUnifiedTopology: true}, function(err, client) {
    if (err) {
        console.log(err);
    } else {
        dbCon = client.db(dbName);
    }
});

app.get("/todoList/getList", (req, res) => {
    auth.verifyJwtToken(req, res, () => {
        dbCon.collection('todo').find({userId: req.userId}).toArray(function(err, objs) {
            if (err) {
                res.status(500).send();
            } else {
                res.status(200).json(objs);
            }
        });
    });
});

app.put("/todoList/insert", (req, res) => {
    auth.verifyJwtToken(req, res, () => {
        dbCon.collection('todo').find({name: req.body.name, userId: req.userId}).toArray((err, objs) => {
            if (err) {
                res.status(500).send();
            } else if (objs.length != 0) {
                res.status(400).send();
            } else {
                dbCon.collection('todo').insertOne({name: req.body.name, complete: false, userId: req.userId}, (err, stat) => {
                    if (err) {
                        res.status(500).send();
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });
});

app.put("/todoList/update", (req, res) => {
    auth.verifyJwtToken(req, res, () => {
        dbCon.collection('todo').updateOne({name: req.body.name, userId: req.userId}, {$set: {complete: req.body.complete, priority: req.body.priority}}, (err, stat) => {
            if (err) {
                res.status(500).send();
            } else {
                res.status(200).send();
            }
        });
    });
});

app.delete("/todoList/remove", (req, res) => {
    auth.verifyJwtToken(req, res, () => {
        dbCon.collection('todo').deleteOne({name: req.body.name, userId: req.userId}, (err, stat) => {
            if (err) {
                res.status(500).send();
            } else {
                res.status(200).send();
            }
        });
    });
});

app.post('/user/signup', (req, res) => {
    auth.signup(dbCon, req, res);
});

app.post('/user/signin', (req, res) => {
    auth.signin(dbCon, req, res);
});

app.listen(8888);