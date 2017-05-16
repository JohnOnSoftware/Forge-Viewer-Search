'use strict'; // http://www.w3schools.com/js/js_strict.asp

var express = require('express')
var elasticsearch = require('elasticsearch')
var router = express.Router()

var client = null
if (client === null) {
  client = new elasticsearch.Client({
    // host: 'localhost:9200',
    host: 'http://elastic:changeme@localhost:9200',
    log: 'trace'
  })
}

router.get('/index/:name', function (req, res) {
  var name = req.params.name

  if (client === null)
    res.status(500).end('search engine is not ready.')

  try {
    client.search({
      index: 'myindex',
      type: 'mytype',
    //   body: {
    //     query: {
    //       match: {
    //         body: 'elasticsearch'
    //       }
    //     }
    //   }
    }).then(function (resp) {
      var hits = resp.hits.hits
      res.end('there are: '+ hits.length.toString())
    }, function (err) {
      console.trace(err.message)
      res.status(500).end(err.message)
    })
  } catch(err) {
    res.status(500).end(err.message)
  }
})

module.exports = router
