module("tinymce.util.EventDispatcher");

test("fire (no event listeners)", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), args;

	args = dispatcher.fire('click', {test: 1});
	equal(args.test, 1);
	equal(args.isDefaultPrevented(), false);
	equal(args.isPropagationStopped(), false);
	equal(args.isImmediatePropagationStopped(), false);
	strictEqual(args.target, dispatcher);

	args = dispatcher.fire('click');
	equal(args.isDefaultPrevented(), false);
	equal(args.isPropagationStopped(), false);
	equal(args.isImmediatePropagationStopped(), false);
});

test("fire (event listeners)", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	dispatcher.on('click', function() {data += 'a';});
	dispatcher.on('click', function() {data += 'b';});

	args = dispatcher.fire('click', {test: 1});
	equal(data, 'ab');
});

test("fire (event listeners) stopImmediatePropagation", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	dispatcher.on('click', function(e) { data += 'a'; e.stopImmediatePropagation(); });
	dispatcher.on('click', function() { data += 'b'; });

	dispatcher.fire('click', {test: 1});
	equal(data, 'a');
});

test("on", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	strictEqual(dispatcher.on('click', function() {data += 'a';}), dispatcher);
	strictEqual(dispatcher.on('click keydown', function() {data += 'b';}), dispatcher);

	dispatcher.fire('click');
	equal(data, 'ab');

	dispatcher.fire('keydown');
	equal(data, 'abb');
});

test("on (prepend)", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	strictEqual(dispatcher.on('click', function() {data += 'a';}), dispatcher);
	strictEqual(dispatcher.on('click', function() {data += 'b';}, true), dispatcher);

	dispatcher.fire('click');
	equal(data, 'ba');
});

test("once", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	strictEqual(dispatcher.on('click', function() {data += 'a';}), dispatcher);
	strictEqual(dispatcher.once('click', function() {data += 'b';}), dispatcher);
	strictEqual(dispatcher.on('click', function() {data += 'c';}), dispatcher);

	dispatcher.fire('click');
	equal(data, 'abc');

	dispatcher.fire('click');
	equal(data, 'abcac');
});

test("once (prepend)", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	strictEqual(dispatcher.on('click', function() {data += 'a';}), dispatcher);
	strictEqual(dispatcher.once('click', function() {data += 'b';}, true), dispatcher);
	strictEqual(dispatcher.on('click', function() {data += 'c';}), dispatcher);

	dispatcher.fire('click');
	equal(data, 'bac');

	dispatcher.fire('click');
	equal(data, 'bacac');
});

test("once (unbind)", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	function handler() {
		data += 'b';
	}

	dispatcher.once('click', function() {data += 'a';});
	dispatcher.once('click', handler);
	dispatcher.off('click', handler);

	dispatcher.fire('click');
	equal(data, 'a');
});

test("once (multiple events)", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	dispatcher.once('click', function() {data += 'a';});
	dispatcher.once('keydown', function() {data += 'b';});

	dispatcher.fire('click');
	equal(data, 'a');

	dispatcher.fire('keydown');
	equal(data, 'ab');

	dispatcher.fire('click');
	dispatcher.fire('keydown');

	equal(data, 'ab');
});

test("off (all)", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	function listenerA() { data += 'a'; }
	function listenerB() { data += 'b'; }
	function listenerC() { data += 'c'; }

	dispatcher.on('click', listenerA);
	dispatcher.on('click', listenerB);
	dispatcher.on('keydown', listenerC);

	dispatcher.off();

	data = '';
	dispatcher.fire('click');
	dispatcher.fire('keydown');
	equal(data, '');
});

test("off (all named)", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	function listenerA() { data += 'a'; }
	function listenerB() { data += 'b'; }
	function listenerC() { data += 'c'; }

	dispatcher.on('click', listenerA);
	dispatcher.on('click', listenerB);
	dispatcher.on('keydown', listenerC);

	dispatcher.off('click');

	data = '';
	dispatcher.fire('click');
	dispatcher.fire('keydown');
	equal(data, 'c');
});

test("off (all specific observer)", function() {
	var dispatcher = new tinymce.util.EventDispatcher(), data = '';

	function listenerA() { data += 'a'; }
	function listenerB() { data += 'b'; }

	dispatcher.on('click', listenerA);
	dispatcher.on('click', listenerB);
	dispatcher.off('click', listenerB);

	data = '';
	dispatcher.fire('click');
	equal(data, 'a');
});

test("scope setting", function() {
	var lastScope, lastEvent, dispatcher;

	dispatcher = new tinymce.util.EventDispatcher();
	dispatcher.on('click', function() {
		lastScope = this;
	}).fire('click');
	strictEqual(dispatcher, lastScope);

	var scope = {test: 1};
	dispatcher = new tinymce.util.EventDispatcher({scope: scope});
	dispatcher.on('click', function(e) {
		lastScope = this;
		lastEvent = e;
	}).fire('click');
	strictEqual(scope, lastScope);
	strictEqual(lastEvent.target, lastScope);
});

test("beforeFire setting", function() {
	var lastArgs, dispatcher, args;

	dispatcher = new tinymce.util.EventDispatcher({
		beforeFire: function(args) {
			lastArgs = args;
		}
	});

	args = dispatcher.fire('click');
	strictEqual(lastArgs, args);
});

test("beforeFire setting (stopImmediatePropagation)", function() {
	var lastArgs, dispatcher, args, data = '';

	dispatcher = new tinymce.util.EventDispatcher({
		beforeFire: function(args) {
			lastArgs = args;
			args.stopImmediatePropagation();
		}
	});

	function listenerA() { data += 'a'; }

	dispatcher.on('click', listenerA);
	args = dispatcher.fire('click');
	strictEqual(lastArgs, args);
	strictEqual(data, '');
});

test("toggleEvent setting", function() {
	var lastName, lastState;

	dispatcher = new tinymce.util.EventDispatcher({
		toggleEvent: function(name, state) {
			lastName = name;
			lastState = state;
		}
	});

	function listenerA() { data += 'a'; }
	function listenerB() { data += 'b'; }

	dispatcher.on('click', listenerA);
	strictEqual(lastName, 'click');
	strictEqual(lastState, true);

	lastName = lastState = null;
	dispatcher.on('click', listenerB);
	strictEqual(lastName, null);
	strictEqual(lastState, null);

	dispatcher.off('click', listenerA);
	strictEqual(lastName, null);
	strictEqual(lastState, null);

	dispatcher.off('click', listenerB);
	strictEqual(lastName, 'click');
	strictEqual(lastState, false);
});