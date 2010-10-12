QUnit.config.autostart = false;
module("API", {
	autostart: false
});

/**
 * Fakes a mouse event.
 *
 * @param {Element/String} e DOM element object or element id to send fake event to.
 * @param {String} na Event name to fake like "click".
 * @param {Object} o Optional object with data to send with the event like cordinates.
 */
function fakeMouseEvent(e, na, o) {
	var ev;

	o = tinymce.extend({
		screenX : 0,
		screenY : 0,
		clientX : 0,
		clientY : 0
	}, o);

	e = tinymce.DOM.get(e);

	if (e.fireEvent) {
		ev = document.createEventObject();
		tinymce.extend(ev, o);
		e.fireEvent('on' + na, ev);
		return;
	}

	ev = document.createEvent('MouseEvents');

	if (ev.initMouseEvent)
		ev.initMouseEvent(na, true, true, window, 1, o.screenX, o.screenY, o.clientX, o.clientY, false, false, true, false, 0, null);

	e.dispatchEvent(ev);
};

/**
 * Fakes a key event.
 *
 * @param {Element/String} e DOM element object or element id to send fake event to.
 * @param {String} na Event name to fake like "keydown".
 * @param {Object} o Optional object with data to send with the event like keyCode and charCode.
 */
function fakeKeyEvent(e, na, o) {
	var ev;

	o = tinymce.extend({
		keyCode : 13,
		charCode : 0
	}, o);

	e = tinymce.DOM.get(e);

	if (e.fireEvent) {
		ev = document.createEventObject();
		tinymce.extend(ev, o);
		e.fireEvent('on' + na, ev);
		return;
	}

	if (document.createEvent) {
		try {
			// Fails in Safari
			ev = document.createEvent('KeyEvents');
			ev.initKeyEvent(na, true, true, window, false, false, false, false, o.keyCode, o.charCode);
		} catch (ex) {
			ev = document.createEvent('Events');
			ev.initEvent(na, true, true);

			ev.keyCode = o.keyCode;
			ev.charCode = o.charCode;
		}
	} else {
		ev = document.createEvent('UIEvents');

		if (ev.initUIEvent)
			ev.initUIEvent(na, true, true, window, 1);

		ev.keyCode = o.keyCode;
		ev.charCode = o.charCode;
	}

	e.dispatchEvent(ev);
};

