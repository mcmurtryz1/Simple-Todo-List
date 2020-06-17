const mongodb = require('mongodb').MongoClient;
const express = require('express');
const cors = require('cors');
const os = require('os');
const app = express();

app.use(cors());
app.use(express.json()); 
const url = 'mongodb://localhost:27017';
const dbName = 'todoList';
let dbCon;
 
mongodb.connect(url, {useUnifiedTopology: true}, function(err, client) {
    if (err) {
        console.log(err);
    } else {
        console.log("Connected successfully to server");
        dbCon = client.db(dbName);

        //dbCon.collection('todo').insert({name: "test", complete: false});
        dbCon.collection('todo').find({}).toArray(function(err, res) {
            console.log(res);
        });
    }
});

app.get("/todoList/getList", (req, res) => {
    dbCon.collection('todo').find({}).toArray(function(err, objs) {
        if (err) {
            res.status(500).send();
        } else {
            res.status(200).json(objs);
        }
    });
});

app.put("/todoList/insert", (req, res) => {
    dbCon.collection('todo').find({name: req.body.name}).toArray((err, objs) => {
        if (err) {
            res.status(500).send();
        } else if (objs.length != 0) {
            res.status(400).send();
        } else {
            dbCon.collection('todo').insertOne({name: req.body.name, complete: false}, (err, stat) => {
                if (err) {
                    res.status(500).send();
                } else {
                    res.status(200).send();
                }
            });
        }
    });
});

app.put("/todoList/update", (req, res) => {
    dbCon.collection('todo').updateOne({name: req.body.name}, {$set: {complete: req.body.complete}}, (err, stat) => {
        if (err) {
            res.status(500).send();
        } else {
            res.status(200).send();
        }
    });
});

app.delete("/todoList/remove", (req, res) => {
    dbCon.collection('todo').deleteOne({name: req.body.name}, (err, stat) => {
        if (err) {
            res.status(500).send();
        } else {
            res.status(200).send();
        }
    });
});

app.listen(8888);