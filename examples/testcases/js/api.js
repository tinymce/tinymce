(function() {
	unitTester.add('tinymce', {
		is : function() {
			var t = this;

			t.is(!tinymce.is(null, 'test'));
			t.is(!tinymce.is('', 'test'));
			t.is(tinymce.is('', 'string'));
			t.is(tinymce.is(3, 'number'));
			t.is(tinymce.is(3.1, 'number'));
			t.is(tinymce.is([], 'array'));
			t.is(tinymce.is({}, 'object'));
			t.is(tinymce.is(window.abc, 'undefined'));
			t.is(!tinymce.is(window.abc));
		},

		each : function() {
			var t = this, c;

			c = 0;
			tinymce.each([1, 2, 3], function(v) {
				c += v;
			});
			t.eq(c, 6);

			c = 0;
			tinymce.each([1, 2, 3], function(v, i) {
				c += i;
			});
			t.eq(c, 3);

			c = 0;
			tinymce.each({a : 1, b : 2, c : 3}, function(v, i) {
				c += v;
			});
			t.eq(c, 6);

			c = '';
			tinymce.each({a : 1, b : 2, c : 3}, function(v, k) {
				c += k;
			});
			t.eq(c, 'abc');

			c = 0;
			tinymce.each(null, function(v) {
				c += v;
			});
			t.eq(c, 0);

			c = 0;
			tinymce.each(1, function(v) {
				c += v;
			});
			t.eq(c, 0);
		},

		map : function() {
			var t = this, c;

			c = tinymce.map([1,2,3], function(v) {
				return v + 1;
			});
			t.eq(c.join(','), '2,3,4');
		},

		grep : function() {
			var t = this, c;

			c = tinymce.grep([1,2,3,4], function(v) {
				return v > 2;
			});
			t.eq(c.join(','), '3,4');

			c = [1,2,3,4];
			c.test = 1
			c = tinymce.grep(c);
			t.is(!c.test);
			t.eq(c.join(','), '1,2,3,4');
		},

		explode : function() {
			var t = this, c;

			t.eq(tinymce.explode(' a, b, c ').join(','), 'a,b,c');
			t.eq(tinymce.explode(' a;  b; c ', ';').join(','), 'a,b,c');
		},

		inArray : function() {
			var t = this;

			t.eq(tinymce.inArray([1,2,3], 2), 1);
			t.eq(tinymce.inArray([1,2,3], 7), -1);
			t.eq(tinymce.inArray({a : 1, b : 2, c : 3}, 2), -1);
			t.eq(tinymce.inArray(null, 7), -1);
		},

		extend : function() {
			var t = this, o;

			o = tinymce.extend({
				a : 1,
				b : 2,
				c : 3
			}, {
				a : 2,
				d : 4
			});

			t.eq(o.a, 2);
			t.eq(o.b, 2);
			t.eq(o.d, 4);

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

			t.eq(o.d, 4);
			t.eq(o.e, 5);
		},

		trim : function() {
			var t = this;

			t.eq(tinymce.trim('a'), 'a');
			t.eq(tinymce.trim(' \r  a'), 'a');
			t.eq(tinymce.trim('a  \n  '), 'a');
			t.eq(tinymce.trim('   a  \t  '), 'a');
			t.eq(tinymce.trim(null), '');
		},

		create : function() {
			var t = this, o;

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
			t.eq(o.c, 4);
			o.method1();
			t.eq(o.c, 5);

			o = new tinymce.Test2(3);
			t.eq(o.c, 6);
			o.method1();
			t.eq(o.c, 8);
			o.method2();
			t.eq(o.c, 11);
	
			o = new tinymce.Test3(3);
			t.eq(o.c, 10);
			o.method1();
			t.eq(o.c, 12);
			o.method2();
			t.eq(o.c, 18);

			o = new tinymce.Test4(3);
			t.eq(o.c, 10);
			o.method1();
			t.eq(o.c, 12);
			o.method2();
			t.eq(o.c, 21);
			t.eq(tinymce.Test4.method3(), 3);

			t.eq(tinymce.Test5.method1(), 3);
		},

		walk : function() {
			var t = this, c;

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
			t.eq(c, 36);

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
			t.eq(c, 27);

			c = 0;
			tinymce.walk(null);
			t.eq(c, 0);
		},

		createNS : function() {
			var t = this;

			tinymce.createNS('a.b.c.d.e');
			a.b.c.d.e.x = 1;
			tinymce.createNS('a.b.c.d.e.f');
			a.b.c.d.e.f = 2;
			t.eq(a.b.c.d.e.x, 1);
			t.eq(a.b.c.d.e.f, 2);
		},

		get : function() {
			var t = this;

			tinymce.createNS('a.b.c.d.e');
			a.b.c.d.e.x = 1;
			t.eq(tinymce.resolve('a.b.c.d.e.x'), 1);
			t.is(!tinymce.resolve('a.b.c.d.e.y'));
		}
	});
})();

