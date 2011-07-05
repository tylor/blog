
var crypto = require('crypto');

exports.hash = function(msg, key) {
  return crypto.createHmac('sha256', key).update(msg).digest('hex');
}

// Fake data store
var users = {
  admin: {
    name: 'admin'
    , salt: 'randomly-generated-salt'
    , pass: exports.hash('password', 'randomly-generated-salt')
  }
};

exports.authenticate = function(name, pass, fn) {
  var user = users[name];
  // query the db for the given username
  if (!user) return fn(new Error('cannot find user'));
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  if (user.pass == exports.hash(pass, user.salt)) return fn(null, user);
  // Otherwise password is invalid
  fn(new Error('invalid password'));
}

exports.restrict = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login?redirect=' + req.url);
  }
}
