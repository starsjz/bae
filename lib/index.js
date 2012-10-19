var assert = require('assert')
var storage = require('./storage')

function Client(opts) {
  assert(typeof opts === 'object', 'Options for baeClient is required.')
  assert('app_key' in opts, 'app_key in options for baeClient is required.')
  assert('app_secret' in opts, 'app_secret in options for baeClient is required.')

  this.options = {
    host: 'bcs.duapp.com'
  }
  for (var i in opts) {
    this.options[i] = opts[i]
  }

  var opts = this.options
  this.storage = function(bucket, object) {
    return storage(opts, bucket, object)
  };
}

exports.createClient = function(opts) {
  return new Client(opts)
}
