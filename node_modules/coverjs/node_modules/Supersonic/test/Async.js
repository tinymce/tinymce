
var assert = require('assert');
var FlowAsync = require('../Async');
var color = require('./util/colorLog').colorLog;

var flow = new FlowAsync;

var i = 0;
var j = 0;
var k = 0;

flow.push(function(ready){
	i++;
	setTimeout(function(){
		j++;
		ready();
	}, 300);
}).push(function(ready){
	i++;
	assert.equal(0, j);
	flow.push(function(ready){
		i++;
		ready();
	});
	ready();
}).invoke(function(){
	i++;
	k++;
});

setTimeout(function(){
	assert.equal(1, k);
	assert.equal(4, i);
	color.green('✓    FlowAsync tests passed');
}, 350);
