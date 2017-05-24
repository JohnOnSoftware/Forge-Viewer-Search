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
var elasticsearch = require('elasticsearch')
var router = express.Router()

/// elastic search is used to index all the elements position information,
/// the element data is mapped as following structure
/// PUT /elements
/// {
///   "mappings": {
///     "element": {
///       "properties": {
///         "dbid": {
///           "type": "text"
///         },
///         "fragid": {
///           "type": "text"
///         },
///         "z":{
///           "type": "double"
///         },
///         "location": {
///           "type": "geo_point"
///         }
///       }
///     }
///   }
/// }


var client = null
if (client === null) {
  client = new elasticsearch.Client({
    host: 'http://elastic:changeme@localhost:9200',
    //log: 'trace'
  })
}


// /////////////////////////////////////////////////
// create an index for the element
router.post('/index', function (req, res) {
  if (client === null)
    res.status(500).end('search engine is not ready.')

  var payload = req.body
  //console.log(req.body)

  var dbid = payload.dbid
  var fragid = payload.fragid
  var x = payload.x
  var y = payload.y
  var z = payload.z

  client.index({
    index: 'elements',
    type: 'element',
    id: dbid + fragid,
    body: {
      'dbid': dbid,
      'fragid': fragid,
      'locationX': x,
      'locationY': y,
      'locationZ': z
    }
  }).then(function (body) {
    //console.log(body)
    res.end('successfully create index')
  }).catch(function (err) {
    //console.log(err)
    res.status(500).end(err.message)
  })
})


// //////////////////////////////////////////////////
// find all the elements within the specifid area
router.get('/elements', function (req, res) {
  var positionX = parseFloat(req.query.x);
  var positionY = parseFloat(req.query.y);
  var positionZ = parseFloat(req.query.z);
  var radius = (req.query.radius == undefined ? 10 : parseFloat(req.query.radius))/100;

  if (client === null)
    res.status(500).end('search engine is not ready.')

  var query = {
    'query': {
      'bool': {
        'must': [
          {
            'range': {
              'locationX': {'gte': (positionX - Math.abs(positionX * radius)), 'lte': (positionX + Math.abs(positionX * radius))}
            }
          },
          {
            'range': {
              'locationY': {'gte': (positionY - Math.abs(positionY * radius)), 'lte': (positionY + Math.abs(positionY * radius))}
            }
          },
          {
            'range': {
              'locationZ': {'gte': (positionZ - Math.abs(positionZ * radius)), 'lte': (positionZ + Math.abs(positionZ * radius))}
            }
          }
        ]
      }
    }
  };

  client.search({
    index: 'elements',
    type: 'element',
    body:query
  }).then(function (resp) {
    var hits = resp.hits.hits
    console.log('there are: ' + hits.length.toString())

    res.end(JSON.stringify(hits))
  }).catch(function (err) {
    console.trace(err.message)
    res.status(500).end(err.message)
  })
})

module.exports = router
