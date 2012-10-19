var assert = require('assert')
var fs = require('fs')
var md5 = function(str) {
  return require('crypto').createHash('md5').update(str).digest('hex')
}

var util, storage, timeout = 30000;
var key = process.env.BAIDU_ACCESS_KEY
var secret = process.env.BAIDU_SECRET_KEY
var util = require('../lib/util')

describe('Storage', function() {
  var bkt = 'another'
  var storage = require('../lib/index').createClient({
      app_key: key
    , app_secret: secret
  }).storage
  describe('Signature', function() {
    // verify them from http://developer.baidu.com/bae/bcs/key/sign/
    it('should generate a signature from giving method, bucket and object', function() {
      assert.equal(util.sign(key, secret, 'PUT', bkt, '/'), 'MBO:A2e5998eef27dfa44e7f3687b8273a8b:cb2836%2BtlgXn9EhUYfB%2FseY4dPk%3D')
      assert.equal(util.sign(key, secret, 'GET', bkt, '/'), 'MBO:A2e5998eef27dfa44e7f3687b8273a8b:X%2Brr4%2F1ORVCPMGYNitO20PWAuYQ%3D')
    })
  })
  describe('Verify arguments', function() {
    it('should fail when missing arguments', function() {
      [[], [''], ['', '/']].forEach(function(arg) {
        assert.throws(function() {
          storage.apply(null, arg)
        })
      })
    })
    it('should fail when object is not start with /', function() {
      assert.throws(function() {
        storage('', 'n')
      })
    })
    it('should not throw error with right arguments', function() {
      assert.doesNotThrow(function() {
        storage(bkt, '/')
      })
      assert.doesNotThrow(function() {
        storage(bkt, '/any')
      })
    })
  })
  describe('Generate URL', function() {
    it('should base on methods', function() {
      var args = {
          'GET': 'http://bcs.duapp.com/another?sign=MBO:A2e5998eef27dfa44e7f3687b8273a8b:X%2Brr4%2F1ORVCPMGYNitO20PWAuYQ%3D'
        , 'PUT': 'http://bcs.duapp.com/another?sign=MBO:A2e5998eef27dfa44e7f3687b8273a8b:cb2836%2BtlgXn9EhUYfB%2FseY4dPk%3D'
        , 'POST': 'http://bcs.duapp.com/another?sign=MBO:A2e5998eef27dfa44e7f3687b8273a8b:8hxqsLNWrH3b99gIt%2BV9gry%2Fu0o%3D'
        , 'DELETE': 'http://bcs.duapp.com/another?sign=MBO:A2e5998eef27dfa44e7f3687b8273a8b:RerBxcqddgKlgrbs7d3xexaYXlE%3D'
        , 'HEAD': 'http://bcs.duapp.com/another?sign=MBO:A2e5998eef27dfa44e7f3687b8273a8b:gibLzAnT2b4aR0Zr9T%2FG0Olwt6o%3D'
      }
      for (var i in args) {
        var m = i
        if (m === 'DELETE') m = 'DEL'
        assert.equal(storage(bkt, '/')[m.toLowerCase() + 'Url'], args[i])
      }
    })
  })
  describe.skip('perform a bucket request', function() {
    var bkt = 'newBkt'
    describe('PUT', function() {
      after(function(done) {
        storage(bkt).del(function(err, res, body) {
          done()
        })
      })
      it('should create a bucket', function(done) {
        storage(bkt).put(function(err, res, body) {
          console.log(res.headers)
          console.log(body)
          assert.equal(res.statusCode, 200)
          done()
        })
      })
    })
    describe('DELETE', function() {
      var bkt = 'newBkt'
      before(function(done) {
        storage(bkt).put(function(err, res, body) {
          console.log(res.headers)
          console.log(body)
          done()
        })
      })
      it('should delete a bucket', function(done) {
        storage(bkt).del(function(err, res, body) {
          assert.equal(res.statusCode, 200)
          done()
        })
      })
    })
    describe('GET', function() {
      var bkt = 'newBkt'
      it('should get the bucket list', function(done) {
        console.log(storage(bkt).get(function(err, res, body) {
          assert(!err)
          assert.equal(res.statusCode, 200)
          assert.equal(res.headers['content-type'], 'application/json')
          console.log(JSON.parse(body))
          done()
        }))
      })
    })
  })
  describe('perform a object request', function() {
    var demo = fs.readFileSync(__filename)
    var hash = md5(demo)

    var origin = '/bae' + +new Date + '.js'
    describe('PUT', function() {
      var obj = origin + '.put'
      after(function(done) {
        storage(bkt, obj).del(function(err, res, body) {
          done()
        })
      })
      it('should upload an object.', function(done) {
        fs.ReadStream(__filename).pipe(storage(bkt, obj).put({
            headers: {
                'Content-Type': 'application/x-javascript'
              , 'Content-Length': demo.length
            }
        }, function(err, res, body) {
          if (err) console.error(err)
          assert(!err)
          assert.equal(res.headers['content-md5'], hash)
          done()
        }))
      })
    })

    describe('GET', function() {
      var obj = origin + '.get'
      before(function(done) {
        fs.ReadStream(__filename).pipe(storage(bkt, obj).put({
            headers: {
                'Content-Type': 'application/x-javascript'
              , 'Content-Length': demo.length
            }
        }, function(err, res, body) {
          done()
        }))
      })
      after(function(done) {
        storage(bkt, obj).del(function(err, res, body) {
          done()
        })
      })
      it('should fetch an object.', function(done) {
        storage(bkt, obj).get(function(err, res, body) {
          if (err) console.error(err)
          assert(!err)
          assert.equal(res.headers.etag, hash)
          done()
        })
      })
    })

    describe('DELETE', function() {
      var obj = origin + '.delete'
      before(function(done) {
        fs.ReadStream(__filename).pipe(storage(bkt, obj).put({
            headers: {
                'Content-Type': 'application/x-javascript'
              , 'Content-Length': demo.length
            }
        }, function(err, res, body) {
          done()
        }))
      })
      it('should delete an object.', function(done) {
        storage(bkt, obj).del(function(err, res, body) {
          if (err) console.error(err)
          assert(!err)
          storage(bkt, obj).get(function(err, res, body) {
            if (err) console.error(err)
            assert(!err)
            assert.equal(res.statusCode, 404)
            done()
          })
        })
      })
    })

    describe('HEAD', function() {
      var obj = origin + '.head'
      before(function(done) {
        fs.ReadStream(__filename).pipe(storage(bkt, obj).put({
            headers: {
                'Content-Type': 'application/x-javascript'
              , 'Content-Length': demo.length
            }
        }, function(err, res, body) {
          done()
        }))
      })
      after(function(done) {
        storage(bkt, obj).del(function(err, res, body) {
          done()
        })
      })
      it('should get meta of an object.', function(done) {
        storage(bkt, obj).head(function(err, res, body) {
          if (err) console.error(err)
          assert(!err)
          assert.equal(res.headers.etag, hash)
          done()
        })
      })
    })

    describe.skip('COPY', function() {
      var obj = origin + '.copy'
      var copy = obj + '.copy'
      before(function(done) {
        fs.ReadStream(__filename).pipe(storage(bkt, obj).put({
            headers: {
                'Content-Type': 'application/x-javascript'
              , 'Content-Length': demo.length
            }
        }, function(err, res, body) {
          done()
        }))
      })
      after(function(done) {
        storage(bkt, obj).del(function(err, res, body) {
          storage(bkt, copy).del(function(err, res, body) {
            done()
          })
        })
      })
      it('should copy an object.', function(done) {
        storage(bkt, copy).copy(bkt, obj, function(err, res, body) {
          if (err) console.error(err)
          assert(!err)
          assert.equal(res.headers.etag, hash)
          done()
        })
      })
    })
  })
})
