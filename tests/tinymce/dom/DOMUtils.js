(function() {
	module("tinymce.dom.DOMUtils");

	var DOM = new tinymce.dom.DOMUtils(document, {keep_values : true, schema : new tinymce.html.Schema()});

	test('parseStyle', 11, function() {
		var dom;

		DOM.add(document.body, 'div', {id : 'test'});

		dom = new tinymce.dom.DOMUtils(document, {hex_colors : true, keep_values : true, url_converter : function(u) {
			return 'X' + u + 'Y';
		}});

		equal(
			dom.serializeStyle(dom.parseStyle('border: 1px solid red; color: green')),
			'border: 1px solid red; color: green;'
		);

		equal(
			dom.serializeStyle(dom.parseStyle('border: 1px solid rgb(0, 255, 255); color: green')),
			'border: 1px solid #00ffff; color: green;'
		);

		equal(
			dom.serializeStyle(dom.parseStyle('border-top: 1px solid red; border-left: 1px solid red; border-bottom: 1px solid red; border-right: 1px solid red;')),
			'border: 1px solid red;'
		);

		equal(
			dom.serializeStyle(dom.parseStyle('border-width: 1pt 1pt 1pt 1pt; border-style: none none none none; border-color: black black black black;')),
			'border: 1pt none black;'
		);
		
		equal(
			dom.serializeStyle(dom.parseStyle('border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;')),
			'border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;'
		);

		equal(
			dom.serializeStyle(dom.parseStyle('background: transparent url(test.gif);')),
			'background: transparent url(\'Xtest.gifY\');'
		);

		equal(
			dom.serializeStyle(dom.parseStyle('background: transparent url(http://www.site.com/test.gif?a=1&b=2);')),
			'background: transparent url(\'Xhttp://www.site.com/test.gif?a=1&b=2Y\');'
		);

		dom.setHTML('test', '<span id="test2" style="   margin-left: 1px;    margin-top: 1px;   margin-right: 1px;   margin-bottom: 1px   "></span>');
		equal(dom.getAttrib('test2', 'style'), 'margin: 1px;');

		dom.setHTML('test', '<span id="test2" style="background-image: url(test.gif);"></span>');
		equal(dom.getAttrib('test2', 'style'), 'background-image: url(\'Xtest.gifY\');');

		dom.get('test').innerHTML = '<span id="test2" style="border: 1px solid #00ff00"></span>';
		equal(dom.getAttrib('test2', 'style'), tinymce.isIE && !window.getSelection ? 'border: #00ff00 1px solid;' : 'border: 1px solid #00ff00;'); // IE has a separate output

		dom.get('test').innerHTML = '<span id="test2" style="background-image: url(http://www.site.com/test.gif);"></span>';
		equal(dom.getAttrib('test2', 'style'), 'background-image: url(\'Xhttp://www.site.com/test.gifY\');');

		DOM.remove('test');
	});

	test('addClass', 10, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.get('test').className = '';
		DOM.addClass('test', 'abc');
		equal(DOM.get('test').className, 'abc');

		DOM.get('test').className = '';
		equal(DOM.addClass('test', 'abc'), 'abc');
		equal(DOM.addClass(null, 'abc'), false);

		DOM.addClass('test', '123');
		equal(DOM.get('test').className, 'abc 123');

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.addClass(DOM.select('span', 'test'), 'abc');
		equal(DOM.get('test2').className, 'abc');
		equal(DOM.get('test3').className, 'abc');
		equal(DOM.get('test4').className, 'abc');
		DOM.get('test').innerHTML = '';

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.addClass(['test2', 'test3', 'test4'], 'abc');
		equal(DOM.get('test2').className, 'abc');
		equal(DOM.get('test3').className, 'abc');
		equal(DOM.get('test4').className, 'abc');
		DOM.get('test').innerHTML = '';

		DOM.remove('test');
	});

	test('removeClass', 4, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.get('test').className = 'abc 123 xyz';
		DOM.removeClass('test', '123');
		equal(DOM.get('test').className, 'abc xyz');

		DOM.get('test').innerHTML = '<span id="test2" class="test1"></span><span id="test3" class="test test1 test"></span><span id="test4" class="test1 test"></span>';
		DOM.removeClass(DOM.select('span', 'test'), 'test1');
		equal(DOM.get('test2').className, '');
		equal(DOM.get('test3').className, 'test test');
		equal(DOM.get('test4').className, 'test');
		DOM.get('test').innerHTML = '';

		DOM.remove('test');
	});

	test('hasClass', 7, function() {
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

	test('add', 5, function() {
		var e;

		DOM.add(document.body, 'div', {id : 'test'});

		DOM.add('test', 'span', {'class' : 'abc 123'}, 'content <b>abc</b>');
		e = DOM.get('test').getElementsByTagName('span')[0];
		equal(e.className, 'abc 123');
		equal(e.innerHTML.toLowerCase(), 'content <b>abc</b>');
		DOM.remove(e);

		DOM.add('test', 'span', {'class' : 'abc 123'});
		e = DOM.get('test').getElementsByTagName('span')[0];
		equal(e.className, 'abc 123');
		DOM.remove(e);

		DOM.add('test', 'span');
		e = DOM.get('test').getElementsByTagName('span')[0];
		equal(e.nodeName, 'SPAN');
		DOM.remove(e);

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.add(['test2', 'test3', 'test4'], 'span', {'class' : 'abc 123'});
		equal(DOM.select('span', 'test').length, 6);

		DOM.remove('test');
	});

	test('create', 3, function() {
		var e;

		e = DOM.create('span', {'class' : 'abc 123'}, 'content <b>abc</b>');

		equal(e.nodeName, 'SPAN');
		equal(e.className, 'abc 123');
		equal(e.innerHTML.toLowerCase(), 'content <b>abc</b>');
	});

	test('createHTML', 4, function() {
		equal(DOM.createHTML('span', {'id' : 'id1', 'class' : 'abc 123'}, 'content <b>abc</b>'), '<span id="id1" class="abc 123">content <b>abc</b></span>');
		equal(DOM.createHTML('span', {'id' : 'id1', 'class' : 'abc 123'}), '<span id="id1" class="abc 123" />');
		equal(DOM.createHTML('span'), '<span />');
		equal(DOM.createHTML('span', null, 'content <b>abc</b>'), '<span>content <b>abc</b></span>');
	});

	test('uniqueId', 3, function() {
		DOM.counter = 0;

		equal(DOM.uniqueId(), 'mce_0');
		equal(DOM.uniqueId(), 'mce_1');
		equal(DOM.uniqueId(), 'mce_2');
	});

	test('showHide', 10, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.show('test');
		equal(DOM.get('test').style.display, 'block');
		ok(!DOM.isHidden('test'));

		DOM.hide('test');
		equal(DOM.get('test').style.display, 'none');
		ok(DOM.isHidden('test'));

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.hide(['test2', 'test3', 'test4'], 'test');
		equal(DOM.get('test2').style.display, 'none');
		equal(DOM.get('test3').style.display, 'none');
		equal(DOM.get('test4').style.display, 'none');

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.show(['test2', 'test3', 'test4'], 'test');
		equal(DOM.get('test2').style.display, 'block');
		equal(DOM.get('test3').style.display, 'block');
		equal(DOM.get('test4').style.display, 'block');

		// Cleanup
		DOM.setAttrib('test', 'style', '');

		DOM.remove('test');
	});

	test('select', 4, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setHTML('test', '<div>test 1</div><div>test 2 <div>test 3</div></div><div>test 4</div>');
		equal(DOM.select('div', 'test').length, 4);
		ok(DOM.select('div', 'test').reverse);

		DOM.setHTML('test', '<div class="test1 test2 test3">test 1</div><div class="test2">test 2 <div>test 3</div></div><div>test 4</div>');
		equal(DOM.select('div.test2', 'test').length, 2);

		DOM.setHTML('test', '<div class="test1 test2 test3">test 1</div><div class="test2">test 2 <div>test 3</div></div><div>test 4</div>');
		equal(DOM.select('div div', 'test').length, 1, null, tinymce.isWebKit); // Issue: http://bugs.webkit.org/show_bug.cgi?id=17461
		//alert(DOM.select('div div', 'test').length +","+DOM.get('test').querySelectorAll('div div').length);

		DOM.remove('test');
	});

	test('is', 3, function() {
		DOM.add(document.body, 'div', {id : 'test'});
		DOM.setHTML('test', '<div id="textX" class="test">test 1</div>');

		ok(DOM.is(DOM.get('textX'), 'div'));
		ok(DOM.is(DOM.get('textX'), 'div#textX.test'));
		ok(!DOM.is(DOM.get('textX'), 'div#textX2'));

		DOM.remove('test');
	});

	test('encode', 1, function() {
		equal(DOM.encode('abc<>"&\'\u00e5\u00e4\u00f6'), 'abc&lt;&gt;&quot;&amp;&#39;\u00e5\u00e4\u00f6');
	});

	test('setGetAttrib', 16, function() {
		var dom;

		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setAttrib('test', 'class', 'test 123');
		equal(DOM.getAttrib('test', 'class'), 'test 123');

		DOM.setAttrib('test', 'src', 'url');
		equal(DOM.getAttrib('test', 'src'), 'url');
		equal(DOM.getAttrib('test', 'data-mce-src'), 'url');
		equal(DOM.getAttrib('test', 'abc'), '');

		DOM.setAttribs('test', {'class' : '123', title : 'abc'});
		equal(DOM.getAttrib('test', 'class'), '123');
		equal(DOM.getAttrib('test', 'title'), 'abc');

		DOM.setAttribs('test');
		equal(DOM.getAttrib('test', 'class'), '123');
		equal(DOM.getAttrib('test', 'title'), 'abc');

		dom = new tinymce.dom.DOMUtils(document, {keep_values : true, url_converter : function(u, n) {
			return '&<>"' + u + '&<>"' + n;
		}});

		dom.setAttribs('test', {src : '123', href : 'abc'});
		equal(DOM.getAttrib('test', 'src'), '&<>"123&<>"src');
		equal(DOM.getAttrib('test', 'href'), '&<>"abc&<>"href');

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.setAttribs(['test2', 'test3', 'test4'], {test1 : "1", test2 : "2"});
		equal(DOM.getAttrib('test2', 'test1'), '1');
		equal(DOM.getAttrib('test3', 'test2'), '2');
		equal(DOM.getAttrib('test4', 'test1'), '1');

		equal(DOM.getAttrib(document, 'test'), false);
		equal(DOM.getAttrib(document, 'test', ''), '');
		equal(DOM.getAttrib(document, 'test', 'x'), 'x');

		DOM.remove('test');
	});

	test('getAttribs', 2, function() {
		function check(obj, val) {
			var count = 0;

			val = val.split(',');

			tinymce.each(obj, function(o) {
				if (tinymce.inArray(val, o.nodeName.toLowerCase()) != -1 && o.specified) {
					count++;
				}
			});

			return count == obj.length;
		}

		DOM.add(document.body, 'div', {id : 'test'});

		DOM.get('test').innerHTML = '<span id="test2" class="test"></span>';
		ok(check(DOM.getAttribs('test2'), 'id,class'));

		DOM.get('test').innerHTML = '<input id="test2" type="checkbox" name="test" value="1" disabled readonly checked></span>';
		ok(check(DOM.getAttribs('test2'), 'id,type,name,value,disabled,readonly,checked'), 'Expected attributed: type,name,disabled,readonly,checked');

		DOM.remove('test');
	});

	test('setGetStyles', 7, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setStyle('test', 'font-size', '20px');
		equal(DOM.getStyle('test', 'font-size'), '20px', null, tinymce.isWebKit);

		DOM.setStyle('test', 'fontSize', '21px');
		equal(DOM.getStyle('test', 'fontSize'), '21px', null, tinymce.isWebKit);

		DOM.setStyles('test', {fontSize : '22px', display : 'inline'});
		equal(DOM.getStyle('test', 'fontSize'), '22px', null, tinymce.isWebKit);
		equal(DOM.getStyle('test', 'display'), 'inline', null, tinymce.isWebKit);

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.setStyles(['test2', 'test3', 'test4'], {fontSize : "22px"});
		equal(DOM.getStyle('test2', 'fontSize'), '22px');
		equal(DOM.getStyle('test3', 'fontSize'), '22px');
		equal(DOM.getStyle('test4', 'fontSize'), '22px');

		DOM.setAttrib('test', 'style', '');

		DOM.remove('test');
	});

	test('getPos', 2, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setStyles('test', {position : 'absolute', left : 100, top : 110});
		equal(DOM.getPos('test').x, 100);
		equal(DOM.getPos('test').y, 110);

		DOM.setAttrib('test', 'style', '');

		DOM.remove('test');
	});

	test('getParent', 6, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.get('test').innerHTML = '<div><span>ab<a id="test2" href="">abc</a>c</span></div>';

		equal(DOM.getParent('test2', function(n) {return n.nodeName == 'SPAN';}).nodeName, 'SPAN');
		equal(DOM.getParent('test2', function(n) {return n.nodeName == 'BODY';}).nodeName, 'BODY');
		equal(DOM.getParent('test2', function(n) {return n.nodeName == 'BODY';}, document.body), null);
		equal(DOM.getParent('test2', function() {return false;}), null);
		equal(DOM.getParent('test2', 'SPAN').nodeName, 'SPAN');
		equal(DOM.getParent('test2', 'body', DOM.get('test')), null);

		DOM.get('test').innerHTML = '';

		DOM.remove('test');
	});

	test('getParents', 4, function() {
		DOM.add(document.body, 'div', {id : 'test'});
		DOM.get('test').innerHTML = '<div><span class="test">ab<span><a id="test2" href="">abc</a>c</span></span></div>';

		equal(DOM.getParents('test2', function(n) {return n.nodeName == 'SPAN';}).length, 2);
		equal(DOM.getParents('test2', 'span').length, 2);
		equal(DOM.getParents('test2', 'span.test').length, 1);
		equal(DOM.getParents('test2', 'body', DOM.get('test')).length, 0);

		DOM.remove('test');
	});

	test('is', 2, function() {
		DOM.add(document.body, 'div', {id : 'test'});
		DOM.get('test').innerHTML = '<div><span class="test">ab<span><a id="test2" href="">abc</a>c</span></span></div>';

		ok(DOM.is(DOM.select('span', 'test'), 'span'));
		ok(DOM.is(DOM.select('#test2', 'test'), '#test2'));

		DOM.remove('test');
	});

	test('getViewPort', 4, function() {
		var wp;

		wp = DOM.getViewPort();
		equal(wp.x, 0);
		equal(wp.y, 0);
		ok(wp.w > 0);
		ok(wp.h > 0);
	});

	test('getRect', 5, function() {
		var r;

		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setStyles('test', {position : 'absolute', left : 100, top : 110, width : 320, height : 240});
		r = DOM.getRect('test');
		equal(r.x, 100);
		equal(r.y, 110);
		equal(r.w, 320);
		equal(r.h, 240);

		DOM.setAttrib('test', 'style', '');

		DOM.get('test').innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:50%;height:240px"></div></div>';
		r = DOM.getRect('test2');
		equal(r.w, 160);

		DOM.remove('test');
	});

	test('getSize', 2, function() {
		var r;

		DOM.add(document.body, 'div', {id : 'test'});

		DOM.get('test').innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:50%;height:240px"></div></div>';
		r = DOM.getSize('test2');
		equal(r.w, 160);

		DOM.get('test').innerHTML = '<div style="width:320px;height:240px"><div id="test2" style="width:100px;height:240px"></div></div>';
		r = DOM.getSize('test2');
		equal(r.w, 100);

		DOM.remove('test');
	});

	test('getNext', 5, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.get('test').innerHTML = '<strong>A</strong><span>B</span><em>C</em>';
		equal(DOM.getNext(DOM.get('test').firstChild, '*').nodeName, 'SPAN');
		equal(DOM.getNext(DOM.get('test').firstChild, 'em').nodeName, 'EM');
		equal(DOM.getNext(DOM.get('test').firstChild, 'div'), null);
		equal(DOM.getNext(null, 'div'), null);
		equal(DOM.getNext(DOM.get('test').firstChild, function(n) {return n.nodeName == 'EM';}).nodeName, 'EM');

		DOM.remove('test');
	});

	test('getPrev', 5, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.get('test').innerHTML = '<strong>A</strong><span>B</span><em>C</em>';
		equal(DOM.getPrev(DOM.get('test').lastChild, '*').nodeName, 'SPAN');
		equal(DOM.getPrev(DOM.get('test').lastChild, 'strong').nodeName, 'STRONG');
		equal(DOM.getPrev(DOM.get('test').lastChild, 'div'), null);
		equal(DOM.getPrev(null, 'div'), null);
		equal(DOM.getPrev(DOM.get('test').lastChild, function(n) {return n.nodeName == 'STRONG';}).nodeName, 'STRONG');

		DOM.remove('test');
	});

	test('loadCSS', 1, function() {
		var c = 0;

		DOM.loadCSS('tinymce/dom/test.css?a=1,tinymce/dom/test.css?a=2,tinymce/dom/test.css?a=3');

		tinymce.each(document.getElementsByTagName('link'), function(n) {
			if (n.href.indexOf('test.css?a=') != -1) {
				c++;
			}
		});

		equal(c, 3, null, tinymce.isOpera);
	});

	test('insertAfter', 2, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setHTML('test', '<span id="test2"></span>');
		DOM.insertAfter(DOM.create('br'), 'test2');
		equal(DOM.get('test2').nextSibling.nodeName, 'BR');

		DOM.setHTML('test', '<span>test</span><span id="test2"></span><span>test</span>');
		DOM.insertAfter(DOM.create('br'), 'test2');
		equal(DOM.get('test2').nextSibling.nodeName, 'BR');

		DOM.remove('test');
	});

	test('isBlock', 4, function() {
		ok(DOM.isBlock(DOM.create('div')));
		ok(DOM.isBlock('DIV'));
		ok(!DOM.isBlock('SPAN'));
		ok(DOM.isBlock('div'));
	});

	test('remove', 3, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		DOM.remove('test2', 1);
		equal(DOM.get('test').innerHTML.toLowerCase(), '<span>test</span><span>test2</span>');

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		equal(DOM.remove('test2').nodeName, 'SPAN');

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.remove(['test2', 'test4']);
		equal(DOM.select('span', 'test').length, 1);

		DOM.remove('test');
	});

	test('replace', 2, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		DOM.replace(DOM.create('div', {id : 'test2'}), 'test2', 1);
		equal(DOM.get('test2').innerHTML.toLowerCase(), '<span>test</span><span>test2</span>');

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		DOM.replace(DOM.create('div', {id : 'test2'}), 'test2');
		equal(DOM.get('test2').innerHTML, '');

		DOM.remove('test');
	});

	test('toHex', 5, function() {
		equal(DOM.toHex('rgb(0, 255, 255)'), '#00ffff');
		equal(DOM.toHex('rgb(255, 0, 0)'), '#ff0000');
		equal(DOM.toHex('rgb(0, 0, 255)'), '#0000ff');
		equal(DOM.toHex('rgb  (  0  , 0  , 255  )  '), '#0000ff');
		equal(DOM.toHex('   RGB  (  0  , 0  , 255  )  '), '#0000ff');
	});

	test('getOuterHTML', 4, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		equal(DOM.getOuterHTML('test2').toLowerCase().replace(/\"/g, ''), '<span id=test2><span>test</span><span>test2</span></span>');

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		DOM.setOuterHTML('test2', '<div id="test2">123</div>');
		equal(tinymce.trim(DOM.getOuterHTML('test2') || '').toLowerCase().replace(/\"/g, ''), '<div id=test2>123</div>');

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		DOM.setOuterHTML('test2', '<div id="test2">123</div><div id="test3">abc</div>');
		equal(tinymce.trim(DOM.get('test').innerHTML).toLowerCase().replace(/>\s+</g, '><').replace(/\"/g, ''), '<div id=test2>123</div><div id=test3>abc</div>');

		DOM.setHTML('test', 'test');
		equal(tinymce.trim(DOM.getOuterHTML(DOM.get('test').firstChild)), 'test');

		DOM.remove('test');
	});

	test('encodeDecode', 2, function() {
		equal(DOM.encode('\u00e5\u00e4\u00f6&<>"'), '\u00e5\u00e4\u00f6&amp;&lt;&gt;&quot;');
		equal(DOM.decode('&aring;&auml;&ouml;&amp;&lt;&gt;&quot;'), '\u00e5\u00e4\u00f6&<>"');
	});

	test('split', 2, function() {
		var point, parent;
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setHTML('test', '<p><b>text1<span>inner</span>text2</b></p>');
		parent = DOM.select('p', DOM.get('test'))[0];
		point = DOM.select('span', DOM.get('test'))[0];
		DOM.split(parent, point);
		equal(DOM.get('test').innerHTML.toLowerCase().replace(/\s+/g, ''), '<p><b>text1</b></p><span>inner</span><p><b>text2</b></p>');

		DOM.setHTML('test', '<ul><li>first line<br><ul><li><span>second</span> <span>line</span></li><li>third line<br></li></ul></li></ul>');
		parent = DOM.select('li:nth-child(1)', DOM.get('test'))[0];
		point = DOM.select('ul li:nth-child(2)', DOM.get('test'))[0];
		DOM.split(parent, point);
		equal(Utils.cleanHtml(DOM.get('test').innerHTML), '<ul><li>first line<br><ul><li><span>second</span> <span>line</span></li></ul></li><li>third line<br></li></ul>');

		DOM.remove('test');
	});

	test('nodeIndex', 5, function() {
		DOM.add(document.body, 'div', {id : 'test'}, 'abc<b>abc</b>abc');

		equal(DOM.nodeIndex(DOM.get('test').childNodes[0]), 0, 'Index of first child.');
		equal(DOM.nodeIndex(DOM.get('test').childNodes[1]), 1, 'Index of second child.');
		equal(DOM.nodeIndex(DOM.get('test').childNodes[2]), 2, 'Index of third child.');

		DOM.get('test').insertBefore(DOM.doc.createTextNode('a'), DOM.get('test').firstChild);
		DOM.get('test').insertBefore(DOM.doc.createTextNode('b'), DOM.get('test').firstChild);

		equal(DOM.nodeIndex(DOM.get('test').lastChild), 4, 'Index of last child with fragmented DOM.');
		equal(DOM.nodeIndex(DOM.get('test').lastChild, true), 2, 'Normalized index of last child with fragmented DOM.');

		DOM.remove('test');
	});

	test('isEmpty', 14, function() {
		DOM.schema = new tinymce.html.Schema(); // A schema will be added when used within a editor instance
		DOM.add(document.body, 'div', {id : 'test'}, '');

		ok(DOM.isEmpty(DOM.get('test')), 'No children');

		DOM.setHTML('test', '<br />');
		ok(DOM.isEmpty(DOM.get('test')), 'Br child');

		DOM.setHTML('test', '<br /><br />');
		ok(!DOM.isEmpty(DOM.get('test')), 'Br children');

		DOM.setHTML('test', 'text');
		ok(!DOM.isEmpty(DOM.get('test')), 'Text child');

		DOM.setHTML('test', '<span>text</span>');
		ok(!DOM.isEmpty(DOM.get('test')), 'Text child in span');

		DOM.setHTML('test', '<span></span>');
		ok(DOM.isEmpty(DOM.get('test')), 'Empty span child');

		DOM.setHTML('test', '<div><span><b></b></span><b></b><em></em></div>');
		ok(DOM.isEmpty(DOM.get('test')), 'Empty complex HTML');

		DOM.setHTML('test', '<div><span><b></b></span><b></b><em>X</em></div>');
		ok(!DOM.isEmpty(DOM.get('test')), 'Non empty complex HTML');

		DOM.setHTML('test', '<div><span><b></b></span><b></b><em> </em></div>');
		ok(DOM.isEmpty(DOM.get('test')), 'Non empty complex HTML with space');

		DOM.setHTML('test', '<div><span><b></b></span><b></b><em><a name="x"></a></em></div>');
		ok(!DOM.isEmpty(DOM.get('test')), 'Non empty complex HTML with achor name');

		DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif">');
		ok(!DOM.isEmpty(DOM.get('test')), 'Non empty html with img element');

		DOM.setHTML('test', '<span data-mce-bookmark="1"></span>');
		ok(!DOM.isEmpty(DOM.get('test')), 'Span with bookmark attribute.');

		DOM.setHTML('test', '<span data-mce-style="color:Red"></span>');
		ok(DOM.isEmpty(DOM.get('test')), 'Span with data-mce attribute.');

		DOM.setHTML('test', '<div><!-- comment --></div>');
		ok(!DOM.isEmpty(DOM.get('test')), 'Element with comment.');

		DOM.remove('test');
	});

	test('isEmpty on P with BR in EM', function() {
		var elm = DOM.create('p', null, '<em><br></em>');
		ok(DOM.isEmpty(elm, 'No children'));
	});
	
	test('isEmpty on P with two BR in EM', function() {
		var elm = DOM.create('p', null, '<em><br><br></em>');
		equal(false, DOM.isEmpty(elm));
	});

	test('bind/unbind/fire', function() {
		var count = 0;

		DOM.bind(document, 'click', function() {count++;});
		DOM.fire(document, 'click');
		DOM.unbind(document, 'click');
		equal(count, 1);

		count = 0;
		DOM.bind([document, window], 'click', function(e) {e.stopPropagation(); count++;});
		DOM.fire(document, 'click');
		DOM.fire(window, 'click');
		DOM.unbind([document, window], 'click');
		equal(count, 2);

		count = 0;
		DOM.fire(document, 'click');
		DOM.fire(window, 'click');
		equal(count, 0);
	});

	DOM.remove('test');
})();
