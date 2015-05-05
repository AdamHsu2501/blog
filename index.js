
/**
 * Module dependencies.
 */

var render = require('./lib/render');
var logger = require('koa-logger');
var route = require('koa-route');
var parse = require('co-body');
var koa = require('koa');
var app = koa();

// "database"

var posts = [];
var messages = [];


// middleware

app.use(logger());

// route middleware

app.use(route.get('/', list));
app.use(route.get('/post/new', add));
app.use(route.get('/post/:id', show));
app.use(route.post('/post', create));
app.use(route.post('/post/:id/message', reply));

// route definitions

/**
 * Post listing.
 */

function *list() {
  this.body = yield render('list', { posts: posts });
}

/**
 * Show creation form.
 */

function *add() {
  this.body = yield render('new');
}

/**
 * Show post :id.
 */

function *show(id) {
  var post = posts[id];
  if (!post) this.throw(404, 'invalid post id');
  this.body = yield render('show', { post: post , messages: messages[id] });
}

/**
 * Create a post.
 */

function *create() {
  var post = yield parse(this);
  var id = posts.push(post) - 1;
  post.created_at = new Date;
  post.id = id;
  messages.push([]);
  this.redirect('/');
}

/**
 * Create a reply.
 */

 function *reply(id) {
	 var message = yield parse(this);
	 var mid = messages[id].push(message) - 1;
	 message.created_at = new Date;
	 message.id = mid;
	 this.redirect('/post/'+id);
 }
// listen

app.listen(3000);
console.log('listening on port 3000');