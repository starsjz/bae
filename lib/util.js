var crypto = require('crypto')
var assert = require('assert')

var sha1b64 = function(secret, str) {
  return crypto.createHmac('sha1', secret).update(str).digest('base64')
}

var sign = function (key, secret, method, bucket, object) {
  var hash = encodeURIComponent(sha1b64(secret, [
      'MBO'
    , 'Method=' + method
    , 'Bucket=' + bucket
    , 'Object=' + object
    , ''
  ].join('\n')))
  return ['MBO', key, hash].join(':')
}

var mix = function(a, b) {
  b = b || {}
  for (var i in b)
    a[i] = b[i]
  return a
}

exports.sign = sign
exports.mix = sign