(function() {
	test('tinymce - is', 9, function() {
		ok(!tinymce.is(null, 'test'));
		ok(!tinymce.is('', 'test'));
		ok(tinymce.is('', 'string'));
		ok(tinymce.is(3, 'number'));
		ok(tinymce.is(3.1, 'number'));
		ok(tinymce.is([], 'array'));
		ok(tinymce.is({}, 'object'));
		ok(tinymce.is(window.abc, 'undefined'));
		ok(!tinymce.is(window.abc));
	});

	test('tinymce - each', 6, function() {
		var c;

		c = 0;
		tinymce.each([1, 2, 3], function(v) {
			c += v;
		});
		equals(c, 6);

		c = 0;
		tinymce.each([1, 2, 3], function(v, i) {
			c += i;
		});
		equals(c, 3);

		c = 0;
		tinymce.each({a : 1, b : 2, c : 3}, function(v, i) {
			c += v;
		});
		equals(c, 6);

		c = '';
		tinymce.each({a : 1, b : 2, c : 3}, function(v, k) {
			c += k;
		});
		equals(c, 'abc');

		c = 0;
		tinymce.each(null, function(v) {
			c += v;
		});
		equals(c, 0);

		c = 0;
		tinymce.each(1, function(v) {
			c += v;
		});
		equals(c, 0);
	});

	test('tinymce - map', 1, function() {
		var c;

		c = tinymce.map([1,2,3], function(v) {
			return v + 1;
		});
		equals(c.join(','), '2,3,4');
	});

	test('tinymce - grep', 3, function() {
		var c;

		c = tinymce.grep([1,2,3,4], function(v) {
			return v > 2;
		});
		equals(c.join(','), '3,4');

		c = [1,2,3,4];
		c.test = 1
		c = tinymce.grep(c);
		ok(!c.test);
		equals(c.join(','), '1,2,3,4');
	});

	test('tinymce - explode', 2, function() {
		equals(tinymce.explode(' a, b, c ').join(','), 'a,b,c');
		equals(tinymce.explode(' a;  b; c ', ';').join(','), 'a,b,c');
	});

	test('tinymce - inArray', 4, function() {
		equals(tinymce.inArray([1,2,3], 2), 1);
		equals(tinymce.inArray([1,2,3], 7), -1);
		equals(tinymce.inArray({a : 1, b : 2, c : 3}, 2), -1);
		equals(tinymce.inArray(null, 7), -1);
	});

	test('tinymce - extend', 5, function() {
		var o;

		o = tinymce.extend({
			a : 1,
			b : 2,
			c : 3
		}, {
			a : 2,
			d : 4
		});

		equals(o.a, 2);
		equals(o.b, 2);
		equals(o.d, 4);

		o = tinymce.extend({
			a : 1,
			b : 2,
			c : 3
		}, {
			a : 2,
			d : 4
		}, {
			e : 5
		});

		equals(o.d, 4);
		equals(o.e, 5);
	});

	test('tinymce - trim', 5, function() {
		equals(tinymce.trim('a'), 'a');
		equals(tinymce.trim(' \r  a'), 'a');
		equals(tinymce.trim('a  \n  '), 'a');
		equals(tinymce.trim('   a  \t  '), 'a');
		equals(tinymce.trim(null), '');
	});

	test('tinymce - create', 13, function() {
		var o;

		tinymce.create('tinymce.Test1', {
			Test1 : function(c) {
				this.c = c;
				this.c++;
			},

			method1 : function() {
				this.c++;
			},

			method2 : function() {
				this.c++;
			}
		});

		tinymce.create('tinymce.Test2:tinymce.Test1', {
			Test2 : function(c) {
				this.parent(c);
				this.c += 2;
			},

			method1 : function() {
				this.c+=2;
			},

			method2 : function() {
				this.parent();
				this.c+=2;
			}
		});

		tinymce.create('tinymce.Test3:tinymce.Test2', {
			Test3 : function(c) {
				this.parent(c);
				this.c += 4;
			},

			method1 : function() {
				this.c+=2;
			},

			method2 : function() {
				this.parent();
				this.c+=3;
			}
		});

		tinymce.create('tinymce.Test4:tinymce.Test3', {
			method2 : function() {
				this.parent();
				this.c+=3;
			},

			'static' : {
				method3 : function() {
					return 3;
				}
			}
		});

		tinymce.create('static tinymce.Test5', {
			method1 : function() {
				return 3;
			}
		});

		o = new tinymce.Test1(3);
		equals(o.c, 4);
		o.method1();
		equals(o.c, 5);

		o = new tinymce.Test2(3);
		equals(o.c, 6);
		o.method1();
		equals(o.c, 8);
		o.method2();
		equals(o.c, 11);

		o = new tinymce.Test3(3);
		equals(o.c, 10);
		o.method1();
		equals(o.c, 12);
		o.method2();
		equals(o.c, 18);

		o = new tinymce.Test4(3);
		equals(o.c, 10);
		o.method1();
		equals(o.c, 12);
		o.method2();
		equals(o.c, 21);
		equals(tinymce.Test4.method3(), 3);

		equals(tinymce.Test5.method1(), 3);
	});

	test('tinymce - walk', 3, function() {
		var c;

		c = 0;
		tinymce.walk({
			a : {
				a1 : 1,
				a2 : 2,
				a3 : 3
			},

			b : {
				b1 : 4,
				b2 : {
					b21 : 5,
					b22 : 6,
					b23 : 7
				},
				b3 : 8
			}
		}, function(v) {
			if (tinymce.is(v, 'number'))
				c += v;
		});
		equals(c, 36);

		c = 0;
		tinymce.walk({
			items : [
				1,
				{items : [2, {a1 : 3, items : [4, 5], b1 : 6}, 7]},
				8
			]
		}, function(v) {
			if (tinymce.is(v, 'number'))
				c += v;
		}, 'items');
		equals(c, 27);

		c = 0;
		tinymce.walk(null);
		equals(c, 0);
	});

	test('tinymce - createNS', 2, function() {
		tinymce.createNS('a.b.c.d.e');
		a.b.c.d.e.x = 1;
		tinymce.createNS('a.b.c.d.e.f');
		a.b.c.d.e.f = 2;
		equals(a.b.c.d.e.x, 1);
		equals(a.b.c.d.e.f, 2);
	});

	test('tinymce - get', 2, function() {
		tinymce.createNS('a.b.c.d.e');
		a.b.c.d.e.x = 1;
		equals(tinymce.resolve('a.b.c.d.e.x'), 1);
		ok(!tinymce.resolve('a.b.c.d.e.y'));
	});
})();

