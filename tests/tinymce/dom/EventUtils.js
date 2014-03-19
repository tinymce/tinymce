var eventUtils = tinymce.dom.Event;

module("tinymce.dom.Event", {
	setupModule: function() {
		document.getElementById('view').innerHTML = (
			'<div id="content" tabindex="0">' +
			'<div id="inner" tabindex="0"></div>' +
			'</div>'
		);
	},

	teardown: function() {
		eventUtils.clean(window);
	}
});

test("unbind all", function() {
	var result;

	eventUtils.bind(window, 'click', function() {
		result.click = true;
	});

	eventUtils.bind(window, 'keydown', function() {
		result.keydown1 = true;
	});

	eventUtils.bind(window, 'keydown', function() {
		result.keydown2 = true;
	});

	result = {};
	eventUtils.fire(window, 'click');
	eventUtils.fire(window, 'keydown');
	deepEqual(result, {click: true, keydown1: true, keydown2: true});

	eventUtils.unbind(window);
	result = {};
	eventUtils.fire(window, 'click');
	eventUtils.fire(window, 'keydown');
	deepEqual(result, {});
});

test("unbind event", function() {
	var result;

	eventUtils.bind(window, 'click', function() {
		result.click = true;
	});

	eventUtils.bind(window, 'keydown', function() {
		result.keydown1 = true;
	});

	eventUtils.bind(window, 'keydown', function() {
		result.keydown2 = true;
	});

	result = {};
	eventUtils.fire(window, 'click');
	eventUtils.fire(window, 'keydown');
	deepEqual(result, {click: true, keydown1: true, keydown2: true});

	eventUtils.unbind(window, 'click');
	result = {};
	eventUtils.fire(window, 'click');
	eventUtils.fire(window, 'keydown');
	deepEqual(result, {keydown1: true, keydown2: true});
});

test("unbind event non existing", function() {
	eventUtils.unbind(window, 'noevent');
	ok(true, "No exception");
});

test("unbind callback", function() {
	var result;

	eventUtils.bind(window, 'click', function() {
		result.click = true;
	});

	eventUtils.bind(window, 'keydown', function() {
		result.keydown1 = true;
	});

	function callback2() {
		result.keydown2 = true;
	}

	eventUtils.bind(window, 'keydown', callback2);

	result = {};
	eventUtils.fire(window, 'click');
	eventUtils.fire(window, 'keydown');
	deepEqual(result, {click: true, keydown1: true, keydown2: true});

	eventUtils.unbind(window, 'keydown', callback2);
	result = {};
	eventUtils.fire(window, 'click');
	eventUtils.fire(window, 'keydown');
	deepEqual(result, {click: true, keydown1: true});
});

test("unbind multiple", function() {
	var result;

	eventUtils.bind(window, 'mouseup mousedown click', function(e) {
		result[e.type] = true;
	});

	eventUtils.unbind(window, 'mouseup mousedown');

	result = {};
	eventUtils.fire(window, 'mouseup');
	eventUtils.fire(window, 'mousedown');
	eventUtils.fire(window, 'click');
	deepEqual(result, {click: true});
});

test("bind multiple", function() {
	var result;

	eventUtils.bind(window, 'mouseup mousedown', function(e) {
		result[e.type] = true;
	});

	result = {};
	eventUtils.fire(window, 'mouseup');
	eventUtils.fire(window, 'mousedown');
	eventUtils.fire(window, 'click');
	deepEqual(result, {mouseup: true, mousedown: true});
});

