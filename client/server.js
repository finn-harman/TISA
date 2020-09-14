// BASE SETUP
// =============================================================================
// Connect to database
var mongoose = require('mongoose')
const uri = #enter connection url
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
const connection = mongoose.connection
var Identity = require('./src/utils/identity')

connection.once('open', function() {
  console.log("MongoDB database connection established succesfully")
})

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
const cors = require('cors');
const child_process = require('child_process');
const spawn = require('child_process').spawn;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

var port = process.env.PORT || 5000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.route('/')
    .get(function(req, res) {
      res.json({ message: 'hooray! welcome to our api!' });
});

// on routes that end in /zokrates
// ----------------------------------------------------
router.route('/zokrates')
    .post(function(req, res) {
        // res.json({ message: 'hooray! welcome to our api!' });
        var output

        console.log("Received a post request...");
        console.log("Generating zero-knowledge proof for requestor...");

        const child = spawn('docker', ['run', '-i', 'fi999/zokrates-isa', '/bin/bash']);
        child.stdin.write("cd ./examples/ISA-verifier\n")
        child.stdin.write("../../zokrates compute-witness -a 1 2\n")
        child.stdin.write("../../zokrates generate-proof\n")
        child.stdin.write("exit\n")
        child.stdin.end()

        child.stdout.on('data', (data) => {
          // console.log(`child stdout:\n${data}`)
          output = {data}
          // console.log("output: " + JSON.stringify(output))
        })

        child.stderr.on('data', (data) => {
        console.error(`child stderr:\n${data}`);
        });
        // console.log("Child spawned...");

        child.on('exit', function (code, signal) {
          console.log('child process exited with ' + `code ${code} and signal ${signal}`);
          console.log("The zero-knowledge proof has been succesfully generated.");
          console.log("Sending back the response.");
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({proofDetails: output}));
        });
    })

router.route('/regulator')
  .get(function(req, res) {
    Identity.find(function(err, identities) {
        if (err) {
            console.log(err);
        } else {
            res.json(identities);
        }
    });
  })

router.route('/regulator/:id')
    .get(function(req, res) {
      let id = req.params.id;
      Identity.findById(id, function(err, identity) {
          res.json(identity);
      });
});

router.route('/regulator/update/:id')
    .post(function(req, res) {
      Identity.findById(req.params.id, function(err, identity) {
        if (!identity)
            res.status(404).send("data is not found");
        else
            identity.name = req.body.name;
            identity.postCode = req.body.postCode;
            identity.nationalInsurance = req.body.nationalInsurance;
            identity.email = req.body.email;
            identity.totalISA = req.body.totalISA;
            identity.blacklisted = req.body.blacklisted;

            identity.save().then(identity => {
                res.json('Identity updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

router.route('/regulator/addAddress')
    .post(function(req, res) {
      Identity.find({hash: req.body.hash}, function(err, identity) {
        if (!identity)
            res.status(404).send("data is not found");
        else
            identity.address = req.body.address

            identity.save().then(identity => {
                res.json('Identity address updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

router.route('/regulator/delete/:id')
    .post(function(req, res) {
      let id = req.params.id
      Identity.findById(id, function(err, identity) {
        if (!identity)
            res.status(404).send("data is not found");
        else
          Identity.remove(identity).then(identity => {
                res.json('Identity Deleted!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

router.route('/regulator/add')
    .post(function(req, res) {
      let identity = new Identity(req.body);
      identity.save()
          .then(identity => {
              res.status(200).json({'identity': 'identity added successfully'});
          })
          .catch(err => {
              res.status(400).send('adding new identity failed');
          });
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port, function() {
  console.log('Magic happens on port ' + port);

});
