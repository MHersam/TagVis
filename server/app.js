const express = require('express');
const bodyParser = require("body-parser");
//var subdomain = require('express-subdomain');
var path = require('path');
const router = express.Router();
const app = express();
var cors = require('cors')
app.use(cors())
app.use(require('./routes'));
//router.use('/api', require('./api'));
//webApp.use(express.static(path.join(__dirname, './../dist/webapp')));
const port = 3000;
app.use(express.static(path.join(__dirname, './../webapp/tag-vis/dist/')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/static', express.static('static'));

app.use(router);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/dist/index.html'))
})

app.listen(port, () => {
  console.log(`TagVis listening at http://localhost:${port}`)
})

// install cronjob that updates semantic scholar paper citations and user recommendations periodically
const recommendationService = require('./services/recommendations.js')
var CronJob = require('cron').CronJob;
var job = new CronJob('0 0 1 * *', function() {
  recommendationService.fetchNewCitationsAndUpdateRecommendationss()
}, null, true);
job.start();