Supersonic
----------

A small and supersonic flow-controll library for Node.js

[![Build Status](https://secure.travis-ci.org/arian/LISP.js.png)](http://travis-ci.org/arian/Supersonic)

### Install

	npm install Supersonic

### Usage

There are two modes, async and sync (or queued).

Async, all functions simultaneously.

``` js
var FlowAsync = require('Supersonic').Async;

new FlowAsync().push(function(ready){
	setTimeout(function(){
		ready();
	}, 1000);
})).push(function(ready){
	setTimeout(function(){
		ready();
	}, 2000);
}).invoke(function(){
	console.log('all ready, after 2 seconds');
});
```

All functions after each other.
Additionally the Queue can pass data through the `next([arg1, arg2, …])` calls.

``` js
var FlowQueue = require('Supersonic').Queue;

new FlowQueue().push(function(next){
	setTimeout(function(){
		next(3.14, 2.7218);
	}, 1000);
})).push(function(next, finish, pi, e){
	setTimeout(function(){
		finish(new Error);
	}, 2000);
}).push(function(){
	// not called because of the finish() in the previous call.
}).invoke(function(err){
    console.log('all ready, after 3 seconds');
});
```

That's it!

### Passing more data

With `FlowQueue` it is possible to pass arguments. However when a lot of
arguments have to be passed, this can be a bit tedious. Fortunately this can be
easily avoided by putting the data on an object.

``` js
var data = {};
new FlowAsync().push(function(ready){
	setupDatabase(function(db){
		data.db = db;
		ready();
	});
}).push(function(ready){
	setupCache(function(cache){
		data.cache = cache;
		ready();
	});
}).invoke(function(){
	console.log(data);
});
```
