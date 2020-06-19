const mongodb = require('mongodb').MongoClient;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const secret = "ThisIsAVerySecretSecret";

exports.signup = (db, req, res) => {
    db.collection('user').findOne({username: req.body.username}, (findErr, user) => {
        if (findErr) return res.status(500).send();
        if (user) return res.status(400).send();
        bcrypt.hash(req.body.password, 10, (err, password) => {
            db.collection('user').insertOne({username: req.body.username, password: password}, (err, stat) => {
                if (err) return res.status(500).send();
                res.status(200).send();
            });
        });
    });
};

exports.signin = (db, req, res) => {
    db.collection('user').findOne({username: req.body.username}, (err, user) => {
        if (err) return res.status(500).send({message: "Try again later"});
        if (!user) return res.status(404).send({message: "User not found"});
        
        let valid = bcrypt.compareSync(req.body.password, user.password);

        if (!valid) return res.status(401).send({message: "Incorrect password"});

        let jwtToken = jwt.sign({userId: user._id}, secret, {
            expiresIn: 3600
        });

        res.status(200).send({
            userId: user._id,
            username: user.username,
            token: jwtToken
        });
    });
};

exports.verifyJwtToken = (req, res, cb) => {
    let jwtToken = req.headers['x-access-token'];

    if (!jwtToken) return res.status(400).send();

    jwt.verify(jwtToken, secret, (err, stat) => {
        if (err) return res.status(401).send();
        req.userId = stat.userId;
        cb();
    });
}