(function() {
	var DOM = new tinymce.dom.DOMUtils(document, {keep_values : true});

	test('tinymce.dom.DOMUtils - parseStyle', 9, function() {
		var dom;

		DOM.add(document.body, 'div', {id : 'test'});

		dom = new tinymce.dom.DOMUtils(document, {hex_colors : true, keep_values : true, url_converter : function(u, n, e) {
			return 'X' + u + 'Y';
		}});

		equals(
			dom.serializeStyle(dom.parseStyle('border: 1px solid red; color: green')),
			'border: 1px solid red; color: green;'
		);

		equals(
			dom.serializeStyle(dom.parseStyle('border: 1px solid rgb(0, 255, 255); color: green')),
			'border: 1px solid #00ffff; color: green;'
		);

		equals(
			dom.serializeStyle(dom.parseStyle('border-top: 1px solid red; border-left: 1px solid red; border-bottom: 1px solid red; border-right: 1px solid red;')),
			'border: 1px solid red;'
		);

		equals(
			dom.serializeStyle(dom.parseStyle('background: transparent url(test.gif);')),
			'background: transparent url(Xtest.gifY);'
		);

		equals(
			dom.serializeStyle(dom.parseStyle('background: transparent url(http://www.site.com/test.gif?a=1&b=2);')),
			'background: transparent url(Xhttp://www.site.com/test.gif?a=1&b=2Y);'
		);

		dom.setHTML('test', '<span id="test2" style="border: 1px solid #00ff00;"></span>');
		equals(dom.getAttrib('test2', 'style'), 'border: 1px solid #00ff00;');

		dom.setHTML('test', '<span id="test2" style="background-image: url(test.gif);"></span>');
		equals(dom.getAttrib('test2', 'style'), 'background-image: url(Xtest.gifY);');

		dom.get('test').innerHTML = '<span id="test2" style="border: 1px solid #00ff00"></span>';
		equals(dom.getAttrib('test2', 'style'), tinymce.isIE && !window.getSelection ? 'border: #00ff00 1px solid;' : 'border: 1px solid #00ff00;'); // IE has a separate output

		dom.get('test').innerHTML = '<span id="test2" style="background-image: url(http://www.site.com/test.gif);"></span>';
		equals(dom.getAttrib('test2', 'style'), 'background-image: url(Xhttp://www.site.com/test.gifY);');

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - addClass', 10, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.get('test').className = '';
		DOM.addClass('test', 'abc');
		equals(DOM.get('test').className, 'abc');

		DOM.get('test').className = '';
		equals(DOM.addClass('test', 'abc'), 'abc');
		equals(DOM.addClass(null, 'abc'), false);

		DOM.addClass('test', '123');
		equals(DOM.get('test').className, 'abc 123');

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.addClass(DOM.select('span', 'test'), 'abc');
		equals(DOM.get('test2').className, 'abc');
		equals(DOM.get('test3').className, 'abc');
		equals(DOM.get('test4').className, 'abc');
		DOM.get('test').innerHTML = '';

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.addClass(['test2', 'test3', 'test4'], 'abc');
		equals(DOM.get('test2').className, 'abc');
		equals(DOM.get('test3').className, 'abc');
		equals(DOM.get('test4').className, 'abc');
		DOM.get('test').innerHTML = '';

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - removeClass', 4, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.get('test').className = 'abc 123 xyz';
		DOM.removeClass('test', '123');
		equals(DOM.get('test').className, 'abc xyz');

		DOM.get('test').innerHTML = '<span id="test2" class="test1"></span><span id="test3" class="test test1 test"></span><span id="test4" class="test1 test"></span>';
		DOM.removeClass(DOM.select('span', 'test'), 'test1');
		equals(DOM.get('test2').className, '');
		equals(DOM.get('test3').className, 'test test');
		equals(DOM.get('test4').className, 'test');
		DOM.get('test').innerHTML = '';

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - hasClass', 7, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.get('test').className = 'abc 123 xyz';
		ok(DOM.hasClass('test', 'abc'));
		ok(DOM.hasClass('test', '123'));
		ok(DOM.hasClass('test', 'xyz'));
		ok(!DOM.hasClass('test', 'aaa'));

		DOM.get('test').className = 'abc';
		ok(DOM.hasClass('test', 'abc'));

		DOM.get('test').className = 'aaa abc';
		ok(DOM.hasClass('test', 'abc'));

		DOM.get('test').className = 'abc aaa';
		ok(DOM.hasClass('test', 'abc'));

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - add', 5, function() {
		var e;

		DOM.add(document.body, 'div', {id : 'test'});

		DOM.add('test', 'span', {'class' : 'abc 123'}, 'content <b>abc</b>');
		e = DOM.get('test').getElementsByTagName('span')[0];
		equals(e.className, 'abc 123');
		equals(e.innerHTML.toLowerCase(), 'content <b>abc</b>');
		DOM.remove(e);

		DOM.add('test', 'span', {'class' : 'abc 123'});
		e = DOM.get('test').getElementsByTagName('span')[0];
		equals(e.className, 'abc 123');
		DOM.remove(e);

		DOM.add('test', 'span');
		e = DOM.get('test').getElementsByTagName('span')[0];
		equals(e.nodeName, 'SPAN');
		DOM.remove(e);

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.add(['test2', 'test3', 'test4'], 'span', {'class' : 'abc 123'});
		equals(DOM.select('span', 'test').length, 6);

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - create', 3, function() {
		var e;

		e = DOM.create('span', {'class' : 'abc 123'}, 'content <b>abc</b>');

		equals(e.nodeName, 'SPAN');
		equals(e.className, 'abc 123');
		equals(e.innerHTML.toLowerCase(), 'content <b>abc</b>');
	});

	test('tinymce.dom.DOMUtils - createHTML', 4, function() {
		equals(DOM.createHTML('span', {'id' : 'id1', 'class' : 'abc 123'}, 'content <b>abc</b>'), '<span id="id1" class="abc 123">content <b>abc</b></span>');
		equals(DOM.createHTML('span', {'id' : 'id1', 'class' : 'abc 123'}), '<span id="id1" class="abc 123" />');
		equals(DOM.createHTML('span'), '<span />');
		equals(DOM.createHTML('span', null, 'content <b>abc</b>'), '<span>content <b>abc</b></span>');
	});

	test('tinymce.dom.DOMUtils - uniqueId', 3, function() {
		DOM.counter = 0;

		equals(DOM.uniqueId(), 'mce_0');
		equals(DOM.uniqueId(), 'mce_1');
		equals(DOM.uniqueId(), 'mce_2');
	});

	test('tinymce.dom.DOMUtils - showHide', 10, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.show('test');
		equals(DOM.get('test').style.display, 'block');
		ok(!DOM.isHidden('test'));

		DOM.hide('test');
		equals(DOM.get('test').style.display, 'none');
		ok(DOM.isHidden('test'));

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.hide(['test2', 'test3', 'test4'], 'test');
		equals(DOM.get('test2').style.display, 'none');
		equals(DOM.get('test3').style.display, 'none');
		equals(DOM.get('test4').style.display, 'none');

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.show(['test2', 'test3', 'test4'], 'test');
		equals(DOM.get('test2').style.display, 'block');
		equals(DOM.get('test3').style.display, 'block');
		equals(DOM.get('test4').style.display, 'block');

		// Cleanup
		DOM.setAttrib('test', 'style', '');

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - select', 4, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setHTML('test', '<div>test 1</div><div>test 2 <div>test 3</div></div><div>test 4</div>');
		equals(DOM.select('div', 'test').length, 4);
		ok(DOM.select('div', 'test').reverse);

		DOM.setHTML('test', '<div class="test1 test2 test3">test 1</div><div class="test2">test 2 <div>test 3</div></div><div>test 4</div>')
		equals(DOM.select('div.test2', 'test').length, 2);

		DOM.setHTML('test', '<div class="test1 test2 test3">test 1</div><div class="test2">test 2 <div>test 3</div></div><div>test 4</div>')
		equals(DOM.select('div div', 'test').length, 1, null, tinymce.isWebKit); // Issue: http://bugs.webkit.org/show_bug.cgi?id=17461
		//alert(DOM.select('div div', 'test').length +","+DOM.get('test').querySelectorAll('div div').length);

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - is', 3, function() {
		DOM.add(document.body, 'div', {id : 'test'});
		DOM.setHTML('test', '<div id="textX" class="test">test 1</div>');

		ok(DOM.is(DOM.get('textX'), 'div'));
		ok(DOM.is(DOM.get('textX'), 'div#textX.test'));
		ok(!DOM.is(DOM.get('textX'), 'div#textX2'));

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - encode', 1, function() {
		equals(DOM.encode('abc<>"&\'åäö'), 'abc&lt;&gt;&quot;&amp;&#39;åäö');
	});

	test('tinymce.dom.DOMUtils - setGetAttrib', 11, function() {
		var dom;

		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setAttrib('test', 'class', 'test 123');
		equals(DOM.getAttrib('test', 'class'), 'test 123');

		DOM.setAttrib('test', 'src', 'url');
		equals(DOM.getAttrib('test', 'src'), 'url');
		equals(DOM.getAttrib('test', '_mce_src'), 'url');
		equals(DOM.getAttrib('test', 'abc'), '');

		DOM.setAttribs('test', {'class' : '123', title : 'abc'});
		equals(DOM.getAttrib('test', 'class'), '123');
		equals(DOM.getAttrib('test', 'title'), 'abc');

		dom = new tinymce.dom.DOMUtils(document, {keep_values : true, url_converter : function(u, n, e) {
			return '&<>"' + u + '&<>"' + n;
		}});

		dom.setAttribs('test', {src : '123', href : 'abc'});
		equals(DOM.getAttrib('test', 'src'), '&<>"123&<>"src');
		equals(DOM.getAttrib('test', 'href'), '&<>"abc&<>"href');

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.setAttribs(['test2', 'test3', 'test4'], {test1 : "1", test2 : "2"});
		equals(DOM.getAttrib('test2', 'test1'), '1');
		equals(DOM.getAttrib('test3', 'test2'), '2');
		equals(DOM.getAttrib('test4', 'test1'), '1');

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - getAttribs', 2, function() {
		var dom;

		function check(obj, val) {
			var count = 0;

			val = val.split(',');

			tinymce.each(obj, function(o) {
				if (tinymce.inArray(val, o.nodeName.toLowerCase()) != -1 && o.specified)
					count++;
			});

			return count == obj.length;
		};

		DOM.add(document.body, 'div', {id : 'test'});

		DOM.get('test').innerHTML = '<span id="test2" class="test"></span>';
		ok(check(DOM.getAttribs('test2'), 'id,class'));

		DOM.get('test').innerHTML = '<input id="test2" type="checkbox" name="test" value="1" disabled readonly checked></span>';
		ok(check(DOM.getAttribs('test2'), 'id,type,name,value,disabled,readonly,checked'), 'Expected attributed: type,name,disabled,readonly,checked');

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - setGetStyles', 7, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setStyle('test', 'font-size', '20px');
		equals(DOM.getStyle('test', 'font-size'), '20px', null, tinymce.isWebKit);

		DOM.setStyle('test', 'fontSize', '21px');
		equals(DOM.getStyle('test', 'fontSize'), '21px', null, tinymce.isWebKit);

		DOM.setStyles('test', {fontSize : '22px', display : 'inline'});
		equals(DOM.getStyle('test', 'fontSize'), '22px', null, tinymce.isWebKit);
		equals(DOM.getStyle('test', 'display'), 'inline', null, tinymce.isWebKit);

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.setStyles(['test2', 'test3', 'test4'], {fontSize : "22px"});
		equals(DOM.getStyle('test2', 'fontSize'), '22px');
		equals(DOM.getStyle('test3', 'fontSize'), '22px');
		equals(DOM.getStyle('test4', 'fontSize'), '22px');

		DOM.setAttrib('test', 'style', '');

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - getPos', 2, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setStyles('test', {position : 'absolute', left : 100, top : 110});
		equals(DOM.getPos('test').x, 100);
		equals(DOM.getPos('test').y, 110);

		DOM.setAttrib('test', 'style', '');

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - getParent', 6, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.get('test').innerHTML = '<div><span>ab<a id="test2" href="">abc</a>c</span></div>';

		equals(DOM.getParent('test2', function(n) {return n.nodeName == 'SPAN';}).nodeName, 'SPAN');
		equals(DOM.getParent('test2', function(n) {return n.nodeName == 'BODY';}).nodeName, 'BODY');
		equals(DOM.getParent('test2', function(n) {return n.nodeName == 'BODY';}, document.body), null);
		equals(DOM.getParent('test2', function(n) {return false;}), null);
		equals(DOM.getParent('test2', 'SPAN').nodeName, 'SPAN');
		equals(DOM.getParent('test2', 'body', DOM.get('test')), null);

		DOM.get('test').innerHTML = '';

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - getParents', 4, function() {
		DOM.add(document.body, 'div', {id : 'test'});
		DOM.get('test').innerHTML = '<div><span class="test">ab<span><a id="test2" href="">abc</a>c</span></span></div>';

		equals(DOM.getParents('test2', function(n) {return n.nodeName == 'SPAN';}).length, 2);
		equals(DOM.getParents('test2', 'span').length, 2);
		equals(DOM.getParents('test2', 'span.test').length, 1);
		equals(DOM.getParents('test2', 'body', DOM.get('test')).length, 0);

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - is', 2, function() {
		DOM.add(document.body, 'div', {id : 'test'});
		DOM.get('test').innerHTML = '<div><span class="test">ab<span><a id="test2" href="">abc</a>c</span></span></div>';

		ok(DOM.is(DOM.select('span', 'test'), 'span'));
		ok(DOM.is(DOM.select('#test2', 'test'), '#test2'));

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - getViewPort', 4, function() {
		var wp;

		wp = DOM.getViewPort();
		equals(wp.x, 0);
		equals(wp.y, 0);
		ok(wp.w > 0);
		ok(wp.h > 0);
	});

	test('tinymce.dom.DOMUtils - getRect', 5, function() {
		var r;

		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setStyles('test', {position : 'absolute', left : 100, top : 110, width : 320, height : 240});
		r = DOM.getRect('test');
		equals(r.x, 100);
		equals(r.y, 110);
		equals(r.w, 320);
		equals(r.h, 240);

		DOM.setAttrib('test', 'style', '');

		DOM.get('test').innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:50%;height:240px"></div></div>';
		r = DOM.getRect('test2');
		equals(r.w, 160);

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - getSize', 2, function() {
		var r;

		DOM.add(document.body, 'div', {id : 'test'});

		DOM.get('test').innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:50%;height:240px"></div></div>';
		r = DOM.getSize('test2');
		equals(r.w, 160);

		DOM.get('test').innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:100px;height:240px"></div></div>';
		r = DOM.getSize('test2');
		equals(r.w, 100);

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - getNext', 5, function() {
		var r;

		DOM.add(document.body, 'div', {id : 'test'});

		DOM.get('test').innerHTML = '<strong>A</strong><span>B</span><em>C</em>';
		equals(DOM.getNext(DOM.get('test').firstChild, '*').nodeName, 'SPAN');
		equals(DOM.getNext(DOM.get('test').firstChild, 'em').nodeName, 'EM');
		equals(DOM.getNext(DOM.get('test').firstChild, 'div'), null);
		equals(DOM.getNext(null, 'div'), null);
		equals(DOM.getNext(DOM.get('test').firstChild, function(n) {return n.nodeName == 'EM'}).nodeName, 'EM');

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - getPrev', 5, function() {
		var r;

		DOM.add(document.body, 'div', {id : 'test'});

		DOM.get('test').innerHTML = '<strong>A</strong><span>B</span><em>C</em>';
		equals(DOM.getPrev(DOM.get('test').lastChild, '*').nodeName, 'SPAN');
		equals(DOM.getPrev(DOM.get('test').lastChild, 'strong').nodeName, 'STRONG');
		equals(DOM.getPrev(DOM.get('test').lastChild, 'div'), null);
		equals(DOM.getPrev(null, 'div'), null);
		equals(DOM.getPrev(DOM.get('test').lastChild, function(n) {return n.nodeName == 'STRONG'}).nodeName, 'STRONG');

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - loadCSS', 1, function() {
		var c = 0;

		DOM.loadCSS('css/unit.css?a=1,css/unit.css?a=2,css/unit.css?a=3');

		tinymce.each(document.getElementsByTagName('link'), function(n) {
			if (n.href.indexOf('unit.css?a=') != -1)
				c++;
		});

		equals(c, 3, null, tinymce.isOpera);
	});

	test('tinymce.dom.DOMUtils - insertAfter', 2, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setHTML('test', '<span id="test2"></span>');
		DOM.insertAfter(DOM.create('br'), 'test2');
		equals(DOM.get('test2').nextSibling.nodeName, 'BR');

		DOM.setHTML('test', '<span>test</span><span id="test2"></span><span>test</span>');
		DOM.insertAfter(DOM.create('br'), 'test2');
		equals(DOM.get('test2').nextSibling.nodeName, 'BR');

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - isBlock', 4, function() {
		ok(DOM.isBlock(DOM.create('div')));
		ok(DOM.isBlock('DIV'));
		ok(!DOM.isBlock('SPAN'));
		ok(DOM.isBlock('div'));
	});

	test('tinymce.dom.DOMUtils - remove', 3, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		DOM.remove('test2', 1);
		equals(DOM.get('test').innerHTML.toLowerCase(), '<span>test</span><span>test2</span>');

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		equals(DOM.remove('test2').nodeName, 'SPAN');

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.remove(['test2', 'test4']);
		equals(DOM.select('span', 'test').length, 1);

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - replace', 2, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		DOM.replace(DOM.create('div', {id : 'test2'}), 'test2', 1);
		equals(DOM.get('test2').innerHTML.toLowerCase(), '<span>test</span><span>test2</span>');

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		DOM.replace(DOM.create('div', {id : 'test2'}), 'test2');
		equals(DOM.get('test2').innerHTML, '');

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - toHex', 5, function() {
		equals(DOM.toHex('rgb(0, 255, 255)'), '#00ffff');
		equals(DOM.toHex('rgb(255, 0, 0)'), '#ff0000');
		equals(DOM.toHex('rgb(0, 0, 255)'), '#0000ff');
		equals(DOM.toHex('rgb  (  0  , 0  , 255  )  '), '#0000ff');
		equals(DOM.toHex('   RGB  (  0  , 0  , 255  )  '), '#0000ff');
	});

	test('tinymce.dom.DOMUtils - getOuterHTML', 3, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		equals(DOM.getOuterHTML('test2').toLowerCase().replace(/\"/g, ''), '<span id=test2><span>test</span><span>test2</span></span>');

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		DOM.setOuterHTML('test2', '<div id="test2">123</div>');
		equals(tinymce.trim(DOM.getOuterHTML('test2') || '').toLowerCase().replace(/\"/g, ''), '<div id=test2>123</div>');

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		DOM.setOuterHTML('test2', '<div id="test2">123</div><div id="test3">abc</div>');
		equals(tinymce.trim(DOM.get('test').innerHTML).toLowerCase().replace(/>\s+</g, '><').replace(/\"/g, ''), '<div id=test2>123</div><div id=test3>abc</div>');

		DOM.remove('test');
	});

	test('tinymce.dom.DOMUtils - encodeDecode', 2, function() {
		equals(DOM.encode('åäö&<>"'), 'åäö&amp;&lt;&gt;&quot;');
		equals(DOM.decode('&aring;&auml;&ouml;&amp;&lt;&gt;&quot;'), 'åäö&<>"');
	});

	test('tinymce.dom.DOMUtils - split', 1, function() {
		var point, parent;

		DOM.add(document.body, 'div', {id : 'test'}, '<p><b>text1<span>inner</span>text2</b></p>');

		parent = DOM.select('p', DOM.get('test'))[0];
		point = DOM.select('span', DOM.get('test'))[0];

		DOM.split(parent, point);
		equals(DOM.get('test').innerHTML.toLowerCase().replace(/\s+/g, ''), '<p><b>text1</b></p><span>inner</span><p><b>text2</b></p>');

		DOM.remove('test');
	});

	DOM.remove('test');
})();

(function() {
	var Event = tinymce.dom.Event, DOM = new tinymce.dom.DOMUtils(document, {keep_values : true});

	test('tinymce.dom.Event - addRemove', 2, function() {
		var c = 0;

		DOM.add(document.body, 'div', {id : 'test'});
		DOM.get('test').innerHTML = '<span id="test2"></span>';

		function mouseCheck(e) {
			if (e.clientX == 10 || e.clientX == 101)
				c++;
		};

		function mouseCheckCancel(e) {
			if (e.clientX == 101)
				return Event.cancel(e);
		};

		function keyCheck(e) {
			if (e.keyCode == 13)
				c++;
		};

		Event.add('test2', 'click', mouseCheckCancel);
		Event.add('test', 'click', mouseCheck);
		fakeMouseEvent('test', 'click', {clientX : 10});
		fakeMouseEvent('test2', 'click', {clientX : 101});

		Event.add('test', 'keydown', keyCheck);
		fakeKeyEvent('test', 'keydown', {keyCode : 13});

		equals(c, 2, '[%d] Event count doesn\'t add up. Value: %d should be %d.', tinymce.isWebKit);

		c = 0;
		Event.remove('test', 'click', mouseCheck);
		Event.remove('test', 'keydown', keyCheck);
		fakeMouseEvent('test', 'click', {clientX : 10});
		fakeKeyEvent('test', 'keydown', {keyCode : 13});

		equals(c, 0, '[%d] Event count doesn\'t add up. Value: %d should be %d.', tinymce.isWebKit);

		DOM.remove('test');
	});
})();

(function() {
	var Dispatcher = tinymce.util.Dispatcher;

	test('tinymce.util.Dispatcher - dispatcher', 5, function() {
		var ev, v, f;

		ev = new Dispatcher();
		ev.add(function(a, b, c) {
			v = a + b + c;
		});
		ev.dispatch(1, 2, 3);
		equals(v, 6);

		ev = new Dispatcher();
		v = 0;
		f = ev.add(function(a, b, c) {
			v = a + b + c;
		});
		ev.remove(f);
		ev.dispatch(1, 2, 3);
		equals(v, 0);

		ev = new Dispatcher({test : 1});
		v = 0;
		f = ev.add(function(a, b, c) {
			v = a + b + c + this.test;
		});
		ev.dispatch(1, 2, 3);
		equals(v, 7);

		ev = new Dispatcher();
		v = 0;
		f = ev.add(function(a, b, c) {
			v = a + b + c + this.test;
		}, {test : 1});
		ev.dispatch(1, 2, 3);
		equals(v, 7);

		ev = new Dispatcher();
		v = '';
		f = ev.add(function(a, b, c) {
			v += 'b';
		}, {test : 1});
		f = ev.addToTop(function(a, b, c) {
			v += 'a';
		}, {test : 1});
		ev.dispatch();
		equals(v, 'ab');
	});
})();

(function() {
	var Cookie = tinymce.util.Cookie;

	test('tinymce.util.Cookie - cookie', 4, function() {
		var f = document.location.protocol == 'file:';

		Cookie.set('test', 'test123');
		equals(Cookie.get('test'), 'test123', null, f);

		Cookie.set('test', 'test1234');
		equals(Cookie.get('test'), 'test1234', null, f);

		Cookie.setHash('test', {a : 1, b : 2});
		ok(Cookie.getHash('test') ? Cookie.getHash('test').b == 2 : null, null, f);

		Cookie.setHash('test', {a : 1, b : 3});
		ok(Cookie.getHash('test') ? Cookie.getHash('test').b == 3 : null, null, f);
	});
})();

(function() {
	var JSON = tinymce.util.JSON;

	test('tinymce.util.JSON - serialize', 1, function() {
		equals(JSON.serialize({arr1 : [1, 2, 3, [1, 2, 3]], bool1 : true, float1: 3.14, int1 : 123, null1 : null, obj1 : {key1 : "val1", key2 : "val2"}, str1 : 'abc\u00C5123'}), '{"arr1":[1,2,3,[1,2,3]],"bool1":true,"float1":3.14,"int1":123,"null1":null,"obj1":{"key1":"val1","key2":"val2"},"str1":"abc\\u00c5123"}');
	});

	test('tinymce.util.JSON - parse', 1, function() {
		equals(JSON.parse('{"arr1":[1,2,3,[1,2,3]],"bool1":true,"float1":3.14,"int1":123,"null1":null,"obj1":{"key1":"val1","key2":"val2"},"str1":"abc\\u00c5123"}').str1, 'abc\u00c5123');
	});
})();

(function() {
	var URI = tinymce.util.URI;

	test('tinymce.util.URI - parseFullURLs', 2, function() {
		equals(new URI('http://abc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash').getURI(), 'http://abc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash');
		ok(new URI('http://a2bc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash').getURI() != 'http://abc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash');
	});

	test('tinymce.util.URI - relativeURLs', 26, function() {
		equals(new URI('http://www.site.com/dir1/dir2/file.html').toRelative('http://www.site.com/dir1/dir3/file.html'), '../dir3/file.html');
		equals(new URI('http://www.site.com/dir1/dir2/file.html').toRelative('http://www.site.com/dir3/dir4/file.html'), '../../dir3/dir4/file.html');
		equals(new URI('http://www.site.com/dir1/').toRelative('http://www.site.com/dir1/dir3/file.htm'), 'dir3/file.htm');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('http://www.site2.com/dir1/dir3/file.htm'), 'http://www.site2.com/dir1/dir3/file.htm');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('http://www.site.com:8080/dir1/dir3/file.htm'), 'http://www.site.com:8080/dir1/dir3/file.htm');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('https://www.site.com/dir1/dir3/file.htm'), 'https://www.site.com/dir1/dir3/file.htm');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm'), '../../file.htm');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm?id=1#a'), '../../file.htm?id=1#a');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('mailto:test@test.com'), 'mailto:test@test.com');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('news:test'), 'news:test');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('javascript:void(0);'), 'javascript:void(0);');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('about:blank'), 'about:blank');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('#test'), '#test');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('test.htm'), 'test.htm');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('http://www.site.com/dir1/dir2/test.htm'), 'test.htm');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('dir2/test.htm'), 'dir2/test.htm');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('../dir2/test.htm'), 'test.htm');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('../dir3/'), '../dir3/');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('../../../../../../test.htm'), '../../test.htm');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('//www.site.com/test.htm'), '../../test.htm');
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('@@tinymce'), '@@tinymce'); // Zope 3 URL
		equals(new URI('http://www.site.com/dir1/dir2/').toRelative('../@@tinymce'), '../@@tinymce'); // Zope 3 URL
		equals(new URI('http://www.site.com/').toRelative('dir2/test.htm'), 'dir2/test.htm');
		equals(new URI('http://www.site.com/').toRelative('./'), './');
		equals(new URI('http://www.site.com/test/').toRelative('../'), '../');
		equals(new URI('http://www.site.com/test/test/').toRelative('../'), '../');
	});

	test('tinymce.util.URI - absoluteURLs', 17, function() {
		equals(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../dir3'), 'http://www.site.com/dir1/dir3');
		equals(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../dir3', 1), '/dir1/dir3');
		equals(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../../../../dir3'), 'http://www.site.com/dir3');
		equals(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../abc/def/../../abc/../dir3/file.htm'), 'http://www.site.com/dir1/dir3/file.htm');
		equals(new URI('http://www.site.com/dir1/dir2/').toAbsolute('http://www.site.com/dir2/dir3'), 'http://www.site.com/dir2/dir3');
		equals(new URI('http://www.site2.com/dir1/dir2/').toAbsolute('http://www.site2.com/dir2/dir3'), 'http://www.site2.com/dir2/dir3');
		equals(new URI('http://www.site.com/dir1/dir2/').toAbsolute('mailto:test@test.com'), 'mailto:test@test.com');
		equals(new URI('http://www.site.com/dir1/dir2/').toAbsolute('news:test'), 'news:test');
		equals(new URI('http://www.site.com/dir1/dir2/').toAbsolute('javascript:void(0);'), 'javascript:void(0);');
		equals(new URI('http://www.site.com/dir1/dir2/').toAbsolute('about:blank'), 'about:blank');
		equals(new URI('http://www.site.com/dir1/dir2/').toAbsolute('#test'), '#test');
		equals(new URI('http://www.site.com/dir1/dir2/').toAbsolute('test.htm'), 'http://www.site.com/dir1/dir2/test.htm');
		equals(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../@@tinymce'), 'http://www.site.com/dir1/@@tinymce'); // Zope 3 URL
		equals(new URI('http://www.site.com/dir1/dir2/').getURI(), 'http://www.site.com/dir1/dir2/');
		equals(new URI('http://www.site.com/dir1/dir2/').toAbsolute('/dir1/dir1/'), 'http://www.site.com/dir1/dir1/');
		equals(new URI('http://www.site.com/dir1/dir2/').toAbsolute('https://www.site.com/dir1/dir2/', true), 'https://www.site.com/dir1/dir2/');
		equals(new URI('http://www.site.com/dir1/dir2/').toAbsolute('http://www.site.com/dir1/dir2/', true), '/dir1/dir2/');
	});

	test('tinymce.util.URI - strangeURLs', 3, function() {
		equals(new URI('//www.site.com').getURI(), '//www.site.com');
		equals(new URI('mailto:test@test.com').getURI(), 'mailto:test@test.com');
		equals(new URI('news:somegroup').getURI(), 'news:somegroup');
	});
})();

/*
(function() {
	var Parser = tinymce.xml.Parser;

	test('tinymce.util.Parser - parser', 3, function() {
		var f = document.location.protocol == 'file:', p, d;

		p = new Parser({async : false});
		p.load('test.xml', function(d) {
			equals(d.getElementsByTagName('tag').length, 1);
		});

		p = new Parser({async : false});
		p.load('test.xml', function(d) {
			equals(tinymce.trim(p.getText(d.getElementsByTagName('tag')[0])), 'ÅÄÖ');
		});

		p = new Parser({async : false});
		d = p.loadXML('<root><tag>ÅÄÖ</tag></root>');
		equals(tinymce.trim(p.getText(d.getElementsByTagName('tag')[0])), 'ÅÄÖ');
	});
})();
*/

tinymce.dom.Event.add(window, 'load', function() {
	// IE6 chokes if you stress it
	window.setTimeout(function() {
		QUnit.start();
	}, 1);
});
