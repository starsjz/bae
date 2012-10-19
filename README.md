# Baidu App Engine

## Install

    npm install bae

## Client:

    var client = require('bae').createClient({
        app_key: 'Your Key'
      , app_secret: 'Your Secret'
    })

## Storage

    var storage = client.storage

### Bucket

    storage('bucket').put(function(err, res, body) {
      if (!err) console.log('bucket created.')
    })
    storage('bucket').get(function(err, res, body) {
      if (!err) console.log(JSON.parse(body))
    })
    storage('bucket').del(function(err, res, body) {
      if (!err) console.log('bucket deleted.')
    })

### Object (with pipe)

    fs.ReadStream(__filename).pipe(storage('bucket', 'bae.js').put({
        headers: {
            'Content-Type': 'application/x-javascript'
          , 'Content-Length': demo.length
        }
    }, function(err, res, body) {
      if (!err)
        console.log('done')
    }))

    storage('bucket', 'object').get(function(err, res, body) {
      if (!err) console.log(JSON.parse(body))
    })

    storage('bucket', 'object').del(function(err, res, body) {
      if (!err) console.log('bucket/object deleted.')
    })

    storage('bucket', 'object').head(function(err, res, body) {
      if (!err) console.log(JSON.parse(body))
    })
