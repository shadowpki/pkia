const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const openpgp = require('openpgp');
const trs = require('trs-js');
const fs = require('fs');
const exec = require('child_process').exec;
const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-2'});

openpgp.config.show_version = false;
openpgp.config.show_comment = false;

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({type: '*/*'}));

var received = [];

app.post('/sns', (req, res) => {
  res.sendStatus(200);
  if(req.body.Type === "SubscriptionConfirmation") {
    axios.get(req.body.SubscribeURL);
  } else if (req.body.Type === "Notification") {
    var message = req.body.Message;
    if (message === "start") {
      PKIReconstitution();
    } else {
      message = JSON.parse(message);
      message.Records.forEach((record) => {
        handleS3Record(record);
      });
    }
    //   broadcast({
    //     message: 'hello from instance ' + instance_id,
    //     instance_id: instance_id
    //   });
    // } else if (message === "stage2") {
    //   writeToS3(instance_id + '.txt', received);
    // }
  }
});

app.get('/hello', (req, res) => {
  res.send("instance id: " + instance_id);
});

var PKI_O_IN = [];
var PKI_O_IN_KEY;
var PKI_O_IN_PUB;
var LOGS = [];
var INSTANCE_ID;
var PUBLIC_IPV4;
var N;
var PKS = [];

function log(event) {
  LOGS.push({
    time: Date.now(),
    event: event
  })
}

var server = app.listen(80, async () => {
  INSTANCE_ID = (await axios.get('http://169.254.169.254/latest/meta-data/ami-launch-index')).data;
  PUBLIC_IPV4 = (await axios.get('http://169.254.169.254/latest/meta-data/public-ipv4')).data;
  let pki_file = fs.readFileSync('./PPKI(O)/pki.json');
  let PKI_O_IN = JSON.parse(pki_file);
  let key_file = fs.readFileSync('./PPKI(O)/' + INSTANCE_ID + '.key');
  let PKI_O_IN_KEY = await openpgp.readKey({ armoredKey: key_file });
  PKI_O_IN_PUB = PKI_O_IN_KEY.toPublic().armor();
  let N = PKI_O_IN.length;
  PKI_O_IN.forEach((partition) => {
    PKS[partition.pks[0]] = partition.ids[0];
  });
  await new AWS.SNS({apiVersion: '2010-03-31'}).subscribe({
      Protocol: 'http',
      TopicArn: 'arn:aws:sns:us-east-2:295064964666:covert-channel',
      Endpoint: 'http://' + PUBLIC_IPV4 + '/sns'
  }).promise();
});

async function PKIReconstitution() {
  log("start");

  // 1. Each process generates a key pair
  const { privateKeyArmored, publicKeyArmored } = await openpgp.generateKey({});
  log("step1");

  // 2. Each process generates a signature
  const cleartextMessage = await openpgp.CleartextMessage.fromText(publicKeyArmored);
  const detachedSignature = await openpgp.sign({
      message: cleartextMessage,
      privateKeys: PKI_O_IN_KEY,
      detached: true
  });
  log("step2");

  // 3. Each process invokes the reliable broadcast protocol on message
  await broadcast({
    pkin: PKI_O_IN_PUB,
    pkout: publicKeyArmored,
    sig: detachedSignature
  });
  log("step3");
}

async function writeToS3(name, data) {
  return await new AWS.S3({apiVersion: '2006-03-01'}).putObject({
    Body: JSON.stringify(data),
    Bucket: "pkia-results",
    Key: name
  }).promise();
}

async function broadcast(data) {
  return await new AWS.Firehose({apiVersion: '2015-08-04'}).putRecord({
    Record: {Data: JSON.stringify(data) + "\n"},
    DeliveryStreamName: 'covert-channel'
  }).promise();
}

async function handleCommand(request) {
  try {
    let cmd = JSON.parse(request);
    received.push(cmd.message);
  } catch (error) {}
}

async function handleS3Record(record) {
  if (record.s3.bucket.name === "pkia-covert-channel" && record.eventName === "ObjectCreated:Put") {
    let data = await fetchS3Record(record.s3.object.key);
    let commands = data.split(/\r?\n/);
    commands.forEach(handleCommand);
  }
}

async function fetchS3Record(name) {
  return (await new AWS.S3({apiVersion: '2006-03-01'}).getObject({
    Bucket: "pkia-covert-channel",
    Key: name
  }).promise()).Body.toString();
}
