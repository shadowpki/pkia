const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

module.exports = (peers, port) => {
  return new Promise((resolve, reject) => {
    const app = express();

    app.use(bodyParser.json());

    app.post('*', (req, res) => {
      console.debug('CHANNEL - received message');
      peers.forEach((peer) => {
        axios.post(peer.endpoint + req.url, req.body);
      });
      res.sendStatus(200);
    });

    var server = app.listen(port, () => {
      console.debug(`CHANNEL - listening at http://localhost:${port}`);
      resolve(() => {
        console.debug(`CHANNEL - closed`);
        server.close();
      });
    });
  });
}
