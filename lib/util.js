var crypto = require('crypto')
var assert = require('assert')

assert(process.env.BAIDU_ACCESS_KEY)
assert(process.env.BAIDU_SECRET_KEY)

var sha1b64 = function(str) {
  assert.ok(str)
  return crypto.createHmac('sha1', process.env.BAIDU_SECRET_KEY).update(str).digest('base64')
}

var sign = function (method, bucket, object) {
  var hash = encodeURIComponent(sha1b64([
      'MBO'
    , 'Method=' + method
    , 'Bucket=' + bucket
    , 'Object=' + object
    , ''
  ].join('\n')))
  return ['MBO', process.env.BAIDU_ACCESS_KEY, hash].join(':')
}

exports.sign = sign
