(function() {
	var DOM = new tinymce.dom.DOMUtils(document, {keep_values : true});

	test('parseStyle', 11, function() {
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
			dom.serializeStyle(dom.parseStyle('border-width: 1pt 1pt 1pt 1pt; border-style: none none none none; border-color: black black black black;')),
			'border: 1pt none black;'
		);
		
		equals(
			dom.serializeStyle(dom.parseStyle('border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;')),
			'border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;'
		);

		equals(
			dom.serializeStyle(dom.parseStyle('background: transparent url(test.gif);')),
			'background: transparent url(\'Xtest.gifY\');'
		);

		equals(
			dom.serializeStyle(dom.parseStyle('background: transparent url(http://www.site.com/test.gif?a=1&b=2);')),
			'background: transparent url(\'Xhttp://www.site.com/test.gif?a=1&b=2Y\');'
		);

		dom.setHTML('test', '<span id="test2" style="   margin-left: 1px;    margin-top: 1px;   margin-right: 1px;   margin-bottom: 1px   "></span>');
		equals(dom.getAttrib('test2', 'style'), 'margin: 1px;');

		dom.setHTML('test', '<span id="test2" style="background-image: url(test.gif);"></span>');
		equals(dom.getAttrib('test2', 'style'), 'background-image: url(\'Xtest.gifY\');');

		dom.get('test').innerHTML = '<span id="test2" style="border: 1px solid #00ff00"></span>';
		equals(dom.getAttrib('test2', 'style'), tinymce.isIE && !window.getSelection ? 'border: #00ff00 1px solid;' : 'border: 1px solid #00ff00;'); // IE has a separate output

		dom.get('test').innerHTML = '<span id="test2" style="background-image: url(http://www.site.com/test.gif);"></span>';
		equals(dom.getAttrib('test2', 'style'), 'background-image: url(\'Xhttp://www.site.com/test.gifY\');');

		DOM.remove('test');
	});

	test('addClass', 10, function() {
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

	test('removeClass', 4, function() {
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

	test('create', 3, function() {
		var e;

		e = DOM.create('span', {'class' : 'abc 123'}, 'content <b>abc</b>');

		equals(e.nodeName, 'SPAN');
		equals(e.className, 'abc 123');
		equals(e.innerHTML.toLowerCase(), 'content <b>abc</b>');
	});

	test('createHTML', 4, function() {
		equals(DOM.createHTML('span', {'id' : 'id1', 'class' : 'abc 123'}, 'content <b>abc</b>'), '<span id="id1" class="abc 123">content <b>abc</b></span>');
		equals(DOM.createHTML('span', {'id' : 'id1', 'class' : 'abc 123'}), '<span id="id1" class="abc 123" />');
		equals(DOM.createHTML('span'), '<span />');
		equals(DOM.createHTML('span', null, 'content <b>abc</b>'), '<span>content <b>abc</b></span>');
	});

	test('uniqueId', 3, function() {
		DOM.counter = 0;

		equals(DOM.uniqueId(), 'mce_0');
		equals(DOM.uniqueId(), 'mce_1');
		equals(DOM.uniqueId(), 'mce_2');
	});

	test('showHide', 10, function() {
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

	test('select', 4, function() {
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

	test('is', 3, function() {
		DOM.add(document.body, 'div', {id : 'test'});
		DOM.setHTML('test', '<div id="textX" class="test">test 1</div>');

		ok(DOM.is(DOM.get('textX'), 'div'));
		ok(DOM.is(DOM.get('textX'), 'div#textX.test'));
		ok(!DOM.is(DOM.get('textX'), 'div#textX2'));

		DOM.remove('test');
	});

	test('encode', 1, function() {
		equals(DOM.encode('abc<>"&\'\u00e5\u00e4\u00f6'), 'abc&lt;&gt;&quot;&amp;&#39;\u00e5\u00e4\u00f6');
	});

	test('setGetAttrib', 14, function() {
		var dom;

		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setAttrib('test', 'class', 'test 123');
		equals(DOM.getAttrib('test', 'class'), 'test 123');

		DOM.setAttrib('test', 'src', 'url');
		equals(DOM.getAttrib('test', 'src'), 'url');
		equals(DOM.getAttrib('test', 'data-mce-src'), 'url');
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

		equals(DOM.getAttrib(document, 'test'), false);
		equals(DOM.getAttrib(document, 'test', ''), '');
		equals(DOM.getAttrib(document, 'test', 'x'), 'x');

		DOM.remove('test');
	});

	test('getAttribs', 2, function() {
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

	test('setGetStyles', 7, function() {
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

	test('getPos', 2, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setStyles('test', {position : 'absolute', left : 100, top : 110});
		equals(DOM.getPos('test').x, 100);
		equals(DOM.getPos('test').y, 110);

		DOM.setAttrib('test', 'style', '');

		DOM.remove('test');
	});

	test('getParent', 6, function() {
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

	test('getParents', 4, function() {
		DOM.add(document.body, 'div', {id : 'test'});
		DOM.get('test').innerHTML = '<div><span class="test">ab<span><a id="test2" href="">abc</a>c</span></span></div>';

		equals(DOM.getParents('test2', function(n) {return n.nodeName == 'SPAN';}).length, 2);
		equals(DOM.getParents('test2', 'span').length, 2);
		equals(DOM.getParents('test2', 'span.test').length, 1);
		equals(DOM.getParents('test2', 'body', DOM.get('test')).length, 0);

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
		equals(wp.x, 0);
		equals(wp.y, 0);
		ok(wp.w > 0);
		ok(wp.h > 0);
	});

	test('getRect', 5, function() {
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

	test('getSize', 2, function() {
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

	test('getNext', 5, function() {
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

	test('getPrev', 5, function() {
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

	test('loadCSS', 1, function() {
		var c = 0;

		DOM.loadCSS('css/unit.css?a=1,css/unit.css?a=2,css/unit.css?a=3');

		tinymce.each(document.getElementsByTagName('link'), function(n) {
			if (n.href.indexOf('unit.css?a=') != -1)
				c++;
		});

		equals(c, 3, null, tinymce.isOpera);
	});

	test('insertAfter', 2, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setHTML('test', '<span id="test2"></span>');
		DOM.insertAfter(DOM.create('br'), 'test2');
		equals(DOM.get('test2').nextSibling.nodeName, 'BR');

		DOM.setHTML('test', '<span>test</span><span id="test2"></span><span>test</span>');
		DOM.insertAfter(DOM.create('br'), 'test2');
		equals(DOM.get('test2').nextSibling.nodeName, 'BR');

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
		equals(DOM.get('test').innerHTML.toLowerCase(), '<span>test</span><span>test2</span>');

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		equals(DOM.remove('test2').nodeName, 'SPAN');

		DOM.get('test').innerHTML = '<span id="test2"></span><span id="test3"></span><span id="test4"></span>';
		DOM.remove(['test2', 'test4']);
		equals(DOM.select('span', 'test').length, 1);

		DOM.remove('test');
	});

	test('replace', 2, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		DOM.replace(DOM.create('div', {id : 'test2'}), 'test2', 1);
		equals(DOM.get('test2').innerHTML.toLowerCase(), '<span>test</span><span>test2</span>');

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		DOM.replace(DOM.create('div', {id : 'test2'}), 'test2');
		equals(DOM.get('test2').innerHTML, '');

		DOM.remove('test');
	});

	test('toHex', 5, function() {
		equals(DOM.toHex('rgb(0, 255, 255)'), '#00ffff');
		equals(DOM.toHex('rgb(255, 0, 0)'), '#ff0000');
		equals(DOM.toHex('rgb(0, 0, 255)'), '#0000ff');
		equals(DOM.toHex('rgb  (  0  , 0  , 255  )  '), '#0000ff');
		equals(DOM.toHex('   RGB  (  0  , 0  , 255  )  '), '#0000ff');
	});

	test('getOuterHTML', 4, function() {
		DOM.add(document.body, 'div', {id : 'test'});

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		equals(DOM.getOuterHTML('test2').toLowerCase().replace(/\"/g, ''), '<span id=test2><span>test</span><span>test2</span></span>');

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		DOM.setOuterHTML('test2', '<div id="test2">123</div>');
		equals(tinymce.trim(DOM.getOuterHTML('test2') || '').toLowerCase().replace(/\"/g, ''), '<div id=test2>123</div>');

		DOM.setHTML('test', '<span id="test2"><span>test</span><span>test2</span></span>');
		DOM.setOuterHTML('test2', '<div id="test2">123</div><div id="test3">abc</div>');
		equals(tinymce.trim(DOM.get('test').innerHTML).toLowerCase().replace(/>\s+</g, '><').replace(/\"/g, ''), '<div id=test2>123</div><div id=test3>abc</div>');

		DOM.setHTML('test', 'test');
		equals(tinymce.trim(DOM.getOuterHTML(DOM.get('test').firstChild)), 'test');

		DOM.remove('test');
	});

	test('encodeDecode', 2, function() {
		equals(DOM.encode('\u00e5\u00e4\u00f6&<>"'), '\u00e5\u00e4\u00f6&amp;&lt;&gt;&quot;');
		equals(DOM.decode('&aring;&auml;&ouml;&amp;&lt;&gt;&quot;'), '\u00e5\u00e4\u00f6&<>"');
	});

	test('split', 1, function() {
		var point, parent;

		DOM.add(document.body, 'div', {id : 'test'}, '<p><b>text1<span>inner</span>text2</b></p>');

		parent = DOM.select('p', DOM.get('test'))[0];
		point = DOM.select('span', DOM.get('test'))[0];

		DOM.split(parent, point);
		equals(DOM.get('test').innerHTML.toLowerCase().replace(/\s+/g, ''), '<p><b>text1</b></p><span>inner</span><p><b>text2</b></p>');

		DOM.remove('test');
	});

	test('nodeIndex', 5, function() {
		DOM.add(document.body, 'div', {id : 'test'}, 'abc<b>abc</b>abc');

		equals(DOM.nodeIndex(DOM.get('test').childNodes[0]), 0, 'Index of first child.');
		equals(DOM.nodeIndex(DOM.get('test').childNodes[1]), 1, 'Index of second child.');
		equals(DOM.nodeIndex(DOM.get('test').childNodes[2]), 2, 'Index of third child.');

		DOM.get('test').insertBefore(DOM.doc.createTextNode('a'), DOM.get('test').firstChild);
		DOM.get('test').insertBefore(DOM.doc.createTextNode('b'), DOM.get('test').firstChild);

		equals(DOM.nodeIndex(DOM.get('test').lastChild), 4, 'Index of last child with fragmented DOM.');
		equals(DOM.nodeIndex(DOM.get('test').lastChild, true), 2, 'Normalized index of last child with fragmented DOM.');

		DOM.remove('test');
	});

	test('isEmpty', 13, function() {
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

		DOM.setHTML('test', '<img src="x">');
		ok(!DOM.isEmpty(DOM.get('test')), 'Non empty html with img element');

		DOM.setHTML('test', '<span data-mce-bookmark="1"></span>');
		ok(!DOM.isEmpty(DOM.get('test')), 'Span with bookmark attribute.');

		DOM.setHTML('test', '<span data-mce-style="color:Red"></span>');
		ok(DOM.isEmpty(DOM.get('test')), 'Span with data-mce attribute.');

		DOM.remove('test');
	});

	DOM.remove('test');
})();