(function() {
	var DOM = new tinymce.dom.DOMUtils(document, {keep_values : true});

	unitTester.add('tinymce.dom.DOMUtils', {
		setup : function() {
			DOM.add(document.body, 'div', {id : 'test'});
		},

		parseStyle : function() {
			var t = this, dom;

			dom = new tinymce.dom.DOMUtils(document, {hex_colors : true, keep_values : true, url_converter : function(u, n, e) {
				return 'X' + u + 'Y';
			}});

			t.eq(
				dom.serializeStyle(dom.parseStyle('border: 1px solid red; color: green')),
				'border: 1px solid red; color: green;'
			);

			t.eq(
				dom.serializeStyle(dom.parseStyle('border: 1px solid rgb(0, 255, 255); color: green')),
				'border: 1px solid #00ffff; color: green;'
			);

			t.eq(
				dom.serializeStyle(dom.parseStyle('border-top: 1px solid red; border-left: 1px solid red; border-bottom: 1px solid red; border-right: 1px solid red;')),
				'border: 1px solid red;'
			);

			t.eq(
				dom.serializeStyle(dom.parseStyle('background: transparent url(test.gif);')),
				'background: transparent url(Xtest.gifY);'
			);

			t.eq(
				dom.serializeStyle(dom.parseStyle('background: transparent url(http://www.site.com/test.gif?a=1&b=2);')),
				'background: transparent url(Xhttp://www.site.com/test.gif?a=1&b=2Y);'
			);

			dom.setHTML('test', '<span id="test2" style="border: 1px solid #00ff00;"></span>');
			t.eq(dom.getAttrib('test2', 'style'), 'border: 1px solid #00ff00;');

			dom.setHTML('test', '<span id="test2" style="background-image: url(test.gif);"></span>');
			t.eq(dom.getAttrib('test2', 'style'), 'background-image: url(Xtest.gifY);');

			dom.get('test').innerHTML = '<span id="test2" style="border: 1px solid #00ff00"></span>';
			t.eq(dom.getAttrib('test2', 'style'), tinymce.isIE ? 'border: #00ff00 1px solid;' : 'border: 1px solid #00ff00;'); // IE has a separate output

			dom.get('test').innerHTML = '<span id="test2" style="background-image: url(http://www.site.com/test.gif);"></span>';
			t.eq(dom.getAttrib('test2', 'style'), 'background-image: url(Xhttp://www.site.com/test.gifY);');

			// Cleanup
			dom.get('test').innerHTML = '';
		},

		addClass : function() {
			var t = this;

			DOM.get('test').className = '';
			DOM.addClass('test', 'abc');
			t.eq(DOM.get('test').className, 'abc');

			DOM.get('test').className = '';
			t.eq(DOM.addClass('test', 'abc'), 'abc');
			t.eq(DOM.addClass(null, 'abc'), false);

			DOM.addClass('test', '123');
			t.eq(DOM.get('test').className, 'abc 123');

			DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
			DOM.addClass(DOM.select('span', 'test'), 'abc');
			t.eq(DOM.get('test2').className, 'abc');
			t.eq(DOM.get('test3').className, 'abc');
			t.eq(DOM.get('test4').className, 'abc');
			DOM.get('test').innerHTML = '';

			DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
			DOM.addClass(['test2', 'test3', 'test4'], 'abc');
			t.eq(DOM.get('test2').className, 'abc');
			t.eq(DOM.get('test3').className, 'abc');
			t.eq(DOM.get('test4').className, 'abc');
			DOM.get('test').innerHTML = '';
		},

		removeClass : function() {
			var t = this;

			DOM.get('test').className = 'abc 123 xyz';
			DOM.removeClass('test', '123');
			t.eq(DOM.get('test').className, 'abc xyz');

			DOM.get('test').innerHTML = '<span id="test2" class="test1"></span><span id="test3" class="test test1 test"></span><span id="test4" class="test1 test"></span>';
			DOM.removeClass(DOM.select('span', 'test'), 'test1');
			t.eq(DOM.get('test2').className, '');
			t.eq(DOM.get('test3').className, 'test test');
			t.eq(DOM.get('test4').className, 'test');
			DOM.get('test').innerHTML = '';
		},

		hasClass : function() {
			var t = this;

			DOM.get('test').className = 'abc 123 xyz';
			t.is(DOM.hasClass('test', 'abc'));
			t.is(DOM.hasClass('test', '123'));
			t.is(DOM.hasClass('test', 'xyz'));
			t.is(!DOM.hasClass('test', 'aaa'));

			DOM.get('test').className = 'abc';
			t.is(DOM.hasClass('test', 'abc'));
	
			DOM.get('test').className = 'aaa abc';
			t.is(DOM.hasClass('test', 'abc'));

			DOM.get('test').className = 'abc aaa';
			t.is(DOM.hasClass('test', 'abc'));
		},

		add : function() {
			var t = this, e;

			DOM.add('test', 'span', {'class' : 'abc 123'}, 'content <b>abc</b>');
			e = DOM.get('test').getElementsByTagName('span')[0];
			t.eq(e.className, 'abc 123');
			t.eq(e.innerHTML.toLowerCase(), 'content <b>abc</b>');
			DOM.remove(e);

			DOM.add('test', 'span', {'class' : 'abc 123'});
			e = DOM.get('test').getElementsByTagName('span')[0];
			t.eq(e.className, 'abc 123');
			DOM.remove(e);

			DOM.add('test', 'span');
			e = DOM.get('test').getElementsByTagName('span')[0];
			t.eq(e.nodeName, 'SPAN');
			DOM.remove(e);

			DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
			DOM.add(['test2', 'test3', 'test4'], 'span', {'class' : 'abc 123'});
			t.eq(DOM.select('span', 'test').length, 6);
		},

		create : function() {
			var t = this, e;

			e = DOM.create('span', {'class' : 'abc 123'}, 'content <b>abc</b>');

			t.eq(e.nodeName, 'SPAN');
			t.eq(e.className, 'abc 123');
			t.eq(e.innerHTML.toLowerCase(), 'content <b>abc</b>');
		},

		createHTML : function() {
			var t = this;

			t.eq(DOM.createHTML('span', {'id' : 'id1', 'class' : 'abc 123'}, 'content <b>abc</b>'), '<span id="id1" class="abc 123">content <b>abc</b></span>');
			t.eq(DOM.createHTML('span', {'id' : 'id1', 'class' : 'abc 123'}), '<span id="id1" class="abc 123" />');
			t.eq(DOM.createHTML('span'), '<span />');
			t.eq(DOM.createHTML('span', null, 'content <b>abc</b>'), '<span>content <b>abc</b></span>');
		},

		uniqueId : function() {
			var t = this;

			DOM.counter = 0;
			t.eq(DOM.uniqueId(), 'mce_0');
			t.eq(DOM.uniqueId(), 'mce_1');
			t.eq(DOM.uniqueId(), 'mce_2');
		},

		showHide : function() {
			var t = this;

			DOM.show('test');
			t.eq(DOM.get('test').style.display, 'block');
			t.is(!DOM.isHidden('test'));

			DOM.hide('test');
			t.eq(DOM.get('test').style.display, 'none');
			t.is(DOM.isHidden('test'));

			DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
			DOM.hide(['test2', 'test3', 'test4'], 'test');
			t.eq(DOM.get('test2').style.display, 'none');
			t.eq(DOM.get('test3').style.display, 'none');
			t.eq(DOM.get('test4').style.display, 'none');

			DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
			DOM.show(['test2', 'test3', 'test4'], 'test');
			t.eq(DOM.get('test2').style.display, 'block');
			t.eq(DOM.get('test3').style.display, 'block');
			t.eq(DOM.get('test4').style.display, 'block');

			// Cleanup
			DOM.setAttrib('test', 'style', '');
		},

		select : function() {
			var t = this;

			DOM.setHTML('test', '<div>test 1</div><div>test 2 <div>test 3</div></div><div>test 4</div>');
			t.eq(DOM.select('div', 'test').length, 4);
			t.is(DOM.select('div', 'test').reverse);

			DOM.setHTML('test', '<div class="test1 test2 test3">test 1</div><div class="test2">test 2 <div>test 3</div></div><div>test 4</div>')
			t.eq(DOM.select('div.test2', 'test').length, 2);

			DOM.setHTML('test', '<div class="test1 test2 test3">test 1</div><div class="test2">test 2 <div>test 3</div></div><div>test 4</div>')
			t.eq(DOM.select('div div', 'test').length, 1, null, tinymce.isWebKit); // Issue: http://bugs.webkit.org/show_bug.cgi?id=17461
			//alert(DOM.select('div div', 'test').length +","+DOM.get('test').querySelectorAll('div div').length);
		},

		encode : function() {
			var t = this;

			t.eq(DOM.encode('abc<>"&\'והצ'), 'abc&lt;&gt;&quot;&amp;\'והצ');
		},

		setGetAttrib : function() {
			var t = this, dom;

			DOM.setAttrib('test', 'class', 'test 123');
			t.eq(DOM.getAttrib('test', 'class'), 'test 123');

			DOM.setAttrib('test', 'src', 'url');
			t.eq(DOM.getAttrib('test', 'src'), 'url');
			t.eq(DOM.getAttrib('test', 'mce_src'), 'url');
			t.eq(DOM.getAttrib('test', 'abc'), '');

			DOM.setAttribs('test', {'class' : '123', title : 'abc'});
			t.eq(DOM.getAttrib('test', 'class'), '123');
			t.eq(DOM.getAttrib('test', 'title'), 'abc');

			dom = new tinymce.dom.DOMUtils(document, {keep_values : true, url_converter : function(u, n, e) {
				return '&<>"' + u + '&<>"' + n;
			}});

			dom.setAttribs('test', {src : '123', href : 'abc'});
			t.eq(DOM.getAttrib('test', 'src'), '&<>"123&<>"src');
			t.eq(DOM.getAttrib('test', 'href'), '&<>"abc&<>"href');

			DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
			DOM.setAttribs(['test2', 'test3', 'test4'], {test1 : "1", test2 : "2"});
			t.eq(DOM.getAttrib('test2', 'test1'), '1');
			t.eq(DOM.getAttrib('test3', 'test2'), '2');
			t.eq(DOM.getAttrib('test4', 'test1'), '1');
		},

		setGetStyles : function() {
			var t = this;

			DOM.setStyle('test', 'font-size', '20px');
			t.eq(DOM.getStyle('test', 'font-size'), '20px', null, tinymce.isWebKit);

			DOM.setStyle('test', 'fontSize', '21px');
			t.eq(DOM.getStyle('test', 'fontSize'), '21px', null, tinymce.isWebKit);

			DOM.setStyles('test', {fontSize : '22px', display : 'inline'});
			t.eq(DOM.getStyle('test', 'fontSize'), '22px', null, tinymce.isWebKit);
			t.eq(DOM.getStyle('test', 'display'), 'inline', null, tinymce.isWebKit);

			DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
			DOM.setStyles(['test2', 'test3', 'test4'], {fontSize : "22px"});
			t.eq(DOM.getStyle('test2', 'fontSize'), '22px');
			t.eq(DOM.getStyle('test3', 'fontSize'), '22px');
			t.eq(DOM.getStyle('test4', 'fontSize'), '22px');

			DOM.setAttrib('test', 'style', '');
		},

		getPos : function() {
			var t = this;

			DOM.setStyles('test', {position : 'absolute', left : 100, top : 110});
			t.eq(DOM.getPos('test').x, 100);
			t.eq(DOM.getPos('test').y, 110);

			DOM.setAttrib('test', 'style', '');
		},

		getParent : function() {
			var t = this;

			DOM.get('test').innerHTML = '<div><span>ab<a id="test2" href="">abc</a>c</span></div>';

			t.eq(DOM.getParent('test2', function(n) {return n.nodeName == 'SPAN';}).nodeName, 'SPAN');
			t.eq(DOM.getParent('test2', function(n) {return n.nodeName == 'BODY';}).nodeName, 'BODY');
			t.eq(DOM.getParent('test2', function(n) {return n.nodeName == 'BODY';}, document.body), null);
			t.eq(DOM.getParent('test2', function(n) {return false;}), null);
			t.eq(DOM.getParent('test2', 'SPAN').nodeName, 'SPAN');

			DOM.get('test').innerHTML = '';
		},

		getViewPort : function() {
			var t = this, wp;

			wp = DOM.getViewPort();
			t.eq(wp.x, 0);
			t.eq(wp.y, 0);
			t.is(wp.w > 0);
			t.is(wp.h > 0);
		},

		getRect : function() {
			var t = this, r;

			DOM.setStyles('test', {position : 'absolute', left : 100, top : 110, width : 320, height : 240});
			r = DOM.getRect('test');
			t.eq(r.x, 100);
			t.eq(r.y, 110);
			t.eq(r.w, 320);
			t.eq(r.h, 240);

			DOM.setAttrib('test', 'style', '');

			DOM.get('test').innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:50%;height:240px"></div></div>';
			r = DOM.getRect('test2');
			t.eq(r.w, 160);

			DOM.get('test').innerHTML = '';
		},

		getSize : function() {
			var t = this, r;

			DOM.get('test').innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:50%;height:240px"></div></div>';
			r = DOM.getSize('test2');
			t.eq(r.w, 160);

			DOM.get('test').innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:100px;height:240px"></div></div>';
			r = DOM.getSize('test2');
			t.eq(r.w, 100);

			DOM.get('test').innerHTML = '';
		},

		loadCSS : function() {
			var t = this, c = 0;

			DOM.loadCSS('css/unit.css?a=1,css/unit.css?a=2,css/unit.css?a=3');

			tinymce.each(document.getElementsByTagName('link'), function(n) {
				if (n.href.indexOf('unit.css?a=') != -1)
					c++;
			});

			t.eq(c, 3, null, tinymce.isOpera);
		},

		insertAfter : function() {
			var t = this;

			DOM.setHTML('test', '<span id="test2"></span>');
			DOM.insertAfter(DOM.create('br'), 'test2');
			t.eq(DOM.get('test2').nextSibling.nodeName, 'BR');

			DOM.setHTML('test', '<span>test</span><span id="test2"></span><span>test</span>');
			DOM.insertAfter(DOM.create('br'), 'test2');
			t.eq(DOM.get('test2').nextSibling.nodeName, 'BR');

			DOM.setHTML('test', '');
		},

		isBlock : function() {
			var t = this;

			t.is(DOM.isBlock(DOM.create('div')));
			t.is(DOM.isBlock('DIV'));
			t.is(!DOM.isBlock('SPAN'));
			t.is(!DOM.isBlock('div'));
		},

		remove : function() {
			var t = this;

			DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
			DOM.remove('test2', 1);
			t.eq(DOM.get('test').innerHTML.toLowerCase(), '<span>test</span><span>test2</span>');

			DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
			t.eq(DOM.remove('test2').nodeName, 'SPAN');

			DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
			DOM.remove(['test2', 'test4']);
			t.eq(DOM.select('span', 'test').length, 1);

			DOM.setHTML('test', '');
		},

		replace : function() {
			var t = this;

			DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
			DOM.replace(DOM.create('div', {id : 'test2'}), 'test2', 1);
			t.eq(DOM.get('test2').innerHTML.toLowerCase(), '<span>test</span><span>test2</span>');

			DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
			DOM.replace(DOM.create('div', {id : 'test2'}), 'test2');
			t.eq(DOM.get('test2').innerHTML, '');

			DOM.setHTML('test', '');
		},

		toHex : function() {
			var t = this;

			t.eq(DOM.toHex('rgb(0, 255, 255)'), '#00ffff');
			t.eq(DOM.toHex('rgb(255, 0, 0)'), '#ff0000');
			t.eq(DOM.toHex('rgb(0, 0, 255)'), '#0000ff');
			t.eq(DOM.toHex('rgb  (  0  , 0  , 255  )  '), '#0000ff');
			t.eq(DOM.toHex('   RGB  (  0  , 0  , 255  )  '), '#0000ff');
		},

		getOuterHTML : function() {
			var t = this;

			DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
			t.eq(DOM.getOuterHTML('test2').toLowerCase(), tinymce.isIE ? '<span id=test2><span>test</span><span>test2</span></span>' : '<span id="test2"><span>test</span><span>test2</span></span>');

			DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
			DOM.setOuterHTML('test2', '<div id="test2">123</div>');
			t.eq(tinymce.trim(DOM.getOuterHTML('test2') || '').toLowerCase(), tinymce.isIE ? '<div id=test2>123</div>' : '<div id="test2">123</div>', null, tinymce.isOldWebKit);

			DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
			DOM.setOuterHTML('test2', '<div id="test2">123</div><div id="test3">abc</div>');
			t.eq(tinymce.trim(DOM.get('test').innerHTML).toLowerCase().replace(/>\s+</g, '><'), tinymce.isIE ? '<div id=test2>123</div><div id=test3>abc</div>' : '<div id="test2">123</div><div id="test3">abc</div>');

			DOM.setHTML('test', '');
		},

		processHTML : function() {
			var t = this, dom;

			dom = new tinymce.dom.DOMUtils(document, {hex_colors : true, keep_values : true, url_converter : function(u) {
				return '&<>"' + u + '&<>"';
			}});

			t.eq(
				dom.processHTML('<span style="background-image:url(\'http://www.somesite.com\');">test</span>'),
				'<span style="background-image:url(\'http://www.somesite.com\');" mce_style="background-image:url(\'http://www.somesite.com\');">test</span>'
			);

			t.eq(
				dom.processHTML('test1 <strong>test2</strong> <strong id="test1">test3</strong> <em>test2</em> <em id="test2">test3</em>'),
				tinymce.isGecko ? 'test1 <b>test2</b> <b id="test1">test3</b> <i>test2</i> <i id="test2">test3</i>' : 'test1 <strong>test2</strong> <strong id="test1">test3</strong> <em>test2</em> <em id="test2">test3</em>'
			);

			t.eq(
				dom.processHTML('some content <img src="some.gif" /> some more content <a href="somelink.htm">link</a>'),
				'some content <img src="some.gif" mce_src="&amp;&lt;&gt;&quot;some.gif&amp;&lt;&gt;&quot;" /> some more content <a href="somelink.htm" mce_href="&amp;&lt;&gt;&quot;somelink.htm&amp;&lt;&gt;&quot;">link</a>'
			);

			t.eq(
				dom.processHTML('some content <img src=some.gif /> some more content <a href=somelink.htm>link</a>'),
				'some content <img src="some.gif" mce_src="&amp;&lt;&gt;&quot;some.gif&amp;&lt;&gt;&quot;" /> some more content <a href="somelink.htm" mce_href="&amp;&lt;&gt;&quot;somelink.htm&amp;&lt;&gt;&quot;">link</a>'
			);

			t.eq(
				dom.processHTML("some content <img src='some.gif' /> some more content <a href='somelink.htm'>link</a>"),
				'some content <img src="some.gif" mce_src="&amp;&lt;&gt;&quot;some.gif&amp;&lt;&gt;&quot;" /> some more content <a href="somelink.htm" mce_href="&amp;&lt;&gt;&quot;somelink.htm&amp;&lt;&gt;&quot;">link</a>'
			);

			t.eq(
				dom.processHTML('some content <img src="some.gif" mce_src="&amp;&lt;&gt;&quot;some.gif&amp;&lt;&gt;&quot;" /> some more content <a href="somelink.htm" mce_href="&amp;&lt;&gt;&quot;somelink.htm&amp;&lt;&gt;&quot;">link</a>'),
				'some content <img src="some.gif" mce_src="&amp;&lt;&gt;&quot;some.gif&amp;&lt;&gt;&quot;" /> some more content <a href="somelink.htm" mce_href="&amp;&lt;&gt;&quot;somelink.htm&amp;&lt;&gt;&quot;">link</a>'
			);

			t.eq(
				dom.processHTML('<span style="border-left-color: rgb(0, 255, 255); border-top-color: rgb(0, 255, 255);"></span>'),
				'<span style="border-left-color: rgb(0, 255, 255); border-top-color: rgb(0, 255, 255);" mce_style="border-left-color: #00ffff; border-top-color: #00ffff;"></span>'
			);

			t.eq(
				dom.processHTML('<span style="background: url(test.gif);"></span>'),
				'<span style="background: url(test.gif);" mce_style="background: url(&amp;&lt;&gt;&quot;test.gif&amp;&lt;&gt;&quot;);"></span>'
			);

			t.eq(
				dom.processHTML('<a href="test.html"/>'),
				'<a href="test.html" mce_href="&amp;&lt;&gt;&quot;test.html&amp;&lt;&gt;&quot;"></a>'
			);

			t.eq(
				dom.processHTML('<a/>'),
				'<a></a>'
			);
		},

		encodeDecode : function() {
			var t = this;

			t.eq(DOM.encode('והצ&<>"'), 'והצ&amp;&lt;&gt;&quot;');
			t.eq(DOM.decode('&aring;&auml;&ouml;&amp;&lt;&gt;&quot;'), 'והצ&<>"');
		},

		teardown : function() {
			DOM.remove('test');
		}
	});
})();

