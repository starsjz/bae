var util = require('./util')
var assert = require('assert')
var request = require('request')

var generateUrl = function (opts, method, bucket, object) {
  var objectPath = ''
  if (object && object !== '/')
    objectPath = '/' + encodeURIComponent(object)
  if (!bucket)
    bucket = ''
  return 'http://' + opts.host + '/' + bucket +
    objectPath + '?sign=' + util.sign(opts.app_key, opts.app_secret, method, bucket, object)
}

var storageObject = function(opts, bucket, object) {
  assert(bucket)

  if (object) assert(/^\//.test(object))

  if (!(this instanceof arguments.callee))
    return new storageObject(opts, bucket, object)

  this.options = opts
  this.bucket = bucket
  this.object = object

  if (object)
    this.supportMethods = ['PUT', 'GET', 'POST', 'DELETE', 'HEAD']
  else
    this.supportMethods = ['PUT', 'GET', 'DELETE']

  this.supportMethods.forEach(function(method) {
    var m = ''
    if ('DELETE' === method) m = 'del'
    else m = method.toLowerCase()
    var opts = this.options
    this.__defineGetter__(m + 'Url', function() {
      return generateUrl(opts, method, this.bucket, this.object)
    })
    this[m] = function(opts, callback) {
      return request[m](this[m + 'Url'], opts, callback)
    }
  }, this)

  this.upload = function(type, size, callback) {
    assert(type)
    assert(size)
    assert(typeof type === 'string')
    assert(typeof size === 'number')

    return this.put({
      headers: {
          'Content-Type': type
        , 'Content-Length': size
      }
    }, callback)
  }

  this.copy = function(bucket, object, opts, callback) {
    assert(bucket)
    assert(object)
    assert(/^\//.test(object))

    var headers = {
        'x-bs-copy-source': 'bs://' + bucket + object
    }
    if (typeof opts === 'function') {
      callback = opts
      opts = undefined
    }
    if (!opts) {
      opts = {
        headers: headers
      }
    } else if (opts.headers) {
      util.mix(opts.headers, headers)
    }
    return this.put(opts, callback)
  }

  return this;
}

module.exports = storageObject
