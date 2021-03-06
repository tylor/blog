
/**
 * Module dependencies.
 */
var Post = require('../models/post');
var User = require('../models/user');

module.exports = function(app){
  /**
   * Apply basic auth to all post related routes
   */
  //app.all('/post(/*)?', User.restrict);

  /**
   * Map :post to the database, loading
   * every time :post is present.
   */
  app.param('post', function(req, res, next, id){
    Post.get(id, function(err, post){
      if (err) return next(err);
      if (!post) return next(new Error('failed to load post ' + id));
      req.post = post;
      next();
    });
  });

  /**
   * Add a post.
   */
  app.get('/post/add', User.restrict, function(req, res){
    res.render('post/form', { post: {}});
  });

  /**
   * Save a post.
   */
  app.post('/post', User.restrict, function(req, res){
    var data = req.body.post
      , post = new Post(data.title, data.body);

    post.validate(function(err){
      if (err) {
        req.flash('error', err.message);
        data.new = true;
        res.render('post/form', { post: data});
      }
      else {
        console.log('we are good');
        post.save(function(err){
          req.flash('info', 'Successfully created post _%s_', post.title);
          res.redirect('home');
        });
      }
    });
  });

  /**
   * Display the post.
   */
  app.get('/post/:post', function(req, res){
    res.render('post', { post: req.post });
  });

  /**
   * Display the post edit form.
   */
  app.get('/post/:post/edit', User.restrict, function(req, res){
    res.render('post/form', { post: req.post });
  });

  /**
   * Update post. Typically a data layer would handle this stuff.
   */
  app.put('/post/:post', User.restrict, function(req, res, next){
    var post = req.post;
    post.validate(function(err){
      if (err) {
        req.flash('error', err.message);
        res.render('post/form', { post: req.body.post });
      }
      else {
        post.update(req.body.post, function(err){
          if (err) return next(err);
          req.flash('info', 'Successfully updated post');
          res.redirect('back');
        });
      }
    });
  });

  /**
   * Delete the post.
   */
  app.del('/post/:post', User.restrict, function(req, res, next){
    var post = req.post;
    post.destroy(function(){
      req.flash('info', 'The post has been deleted.');
      res.redirect('home');
    });
  });
};
