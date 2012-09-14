var fs = require('fs')
fs.readdir(__dirname, function(err, files) {
  files = files.filter(function(file) {
    return /^(?!test\.js$).+\.js$/.test(file)
  })
  require('./' + files)
})
