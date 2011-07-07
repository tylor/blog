
var dirty = require('dirty')('posts.dirty'),
    loaded = false,
    ids = 0;

dirty.on('load', function(length) {
  loaded = true;
  exports.index(function(err, key) {
    ids = key;
  });
  console.log('Database loaded.');
});

var Post = exports = module.exports = function Post(title, body) {
  this.id = ++ids;
  this.title = title;
  this.body = body;
  this.createdAt = new Date;
};

Post.prototype.save = function(fn){
  dirty.set(this.id, this, fn());
};

Post.prototype.validate = function(fn){
  if (!this.title) return fn(new Error('_title_ required'));
  if (!this.body) return fn(new Error('_body_ required'));
  if (this.body.length < 10) {
    return fn(new Error(
        '_body_ should be at least **10** characters long, was only _' + this.title.length + '_'));
  }
  fn();
};

Post.prototype.update = function(data, fn){
  this.updatedAt = new Date;
  for (var key in data) {
    if (undefined != data[key]) {
      this[key] = data[key];
    }
  }
  this.save(fn);
};

Post.prototype.destroy = function(fn){
  exports.destroy(this.id, fn);
};

exports.count = function(fn){
  var count = 0,
      arr = [];
  dirty.forEach(function(key, val) {
    if (arr.indexOf(key) == -1 && val) {
      arr.push(key);
      count++;
    }
  });
  fn(null, count);
};

exports.index = function(fn) {
  var count = 0,
      arr = [];
  dirty.forEach(function(key, val) {
    if (arr.indexOf(key) == -1 && val) {
      arr.push(key);
      if (key > count) {
        count = key;
      }
    }
  });
  fn(null, count);
};

exports.all = function(fn) {
  var arr = [],
      ret = [];
  dirty.forEach(function(key, val) {
    if (arr.indexOf(key) == -1 && val) {
      arr.push(key);
      ret.push(val);
    }
  });
  fn(null, ret);
};

/**
 * Sort posts by most recent.
 */
exports.recent = function(fn) {
  exports.all(function(err, posts) {
    fn(null, posts.sort(function(a, b){
      return new Date(a.createdAt) < new Date(b.createdAt);
    }));
  })
}

exports.get = function(id, fn){
  var data = dirty.get(id);
  var ret = new Post();
  // Add object methods to stored data.
  for (var key in data) {
    if (undefined != data[key]) {
      ret[key] = data[key];
    }
  }
  fn(null, ret);
};

exports.destroy = function(id, fn) {
  if (dirty.get(id)) {
    dirty.rm(id, fn());
  } else {
    fn(new Error('post ' + id + ' does not exist'));
  }
};