test("bind/fire bubbling", function() {
	var result;

	eventUtils.bind(window, 'click', function() {
		result.window = true;
	});

	eventUtils.bind(document, 'click', function() {
		result.document = true;
	});

	eventUtils.bind(document.body, 'click', function() {
		result.body = true;
	});

	eventUtils.bind(document.getElementById('content'), 'click', function() {
		result.content = true;
	});

	eventUtils.bind(document.getElementById('inner'), 'click', function() {
		result.inner = true;
	});

	result = {};
	eventUtils.fire(window, 'click');
	deepEqual(result, {window: true});

	result = {};
	eventUtils.fire(document, 'click');
	deepEqual(result, {document: true, window: true});

	result = {};
	eventUtils.fire(document.body, 'click');
	deepEqual(result, {body: true, document: true, window: true});

	result = {};
	eventUtils.fire(document.getElementById('content'), 'click');
	deepEqual(result, {content: true, body: true, document: true, window: true});

	result = {};
	eventUtils.fire(document.getElementById('inner'), 'click');
	deepEqual(result, {inner: true, content: true, body: true, document: true, window: true});
});

test("bind/fire stopImmediatePropagation", function() {
	var result;

	eventUtils.bind(window, 'click', function() {
		result.click1 = true;
	});

	eventUtils.bind(window, 'click', function(e) {
		result.click2 = true;
		e.stopImmediatePropagation();
	});

	eventUtils.bind(window, 'click', function() {
		result.click3 = true;
	});

	result = {};
	eventUtils.fire(window, 'click');
	deepEqual(result, {click1: true, click2: true});
});

test("bind/fire stopPropagation", function() {
	var result;

	eventUtils.bind(window, 'click', function() {
		result.click1 = true;
	});

	eventUtils.bind(document.body, 'click', function() {
		result.click2 = true;
	});

	eventUtils.bind(document.getElementById('inner'), 'click', function(e) {
		result.click3 = true;
		e.stopPropagation();
	});

	result = {};
	eventUtils.fire(document.getElementById('inner'), 'click');
	deepEqual(result, {click3: true});
});

test("clean window", function() {
	var result;

	eventUtils.bind(window, 'click', function() {
		result.click1 = true;
	});

	eventUtils.bind(document.body, 'click', function() {
		result.click2 = true;
	});

	eventUtils.bind(document.getElementById('content'), 'click', function() {
		result.click3 = true;
	});

	eventUtils.bind(document.getElementById('inner'), 'click', function() {
		result.click4 = true;
	});

	result = {};
	eventUtils.fire(document.getElementById('inner'), 'click');
	deepEqual(result, {click1: true, click2: true, click3: true, click4: true});

	eventUtils.clean(window);
	result = {};
	eventUtils.fire(document.getElementById('inner'), 'click');
	deepEqual(result, {});
});

test("clean document", function() {
	var result;

	eventUtils.bind(window, 'click', function() {
		result.click1 = true;
	});

	eventUtils.bind(document, 'click', function() {
		result.click2 = true;
	});

	eventUtils.bind(document.body, 'click', function() {
		result.click3 = true;
	});

	eventUtils.bind(document.getElementById('content'), 'click', function() {
		result.click4 = true;
	});

	eventUtils.bind(document.getElementById('inner'), 'click', function() {
		result.click5 = true;
	});

	result = {};
	eventUtils.fire(document.getElementById('inner'), 'click');
	deepEqual(result, {click1: true, click2: true, click3: true, click4: true, click5: true});

	eventUtils.clean(document);
	result = {};
	eventUtils.fire(document.getElementById('inner'), 'click');
	deepEqual(result, {click1: true});
});

test("clean element", function() {
	var result;

	eventUtils.bind(window, 'click', function() {
		result.click1 = true;
	});

	eventUtils.bind(document.body, 'click', function() {
		result.click2 = true;
	});

	eventUtils.bind(document.getElementById('content'), 'click', function() {
		result.click3 = true;
	});

	eventUtils.bind(document.getElementById('inner'), 'click', function() {
		result.click4 = true;
	});

	result = {};
	eventUtils.fire(document.getElementById('inner'), 'click');
	deepEqual(result, {click1: true, click2: true, click3: true, click4: true});

	eventUtils.clean(document.getElementById('content'));
	result = {};
	eventUtils.fire(document.getElementById('inner'), 'click');
	deepEqual(result, {click1: true, click2: true});
});

