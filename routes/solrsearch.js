/*

The MIT License (MIT)

Copyright (c) Thu Aug 18 2016 Zhong Wu zhong.wu@autodesk.com

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORTOR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

'use strict'; // http://www.w3schools.com/js/js_strict.asp

var express = require('express')
var solr = require('solr-client')
var router = express.Router()

var client = null
if (client === null) {
  client = solr.createClient()
  // client.basicAuth('admin', 'passtest')
}

client.ping(function (err, obj) {
  if (err) {
    console.log(err)
  }else {
    console.log(obj)
  }
})

// /////////////////////////////////////////////////
// create an index for the element
router.post('/index', function (req, res) {
  if (client === null)
    res.status(500).end('solr search engine is not ready.')

  // var payload = req.body
  // console.log(req.body)

  // var dbid = payload.dbid
  // var fragid = payload.fragid
  // var x = payload.x
  // var y = payload.y
  // var z = payload.z

  // // Switch on "auto commit", by default `client.autoCommit = false`
  // client.autoCommit = true

  // var docs = []
  // for (var i = 0; i <= 10; i++) {
  //   var doc = {
  //     id: 12345 + i,
  //     title_t: 'Title ' + i,
  //     description_t: 'Text' + i + 'Alice'
  //   }
  //   docs.push(doc)
  // }

  // // Add documents
  // client.add(docs, function (err, obj) {
  //   if (err) {
  //     console.log(err)
  //   }else {
  //     console.log(obj)
  //   }
  // })
})

// //////////////////////////////////////////////////
// find all the elements within the specifid area
router.get('/elements', function (req, res) {

  
})

module.exports = router
