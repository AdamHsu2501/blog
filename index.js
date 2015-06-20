var http    = require('http');
var fs      = require('mz/fs');
var co      = require('co');
var monk    = require('monk');
var comonk  = require('co-monk');
var db      = monk('localhost/test');
var notes   = comonk(db.get('notes'));

/**
 * Module dependencies.
 */

var render = require('./lib/render');
var logger = require('koa-logger');
var route = require('koa-route');
var parse = require('co-body');
var koa = require('koa');
var app = koa();

// middleware

app.use(logger());

// route middleware

/**
 * Post listing.
 */
 
app.use(route.get('/', function *list() {
  var objs = yield notes.find({post:1});
  var robjs = yield notes.find({post:0});
  this.body = yield render('list', { posts: objs, messages: robjs });
}));


/**
 * Show creation form.
 */
 
app.use(route.get('/post/new', function *add() {
  this.body = yield render('new');
}));


/**
 * Show post :id.
 */

app.use(route.get('/post/:id', function *show(id) {
  var obj = yield notes.findOne({id:parseInt(id)});
  var robj = yield notes.find({postId:parseInt(id)});
  if (!obj) this.throw(404, 'invalid post id');
  this.body = yield render('show', { post: obj , messages: robj});
}));


/**
 * Create a post.
 */
 
 function response(res, code, msg) {
  res.status = code;
  res.set({'Content-Length':''+msg.length,'Content-Type':'text/plain'});
  res.body = msg;
  console.log("response: code="+code+"\n"+msg+"\n");
}
 
app.use(route.post('/post', function *create() {
  var post = yield parse(this);
  var d = new Date();
  var now = (d.getFullYear()*1000000000+(d.getMonth()+1)*10000000+d.getDate()*100000+d.getHours()*60*60+d.getMinutes()*60+d.getSeconds())-d.getTime();
  post.created_at = new Date;
  post.id = now;
  yield notes.insert({post:1, id:post.id, title:post.title, body:post.body});
  console.log('post 1 %s %s %s',post.id, post.title, post.body);
  response(this.response, 200, 'write success!');
  this.redirect('/');
}));


/**
 * Create a reply.
 */
 
app.use(route.post('/post/:id/message', function *reply(id) {
	 var message = yield parse(this);
	 var d = new Date();
	 message.created_at = new Date;
	 message.id = parseInt(id);
	 yield notes.insert({post:0, postId:message.id, title:message.title, body:message.body});
	 console.log('post 0 %s %s %s', message.id, message.title, message.body);
     response(this.response, 200, 'write success!');
	 this.redirect('/post/'+id);
 }));

// listen

app.listen(3000);
console.log('listening on port 3000');