(function() {
	var Event = tinymce.dom.Event, DOM = new tinymce.dom.DOMUtils(document, {keep_values : true});

	unitTester.add('tinymce.dom.Event', {
		setup : function() {
			DOM.add(document.body, 'div', {id : 'test'});
		},

		addRemove : function() {
			var t = this, c = 0;

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
			t.fakeMouseEvent('test', 'click', {clientX : 10});
			t.fakeMouseEvent('test2', 'click', {clientX : 101});

			Event.add('test', 'keydown', keyCheck);
			t.fakeKeyEvent('test', 'keydown', {keyCode : 13});

			t.eq(c, 2, '[%d] Event count doesn\'t add up. Value: %d should be %d.', tinymce.isWebKit);

			c = 0;
			Event.remove('test', 'click', mouseCheck);
			Event.remove('test', 'keydown', keyCheck);
			t.fakeMouseEvent('test', 'click', {clientX : 10});
			t.fakeKeyEvent('test', 'keydown', {keyCode : 13});

			t.eq(c, 0, '[%d] Event count doesn\'t add up. Value: %d should be %d.', tinymce.isWebKit);

			DOM.get('test').innerHTML = '';
		},

		teardown : function() {
			DOM.remove('test');
		}
	});
})();

(function() {
	var Serializer = tinymce.dom.Serializer, DOM = new tinymce.dom.DOMUtils(document, {keep_values : true});

	unitTester.add('tinymce.DOM.Serializer', {
		setup : function() {
			DOM.add(document.body, 'div', {id : 'test'});
			DOM.counter = 0;
		},

		serialize : function() {
			var t = this, ser = new tinymce.dom.Serializer({dom : DOM}), h, a, b;

			ser.setRules('@[id|title|class|style],div,img[src|alt|-style|border],span,hr');
			DOM.setHTML('test', '<img title="test" src="file.gif" alt="test" border="0" style="border: 1px solid red" class="test" /><span id="test2">test</span><hr />');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test"><img title="test" class="test" src="file.gif" alt="test" border="0" /><span id="test2">test</span><hr /></div>');

			ser.setRules('*a[*],em/i[*],strong/b[*i*]');
			DOM.setHTML('test', '<a href="test">test</a><strong title="test" class="test">test2</strong><em title="test">test3</em>');
			t.eq(ser.serialize(DOM.get('test')), '<a href="test">test</a><strong title="test">test2</strong><em title="test">test3</em>');

			ser.setRules('br,hr,input[type|name|value],div[id],span[id],strong/b,a,em/i,a[!href|!name],img[src|border=0|title={$uid}]');
			DOM.setHTML('test', '<br /><hr /><input type="text" name="test" value="val" class="no" /><span id="test2" class="no"><b class="no">abc</b><em class="no">123</em></span>123<a href="file.html">link</a><a name="anchor"></a><a>no</a><img src="file.gif" />');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test"><br /><hr /><input type="text" name="test" value="val" /><span id="test2"><strong>abc</strong><em>123</em></span>123<a href="file.html">link</a><a name="anchor"></a>no<img src="file.gif" border="0" title="mce_0" /></div>');

			ser.setRules('input[type|name|value|checked|disabled|readonly],select,option[selected]');
			DOM.setHTML('test', '<input type="radio" checked="1" disabled="1" value="1"><input type="radio" checked="0" disabled="0" value="1"><input type="checkbox" checked="false" disabled="false" value="1"><input type="radio" checked="checked" disabled="disabled" value="1"><input type="text" readonly="true"><select><option selected="1">test1</option><option selected="0">test2</option><option selected="false">test3</option></select>');
			t.eq(ser.serialize(DOM.get('test')), '<input type="radio" value="1" checked="checked" disabled="disabled" /><input type="radio" value="1" /><input type="checkbox" value="1" /><input type="radio" value="1" checked="checked" disabled="disabled" /><input type="text" readonly="readonly" /><select><option selected="selected">test1</option><option>test2</option><option>test3</option></select>');

			ser.setRules('a[href|target<_blank?_top|title:forced value]');
			DOM.setHTML('test', '<a href="file.htm" target="_blank" title="title">link</a><a href="#" target="test">test2</a>');
			t.eq(ser.serialize(DOM.get('test')), '<a href="file.htm" target="_blank" title="forced value">link</a><a href="#" title="forced value">test2</a>');

			ser.setRules('*[*]');
			DOM.setHTML('test', '<label for="test">label</label>');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test"><label for="test">label</label></div>');

			ser.setRules('*[*]');
			DOM.setHTML('test', '<!-- abc -->');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test"><!-- abc --></div>', null, tinymce.isOldWebKit);

			ser.setRules('*[*]');
			DOM.setHTML('test', '<span style="border: 1px solid red">test</span>');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test"><span style="border: 1px solid red">test</span></div>', null, tinymce.isOldWebKit);

			ser.setRules('*[*]');
			DOM.setHTML('test', '<div mce_name="mytag" class="test">test</div>');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test"><mytag class="test">test</mytag></div>', null, tinymce.isOldWebKit);

			ser.setRules('*[*]');
			DOM.setHTML('test', '<div test:attr="test">test</div>');
			t.eq(ser.serialize(DOM.get('test'), {getInner : 1}), '<div test:attr="test">test</div>');

			ser.setRules('#p');
			DOM.setHTML('test', '<p>test</p><p></p>');
			t.eq(ser.serialize(DOM.get('test')), '<p>test</p><p>&nbsp;</p>', null, tinymce.isOldWebKit);

			ser.setRules('img[src|border=0|alt=]');
			DOM.setHTML('test', '<img src="file.gif" border="0" alt="" />');
			t.eq(ser.serialize(DOM.get('test')), '<img src="file.gif" border="0" alt="" />');

			ser.setRules('img[src|border=0|alt=],*[*]');
			DOM.setHTML('test', '<img src="file.gif" /><hr />');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test"><img src="file.gif" border="0" alt="" /><hr /></div>');

			ser.setRules('*[*]');
			DOM.setHTML('test', '<span id="test2"><b>abc</b></span>123<a href="file.html">link</a>');
			a = ser.onPreProcess.add(function(se, o) {
				t.eq(o.test, 'abc');
				DOM.setAttrib(o.node.getElementsByTagName('span')[0], 'class', 'abc');
			});
			b = ser.onPostProcess.add(function(se, o) {
				t.eq(o.test, 'abc');
				o.content = o.content.replace(/<b>/g, '<b class="123">');
			});
			t.eq(ser.serialize(DOM.get('test'), {test : 'abc'}), '<div id="test"><span class="abc" id="test2"><b class="123">abc</b></span>123<a href="file.html">link</a></div>');
			ser.onPreProcess.remove(a);
			ser.onPostProcess.remove(b);

			ser.setRules('*[*]');
			DOM.setHTML('test', '<ol><li>a</li><ol><li>b</li><li>c</li></ol><li>e</li></ol>');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test"><ol><li>a<ol><li>b</li><li>c</li></ol></li><li>e</li></ol></div>');

			ser = new tinymce.dom.Serializer({valid_elements : 'img[src|border=0|alt=]', extended_valid_elements : 'div[id],img[src|alt=]'});
			DOM.setHTML('test', '<img src="file.gif" alt="" />');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test"><img src="file.gif" alt="" /></div>', null, tinymce.isOldWebKit);

			ser = new tinymce.dom.Serializer({invalid_elements : 'hr,br'});
			DOM.setHTML('test', '<img src="file.gif" /><hr /><br />');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test"><img src="file.gif" /></div>', null, tinymce.isOpera || tinymce.isOldWebKit);

			ser = new tinymce.dom.Serializer({entity_encoding : 'numeric'});
			DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;והצ');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test">&lt;&gt;&amp;"&#160;&#229;&#228;&#246;</div>', null, tinymce.isOpera || tinymce.isOldWebKit);

			ser = new tinymce.dom.Serializer({entity_encoding : 'named'});
			DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;והצ');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test">&lt;&gt;&amp;"&nbsp;&aring;&auml;&ouml;</div>', null, tinymce.isOpera || tinymce.isOldWebKit);

			ser = new tinymce.dom.Serializer({entity_encoding : 'named+numeric',entities : '160,nbsp,34,quot,38,amp,60,lt,62,gt'}, null, tinymce.isOpera || tinymce.isOldWebKit);
			DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;והצ');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test">&lt;&gt;&amp;"&nbsp;&#229;&#228;&#246;</div>', null, tinymce.isOpera || tinymce.isOldWebKit);

			ser = new tinymce.dom.Serializer({entity_encoding : 'raw'});
			DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;והצ');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test">&lt;&gt;&amp;"\u00a0והצ</div>', null, tinymce.isOpera || tinymce.isOldWebKit);

			ser.setRules('+a[id|style|rel|rev|charset|hreflang|dir|lang|tabindex|accesskey|type|name|href|target|title|class|onfocus|onblur|onclick|ondblclick|onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],-strong/-b[class|style],-em/-i[class|style],-strike[class|style],-u[class|style],#p[id|style|dir|class|align],-ol[class|style],-ul[class|style],-li[class|style],br,img[id|dir|lang|longdesc|usemap|style|class|src|onmouseover|onmouseout|border|alt=|title|hspace|vspace|width|height|align],-sub[style|class],-sup[style|class],-blockquote[dir|style],-table[border=0|cellspacing|cellpadding|width|height|class|align|summary|style|dir|id|lang|bgcolor|background|bordercolor],-tr[id|lang|dir|class|rowspan|width|height|align|valign|style|bgcolor|background|bordercolor],tbody[id|class],thead[id|class],tfoot[id|class],-td[id|lang|dir|class|colspan|rowspan|width|height|align|valign|style|bgcolor|background|bordercolor|scope],-th[id|lang|dir|class|colspan|rowspan|width|height|align|valign|style|scope],caption[id|lang|dir|class|style],-div[id|dir|class|align|style],-span[style|class|align],-pre[class|align|style],address[class|align|style],-h1[id|style|dir|class|align],-h2[id|style|dir|class|align],-h3[id|style|dir|class|align],-h4[id|style|dir|class|align],-h5[id|style|dir|class|align],-h6[id|style|dir|class|align],hr[class|style],-font[face|size|style|id|class|dir|color],dd[id|class|title|style|dir|lang],dl[id|class|title|style|dir|lang],dt[id|class|title|style|dir|lang],*[*]');
			DOM.setHTML('test', '<br /><hr /><span class="test"><img src="file.gif" /></span>');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test"><br /><hr /><span class="test"><img src="file.gif" alt="" /></span></div>');

			ser.setRules('*[*]');
			ser.setValidChildRules('h1/h2/h3/h4/h5/h6/a[%itrans_na],div[%itrans|%btrans]');
			DOM.setHTML('test', '<h1>test <a href="file">link</a> test</h1>');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test"><h1>test link test</h1></div>');

			ser = new tinymce.dom.Serializer({entity_encoding : 'raw'});
			ser.setRules('*[*]');
			DOM.setHTML('test', 'test1<prefix:test>Test</prefix:test>test2');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test">test1<prefix:test>Test</prefix:test>test2</div>');

			ser.setRules('style');
			DOM.setHTML('test', '<style> body { background:#fff }</style>');
			t.eq(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<style><!--\n body { background:#fff }\n--></style>');

			ser.setRules('style');
			DOM.setHTML('test', '<style>\r\n<![CDATA[\r\n   body { background:#fff }]]></style>');
			t.eq(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<style><!--\n   body { background:#fff }\n--></style>');

			ser.setRules('script[type|language|src]');
			DOM.setHTML('test', '<script>var a = b < c1;</script>');
			t.eq(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script type="text/javascript"><!--\nvar a = b < c1;\n// --></script>');

			DOM.setHTML('test', '<script type="text/javascript">var a = b < c2;</script>');
			t.eq(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script type="text/javascript"><!--\nvar a = b < c2;\n// --></script>');

			DOM.setHTML('test', '<script type="text/javascript">\n\tvar a = b < c22;\n\t if (a < b)\n\t\talert(1);\n</script>');
			t.eq(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script type="text/javascript"><!--\n\tvar a = b < c22;\n\t if (a < b)\n\t\talert(1);\n// --></script>');

			DOM.setHTML('test', '<script type="text/javascript"><!-- var a = b < c3; // --></script>');
			t.eq(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script type="text/javascript"><!--\n var a = b < c3;\n// --></script>');

			DOM.setHTML('test', '<script type="text/javascript">\n\n<!-- var a = b < c3;\n\n--></script>');
			t.eq(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script type="text/javascript"><!--\n var a = b < c3;\n// --></script>');

			DOM.setHTML('test', '<script type="text/javascript">// <![CDATA[var a = b < c4; // ]]></script>');
			t.eq(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script type="text/javascript"><!--\nvar a = b < c4;\n// --></script>');

			DOM.setHTML('test', '<script type="text/javascript"><![CDATA[var a = b < c4; ]]></script>');
			t.eq(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script type="text/javascript"><!--\nvar a = b < c4;\n// --></script>');

			DOM.setHTML('test', '<script type="text/javascript">\n\n<![CDATA[\n\nvar a = b < c4;\n\n]]>\n\n</script>');
			t.eq(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script type="text/javascript"><!--\nvar a = b < c4;\n// --></script>');

			DOM.setHTML('test', '<script type="text/javascript" src="test.js"></script>');
			t.eq(ser.serialize(DOM.get('test')), '<script type="text/javascript" src="test.js"></script>');

			ser.setRules('map[id|name],area[shape|coords|href|target|alt]');
			DOM.setHTML('test', '<map id="planetmap" name="planetmap"><area shape="rect" coords="0,0,82,126" href="sun.htm" target="_blank" alt="Sun" /></map>');
			t.eq(ser.serialize(DOM.get('test')), '<map id="planetmap" name="planetmap"><area shape="rect" coords="0,0,82,126" href="sun.htm" target="_blank" alt="Sun"></area></map>');

			DOM.setHTML('test', '123<![CDATA[<test>]]>abc');
			t.eq(ser.serialize(DOM.get('test')), '123<![CDATA[<test>]]>abc');

			DOM.setHTML('test', '123<![CDATA[<te\n\nst>]]>abc');
			t.eq(ser.serialize(DOM.get('test')), tinymce.isIE ? '123<![CDATA[<te\r\n\r\nst>]]>abc' : '123<![CDATA[<te\n\nst>]]>abc');

			ser.setRules('ul,li,br');
			DOM.setHTML('test', '<ul><li>test<br /></li><li>test<br /></li><li>test<br /></li></ul>');
			t.eq(ser.serialize(DOM.get('test')), '<ul><li>test</li><li>test</li><li>test</li></ul>');

			ser.setRules('input[type|value|name|id|maxlength|size|tabindex]');
			DOM.setHTML('test', '<input type="checkbox" value="test" /><input type="button" />');
			t.eq(ser.serialize(DOM.get('test')), '<input type="checkbox" value="test" /><input type="button" />');

/*			ser = new tinymce.dom.Serializer();
			var ifr = DOM.add(document.body, 'iframe', {id : 'iframe', src : 'javascript:""', display : 'none'});
			var doc = DOM.get('iframe').contentWindow.document;
			doc.write('<html xml:lang="en" lang="en"><head><title>Title</title><meta name="n1" content="v1" /><script type="text/javascript">//alert(\'x\');</sc'+'ript><style>.x {}</style></head><body>data</body></html>');
			doc.close();
			ser.setRules('*[*]');
			t.eq(ser.serialize(doc.documentElement), '<html xml:lang="en" lang="en"><head><title>Title</title><meta name="n1" content="v1" /><script type="text/javascript">//alert(\'x\');</sc'+'ript><style>.x {}</style></head><body>data</body></html>');
			DOM.remove(ifr);*/

			// Set editor rules and build test html based on the rules
/*			ser = new tinymce.dom.Serializer({entity_encoding : 'named'});
			ser.setRules('@[id|class|style|title|dir<ltr?rtl|lang|xml::lang|onclick|ondblclick|onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],a[rel|rev|charset|hreflang|tabindex|accesskey|type|name|href|target|onfocus|onblur],strong/b,em/i,strike,u,#p[align],-ol,-ul,-li,br,img[longdesc|usemap|src|border|alt|title|hspace|vspace|width|height|align],-sub,-sup,-blockquote,-table[border|cellspacing|cellpadding|width|height|align|summary|bgcolor|background|bordercolor],-tr[rowspan|width|height|align|valign|bgcolor|background|bordercolor],tbody,thead,tfoot,#td[colspan|rowspan|width|height|align|valign|bgcolor|background|bordercolor|scope],-th[colspan|rowspan|width|height|align|valign|scope],caption,-div,-span,-pre,address,-h1,-h2,-h3,-h4,-h5,-h6,hr[size|noshade],-font[face|size|color],dd,dl,dt,cite,abbr,acronym,del[datetime|cite],ins[datetime|cite]');
			h = '';
			tinymce.each(ser.rules, function(r, k) {
				if (k == '@')
					return;

				//h += '<' + r.name + '>x</' + r.name + '>';
				//return;

				if (ser.settings.closed.test(k.toUpperCase())) {
					h += '<' + r.name + ' />';
					return;
				}

				if (!r.noEmpty) {
					h += '<' + r.name + '>';

					if (r.padd)
						h += '&nbsp;';

					h += '</' + r.name + '>';
				}

				h += '<' + r.name;

				tinymce.each (r.attribs, function(a) {
					var v = a.name;

					if (a.name == 'dir')
						v = 'rtl';

					if (k == 'table' && a.name == 'border')
						v = '1';

					h += ' ' + a.name + '="' + v + '"';
				});

				h += '>x</' + r.name + '>\n'
			});
			DOM.setHTML('test', h);
			ser.setRules('*[*]');
			t.log(ser.serialize(DOM.get('test')));*/

/*			ser = new tinymce.dom.Serializer({apply_source_formatting : true});
			ser.setRules('*[*]');
			DOM.setHTML('test', '<ol><li>a</li><ol><li>b</li><li>c</li></ol><li>e</li></ol>');
			//t.eq(ser.serialize(DOM.get('test')), '<div id="test"><ol><li>a<ol><li>b</li><li>c</li></ol></li><li>e</li></ol></div>');*/

/*			ser = new tinymce.dom.Serializer({fix_table_elements : true});
			ser.setRules('*[*]');
			DOM.setHTML('test', '<p>a<table><tbody><tr><td>b</td></tr><tr><td>c</td></tr></tbody></table>d</p>');
			t.eq(ser.serialize(DOM.get('test')), '<div id="test"><p>a</p><table><tbody><tr><td>b</td></tr><tr><td>c</td></tr></tbody></table><p>d</p></div>');*/

			DOM.setHTML('test', '');
		},

		teardown : function() {
			DOM.remove('test');
		}
	});
})();

(function() {
	var Dispatcher = tinymce.util.Dispatcher;

	unitTester.add('tinymce.util.Dispatcher', {
		dispatcher : function() {
			var t = this, ev, v, f;

			ev = new Dispatcher();
			ev.add(function(a, b, c) {
				v = a + b + c;
			});
			ev.dispatch(1, 2, 3);
			t.eq(v, 6);

			ev = new Dispatcher();
			v = 0;
			f = ev.add(function(a, b, c) {
				v = a + b + c;
			});
			ev.remove(f);
			ev.dispatch(1, 2, 3);
			t.eq(v, 0);

			ev = new Dispatcher({test : 1});
			v = 0;
			f = ev.add(function(a, b, c) {
				v = a + b + c + this.test;
			});
			ev.dispatch(1, 2, 3);
			t.eq(v, 7);

			ev = new Dispatcher();
			v = 0;
			f = ev.add(function(a, b, c) {
				v = a + b + c + this.test;
			}, {test : 1});
			ev.dispatch(1, 2, 3);
			t.eq(v, 7);

			ev = new Dispatcher();
			v = '';
			f = ev.add(function(a, b, c) {
				v += 'b';
			}, {test : 1});
			f = ev.addToTop(function(a, b, c) {
				v += 'a';
			}, {test : 1});
			ev.dispatch();
			t.eq(v, 'ab');
		}
	});
})();

(function() {
	var Cookie = tinymce.util.Cookie;

	unitTester.add('tinymce.util.Cookie', {
		cookie : function() {
			var t = this, f = document.location.protocol == 'file:';

			Cookie.set('test', 'test123');
			t.eq(Cookie.get('test'), 'test123', null, f);

			Cookie.set('test', 'test1234');
			t.eq(Cookie.get('test'), 'test1234', null, f);

			Cookie.setHash('test', {a : 1, b : 2});
			t.is(Cookie.getHash('test') ? Cookie.getHash('test').b == 2 : null, null, f);

			Cookie.setHash('test', {a : 1, b : 3});
			t.is(Cookie.getHash('test') ? Cookie.getHash('test').b == 3 : null, null, f);
		}
	});
})();

(function() {
	var JSON = tinymce.util.JSON;

	unitTester.add('tinymce.util.JSON', {
		serialize : function() {
			var t = this;

			t.eq(JSON.serialize({arr1 : [1, 2, 3, [1, 2, 3]], bool1 : true, float1: 3.14, int1 : 123, null1 : null, obj1 : {key1 : "val1", key2 : "val2"}, str1 : 'abc\u00C5123'}), '{"arr1":[1,2,3,[1,2,3]],"bool1":true,"float1":3.14,"int1":123,"null1":null,"obj1":{"key1":"val1","key2":"val2"},"str1":"abc\\u00c5123"}');
		},

		parse : function() {
			var t = this;

			t.eq(JSON.parse('{"arr1":[1,2,3,[1,2,3]],"bool1":true,"float1":3.14,"int1":123,"null1":null,"obj1":{"key1":"val1","key2":"val2"},"str1":"abc\\u00c5123"}').str1, 'abc\u00c5123');
		}
	});
})();

(function() {
	var URI = tinymce.util.URI;

	unitTester.add('tinymce.util.URI', {
		parseFullURLs : function() {
			var t = this;

			t.eq(new URI('http://abc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash').getURI(), 'http://abc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash');
			t.neq(new URI('http://a2bc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash').getURI(), 'http://abc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash');
		},

		relativeURLs : function() {
			var t = this;

			t.eq(new URI('http://www.site.com/dir1/dir2/file.html').toRelative('http://www.site.com/dir1/dir3/file.html'), '../dir3/file.html');
			t.eq(new URI('http://www.site.com/dir1/dir2/file.html').toRelative('http://www.site.com/dir3/dir4/file.html'), '../../dir3/dir4/file.html');
			t.eq(new URI('http://www.site.com/dir1/').toRelative('http://www.site.com/dir1/dir3/file.htm'), 'dir3/file.htm');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('http://www.site2.com/dir1/dir3/file.htm'), 'http://www.site2.com/dir1/dir3/file.htm');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('http://www.site.com:8080/dir1/dir3/file.htm'), 'http://www.site.com:8080/dir1/dir3/file.htm');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('https://www.site.com/dir1/dir3/file.htm'), 'https://www.site.com/dir1/dir3/file.htm');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm'), '../../file.htm');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm?id=1#a'), '../../file.htm?id=1#a');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('mailto:test@test.com'), 'mailto:test@test.com');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('news:test'), 'news:test');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('javascript:void(0);'), 'javascript:void(0);');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('about:blank'), 'about:blank');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('#test'), '#test');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('test.htm'), 'test.htm');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('http://www.site.com/dir1/dir2/test.htm'), 'test.htm');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('dir2/test.htm'), 'dir2/test.htm');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('../dir2/test.htm'), 'test.htm');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('../../../../../../test.htm'), '../../test.htm');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('//www.site.com/test.htm'), '../../test.htm');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('@@tinymce'), '@@tinymce'); // Zope 3 URL
			t.eq(new URI('http://www.site.com/dir1/dir2/').toRelative('../@@tinymce'), '../@@tinymce'); // Zope 3 URL
			t.eq(new URI('http://www.site.com/').toRelative('dir2/test.htm'), 'dir2/test.htm');
			t.eq(new URI('http://www.site.com/').toRelative('./'), './');
		},

		absoluteURLs : function() {
			var t = this;

			t.eq(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../dir3'), 'http://www.site.com/dir1/dir3');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../dir3', 1), '/dir1/dir3');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../../../../dir3'), 'http://www.site.com/dir3');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../abc/def/../../abc/../dir3/file.htm'), 'http://www.site.com/dir1/dir3/file.htm');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toAbsolute('http://www.site.com/dir2/dir3'), 'http://www.site.com/dir2/dir3');
			t.eq(new URI('http://www.site2.com/dir1/dir2/').toAbsolute('http://www.site2.com/dir2/dir3'), 'http://www.site2.com/dir2/dir3');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toAbsolute('mailto:test@test.com'), 'mailto:test@test.com');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toAbsolute('news:test'), 'news:test');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toAbsolute('javascript:void(0);'), 'javascript:void(0);');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toAbsolute('about:blank'), 'about:blank');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toAbsolute('#test'), '#test');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toAbsolute('test.htm'), 'http://www.site.com/dir1/dir2/test.htm');
			t.eq(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../@@tinymce'), 'http://www.site.com/dir1/@@tinymce'); // Zope 3 URL
			t.eq(new URI('http://www.site.com/dir1/dir2/').getURI(), 'http://www.site.com/dir1/dir2/');
		},

		strangeURLs : function() {
			var t = this;

			t.eq(new URI('//www.site.com').getURI(), '//www.site.com');
			t.eq(new URI('mailto:test@test.com').getURI(), 'mailto:test@test.com');
			t.eq(new URI('news:somegroup').getURI(), 'news:somegroup');
		}
	});
})();

(function() {
	var Parser = tinymce.xml.Parser;

	unitTester.add('tinymce.util.Parser', {
		parser : function() {
			var t = this, f = document.location.protocol == 'file:', p, d;

			p = new Parser({async : false});
			p.load('test.xml', function(d) {
				t.eq(d.getElementsByTagName('tag').length, 1);
			});

			p = new Parser({async : false});
			p.load('test.xml', function(d) {
				t.eq(tinymce.trim(p.getText(d.getElementsByTagName('tag')[0])), 'ִֵײ');
			});

			p = new Parser({async : false});
			d = p.loadXML('<root><tag>ִֵײ</tag></root>');
			t.eq(tinymce.trim(p.getText(d.getElementsByTagName('tag')[0])), 'ִֵײ');
		}
	});
})();

