var assert = require('assert')
var request = require('nets')
var Config = require('./lib/config')

module.exports = TownshipClient

function TownshipClient (opts) {
  if (!(this instanceof TownshipClient)) return new TownshipClient(opts)

  var self = this
  self.config = Config(opts.config)
  self.config.init()
  if (opts.server) self.server = opts.server.indexOf('http') > -1 ? opts.server : 'https://' + opts.server
  else if (config.currentLogin) self.server = config.currentLogin.server

  return self
}

TownshipClient.prototype.register = function (opts, cb) {
  opts = opts || {}
  if (!opts.password) return cb(new Error('password is required to register'))
  if (!opts.email) return cb(new Error('email is required to register'))

  var self = this
  var server = self._getServer(opts)

  return self._request({
    method: 'POST',
    url: server + '/auth',
    json: {
      email: opts.email,
      password: opts.password
    }
  }, function (err, res, body) {
    if (err) return cb(err.message)
    body.server = server
    body.email = opts.email
    self.config.setLogin(body)
    self.server = server
    cb()
  })
}

TownshipClient.prototype.login = function (opts, cb) {
  opts = opts || {}
  if (!opts.email) return cb(new Error('email is required to login'))

  var self = this
  var server = self._getServer(opts)

  return self._request({
    method: 'POST',
    url: server + '/auth/verify',
    json: {
      email: opts.email,
      password: opts.password
    }
  }, function (err, res, body) {
    if (err) return cb(err.message)
    body.server = server
    body.email = opts.email
    self.config.setLogin(body)
    self.server = server
    cb()
  })
}

TownshipClient.prototype.password = function (opts, cb) {
  opts = opts || {}
  if (!opts.email) return cb(new Error('email is required to change password'))
  if (!opts.token) return cb(new Error('token is required to change password'))
  if (!opts.currentPassword) return cb(new Error('new password is required to change password'))
  if (!opts.newPassword) return cb(new Error('old password is required to change password'))

  var self = this
  var server = self._getServer(opts)

  return self._request({
    method: 'POST',
    url: server + '/auth/password',
    json: {
      email: opts.email,
      token: opts.token,
      currentPassword: opts.currentPassword,
      newPassword: opts.newPassword
    }
  }, cb)
}

TownshipClient.prototype._getServer = function (opts) {
  opts = opts || {}
  assert.ok(opts.server || this.server, 'server must be specified before making auth request')
  return opts.server || this.server
}

TownshipClient.prototype._request = function (opts, cb) {
  return request(opts, function (err, res, body) {
    if (err) return cb(err)
    if (res.statusCode >= 400) return cb(body)
    return cb(null, res, body)
  })
}