test("mouseenter/mouseleave bind/unbind", function() {
	var result = {};

	eventUtils.bind(document.body, 'mouseenter mouseleave', function(e) {
		result[e.type] = true;
	});

	eventUtils.fire(document.body, 'mouseenter');
	eventUtils.fire(document.body, 'mouseleave');

	deepEqual(result, {mouseenter: true, mouseleave: true});

	result = {};
	eventUtils.clean(document.body);
	eventUtils.fire(document.body, 'mouseenter');
	eventUtils.fire(document.body, 'mouseleave');
	deepEqual(result, {});
});

/*
asyncTest("focusin/focusout bind/unbind", function() {
	var result = {};

	window.setTimeout(function() {
		eventUtils.bind(document.body, 'focusin focusout', function(e) {
			// IE will fire a focusout on the parent element if you focus an element within not a big deal so lets detect it in the test
			if (e.type == "focusout" && e.target.contains(document.activeElement)) {
				return;
			}

			result[e.type] = result[e.type] ? ++result[e.type] : 1;
		});

		start();
		document.getElementById('content').focus();
		document.getElementById('inner').focus();

		deepEqual(result, {focusin: 2, focusout: 1});
	}, 0);
});
*/

test("bind unbind fire clean on null", function() {
	eventUtils.bind(null, 'click', function() {});
	eventUtils.unbind(null, 'click', function() {});
	eventUtils.fire(null, {});
	eventUtils.clean(null);
	ok(true, "No exception");
});

test("bind ready when page is loaded", function() {
	var ready;

	eventUtils.bind(window, 'ready', function() {
		ready = true;
	});

	ok(eventUtils.domLoaded, "DomLoaded state true");
	ok(ready, "Window is ready.");
});

test("event states when event object is fired twice", function() {
	var result = {};

	eventUtils.bind(window, 'keydown', function(e) {result[e.type] = true;e.preventDefault();e.stopPropagation();});
	eventUtils.bind(window, 'keyup', function(e) {result[e.type] = true;e.stopImmediatePropagation();});

	var event = {};
	eventUtils.fire(window, 'keydown', event);
	eventUtils.fire(window, 'keyup', event);

	ok(event.isDefaultPrevented(), "Default is prevented.");
	ok(event.isPropagationStopped(), "Propagation is stopped.");
	ok(event.isImmediatePropagationStopped(), "Immediate propagation is stopped.");

	deepEqual(result, {keydown: true, keyup: true});
});

test("unbind inside callback", function() {
	var data;

	function append(value) {
		return function() {
			data += value;
		};
	}

	function callback() {
		eventUtils.unbind(window, 'click', callback);
		data += 'b';
	}

	data = '';
	eventUtils.bind(window, 'click', append("a"));
	eventUtils.bind(window, 'click', callback);
	eventUtils.bind(window, 'click', append("c"));

	eventUtils.fire(window, 'click', {});
	equal(data, 'abc');

	data = '';
	eventUtils.fire(window, 'click', {});
	equal(data, 'ac');
});

test("ready/DOMContentLoaded (domLoaded = true)", function() {
	var evt;

	eventUtils.bind(window, "ready", function(e) {evt = e;});
	equal(evt.type, "ready");
});

test("ready/DOMContentLoaded (document.readyState check)", function() {
	var evt;

	try {
		document.readyState = "loading";
	} catch (e) {
		ok(true, "IE doesn't allow us to set document.readyState");
		return;
	}

	eventUtils.domLoaded = false;
	document.readyState = "loading";
	eventUtils.bind(window, "ready", function(e) {evt = e;});
	ok(typeof(evt) !== "undefined");

	eventUtils.domLoaded = false;
	document.readyState = "complete";
	eventUtils.bind(window, "ready", function(e) {evt = e;});
	equal(evt.type, "ready");
});
