var User = require('../models/user');

module.exports = function(app){
  
  app.get('/logout', function(req, res){
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function(){
      res.redirect('home');
    });
  });

  app.get('/login', function(req, res){
    res.render('user/login', { redirect: req.query.redirect });
  });

  app.post('/login', function(req, res){
    User.authenticate(req.body.username, req.body.password, function(err, user){
      if (user) {
        // Regenerate session when signing in
        // to prevent fixation 
        req.session.regenerate(function(){
          // Store the user's primary key 
          // in the session store to be retrieved,
          // or in this case the entire user object
          req.flash('info', 'Signed in successfully');
          req.session.user = user;
          res.redirect(req.body.redirect || '/');
        });
      } else {
        req.flash('error', 'Authentication failed, please check your '
          + ' username and password.');
        res.redirect('back');
      }
    });
  });

};