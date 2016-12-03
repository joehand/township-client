var fs = require('fs')
var path = require('path')
var test = require('tape')

var TownshipClient = require('..')
var createServer = require('./server')

var server
var address
var client
var testConfig = path.join(__dirname, 'config.txt')
fs.writeFileSync(testConfig, '')

test('start test server', function (t) {
  createServer(function (err, serv, add) {
    if (err) throw err
    server = serv
    address = add

    client = TownshipClient({
      server: address,
      config: {
        filepath: testConfig
      }
    })

    t.end()
  })
})

test('register', function (t) {
  client.register({email: 'joe', password: 'verysecret'}, function (err) {
    t.error(err)
    t.pass('registers')
    t.end()
  })
})

test('login okay', function (t) {
  client.login({email: 'joe', password: 'verysecret'}, function (err) {
    t.error(err)
    t.pass('login okay')
    t.end()
  })
})

test('login wrong pw', function (t) {
  client.login({email: 'joe', password: 'notsecret'}, function (err) {
    t.ok(err, 'errors')
    t.end()
  })
})

test('login wrong email', function (t) {
  client.login({email: 'notjoe', password: 'verysecret'}, function (err) {
    t.ok(err, 'errors')
    t.end()
  })
})

test('change pw', function (t) {
  client.updatePassword({
    email: 'joe',
    password: 'verysecret',
    newPassword: 'password'
  }, function (err) {
    t.error(err)
    t.pass('okay')
    t.end()
  })
})

test('login with new password', function (t) {
  client.login({
    email: 'joe',
    password: 'password'
  }, function (err) {
    t.error(err)
    t.pass('okay')
    t.end()
  })
})

test.onFinish(function () {
  server.close(function () {
    fs.unlink(testConfig, function () {
      // good bye
    })
  })
})
