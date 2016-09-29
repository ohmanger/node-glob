require("./global-leakage.js")
var dir = __dirname + '/fixtures'

var fs = require('fs')
var expect = [
  'a/abcdef',
  'a/abcdef/g',
  'a/abcdef/g/h',
  'a/abcfed',
  'a/abcfed/g',
  'a/abcfed/g/h'
]

fs.lstat = function (lstat) { return function (path, cb) {
  // synthetically generate a non-ENOENT error
  if (path.match(/\babcdef\b/)) {
    var er = new Error('synthetic')
    er.code = 'EPERM'
    return process.nextTick(cb.bind(null, er))
  }

  return lstat.call(fs, path, cb)
}}(fs.lstat)

fs.lstatSync = function (lstat) { return function (path, cb) {
  // synthetically generate a non-ENOENT error
  if (path.match(/\babcdef\b/)) {
    var er = new Error('synthetic')
    er.code = 'EPERM'
    throw er
  }

  return lstat.call(fs, path, cb)
}}(fs.lstatSync)

var glob = require('../')
var t = require('tap')

t.test('stat errors other than ENOENT are ok', function (t) {
  t.plan(2)
  t.test('async', function (t) {
    glob('a/*abc*/**', { stat: true, cwd: dir }, function (er, matches) {
      if (er)
        throw er
      t.same(matches, expect)
      t.end()
    })
  })

  t.test('sync', function (t) {
    var matches = glob.sync('a/*abc*/**', { stat: true, cwd: dir })
    t.same(matches, expect)
    t.end()
  })
})
