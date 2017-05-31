
var assert = require('assert');
var FlowQueue = require('../Queue');
var color = require('./util/colorLog').colorLog;

// basic tests

var flow = new FlowQueue();

var i = 0;
var k = 0;

var testObject1 = function(){};
var testObject2 = {a: 1};

flow.push(function(next, finish, obj1, obj2){
	i++;

	assert.equal(obj1, testObject1, 'It should pass objects through next');
	assert.equal(obj2, testObject2, 'It should pass objects through next');

	setTimeout(function(){
		next(testObject1, testObject2);
	}, 200);

}).push(function(next, finish, obj1, obj2){
	i++;
	assert.equal(obj1, testObject1, 'It should pass objects through next');
	assert.equal(obj2, testObject2, 'It should pass objects through next');

	flow.push(function(next){
		i++;
		k++;
		next();
	});
	flow.push(function(next){
		i++;
		k++;
		next(20, 40);
	});
	next();
}).invoke(function(arg1, arg2){
	assert.equal(20, arg1);
	assert.equal(40, arg2);
	i++;
}, testObject1, testObject2);

setTimeout(function(){
	assert.equal(2, k);
	assert.equal(5, i);
	color.green('✓    FlowQueue tests passed');
}, 300);

// Test with tick option

var l = 0;

new FlowQueue({
	tick: function(fn){
		fn();
	}
}).push(function(next){
	next(l++);
}).push(function(next){
	next(l++);
}).invoke(function(){
	l++;
});

assert.equal(l, 3);
color.green('✓    FlowQueue with tick option tests passed');


// test finish

var j = 0;

new FlowQueue({
	tick: false
}).push(function(next, finish){
	j++;
	finish(10);
}).push(function(next, finish){
	j++;
	assert.equal(true, false, 'should not be here');
}).invoke(function(arg){
	assert.equal(10, arg);
});

assert.equal(1, j);

