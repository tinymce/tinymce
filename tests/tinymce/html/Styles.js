module("tinymce.html.Styles");

test('Basic parsing/serializing', function() {
	var styles = new tinymce.html.Styles();

	expect(12);

	equal(styles.serialize(styles.parse('FONT-SIZE:10px')), "font-size: 10px;");
	equal(styles.serialize(styles.parse('FONT-SIZE:10px;COLOR:red')), "font-size: 10px; color: red;");
	equal(styles.serialize(styles.parse('   FONT-SIZE  :  10px  ;   COLOR  :  red   ')), "font-size: 10px; color: red;");
	equal(styles.serialize(styles.parse('key:"value"')), "key: 'value';");
	equal(styles.serialize(styles.parse('key:"value1" \'value2\'')), "key: 'value1' 'value2';");
	equal(styles.serialize(styles.parse('key:"val\\"ue1" \'val\\\'ue2\'')), "key: 'val\"ue1' 'val\\'ue2';");
	equal(styles.serialize(styles.parse('width:100%')), 'width: 100%;');
	equal(styles.serialize(styles.parse('value:_; value2:"_"')), 'value: _; value2: \'_\';');
	equal(styles.serialize(styles.parse('value: "&amp;"')), "value: '&amp;';");
	equal(styles.serialize(styles.parse('value: "&"')), "value: '&';");
	equal(styles.serialize(styles.parse('value: ')), "");
	equal(styles.serialize(styles.parse("background: url('http://www.site.com/(foo)');")), "background: url('http://www.site.com/(foo)');");
});

test('Colors force hex and lowercase', function() {
	var styles = new tinymce.html.Styles();

	expect(6);

	equal(styles.serialize(styles.parse('color: rgb(1,2,3)')), "color: #010203;");
	equal(styles.serialize(styles.parse('color: RGB(1,2,3)')), "color: #010203;");
	equal(styles.serialize(styles.parse('color: #FF0000')), "color: #ff0000;");
	equal(styles.serialize(styles.parse('  color:   RGB  (  1  ,  2  ,  3  )  ')), "color: #010203;");
	equal(styles.serialize(styles.parse('   FONT-SIZE  :  10px  ;   COLOR  :  RGB  (  1  ,  2  ,  3  )   ')), "font-size: 10px; color: #010203;");
	equal(styles.serialize(styles.parse('   FONT-SIZE  :  10px  ;   COLOR  :  RED   ')), "font-size: 10px; color: red;");
});

test('Urls convert urls and force format', function() {
	var styles = new tinymce.html.Styles({url_converter : function(url) {
		return '|' + url + '|';
	}});

	expect(9);

	equal(styles.serialize(styles.parse('background: url(a)')), "background: url('|a|');");
	equal(styles.serialize(styles.parse('background: url("a")')), "background: url('|a|');");
	equal(styles.serialize(styles.parse("background: url('a')")), "background: url('|a|');");
	equal(styles.serialize(styles.parse('background: url(   a   )')), "background: url('|a|');");
	equal(styles.serialize(styles.parse('background: url(   "a"   )')), "background: url('|a|');");
	equal(styles.serialize(styles.parse("background: url(    'a'    )")), "background: url('|a|');");
	equal(styles.serialize(styles.parse('background1: url(a); background2: url("a"); background3: url(\'a\')')), "background1: url('|a|'); background2: url('|a|'); background3: url('|a|');");
	equal(styles.serialize(styles.parse("background: url('http://www.site.com/a?a=b&c=d')")), "background: url('|http://www.site.com/a?a=b&c=d|');");
	equal(styles.serialize(styles.parse("background: url('http://www.site.com/a_190x144.jpg');")), "background: url('|http://www.site.com/a_190x144.jpg|');");
});

test('Compress styles', function() {
	var styles = new tinymce.html.Styles();

	equal(
		styles.serialize(styles.parse('border-top: 1px solid red; border-left: 1px solid red; border-bottom: 1px solid red; border-right: 1px solid red;')),
		'border: 1px solid red;'
	);

	equal(
		styles.serialize(styles.parse('border-width: 1pt 1pt 1pt 1pt; border-style: none none none none; border-color: black black black black;')),
		'border: 1pt none black;'
	);

	equal(
		styles.serialize(styles.parse('border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;')),
		'border-width: 1pt 4pt 2pt 3pt; border-style: solid dashed dotted none; border-color: black red green blue;'
	);

	equal(
		styles.serialize(styles.parse('border-top: 1px solid red; border-left: 1px solid red; border-right: 1px solid red; border-bottom: 1px solid red')),
		'border: 1px solid red;'
	);

	equal(
		styles.serialize(styles.parse('border-top: 1px solid red; border-right: 2px solid red; border-bottom: 3px solid red; border-left: 4px solid red')),
		'border-top: 1px solid red; border-right: 2px solid red; border-bottom: 3px solid red; border-left: 4px solid red;'
	);

	equal(
		styles.serialize(styles.parse('padding-top: 1px; padding-right: 2px; padding-bottom: 3px; padding-left: 4px')),
		'padding: 1px 2px 3px 4px;'
	);

	equal(
		styles.serialize(styles.parse('margin-top: 1px; margin-right: 2px; margin-bottom: 3px; margin-left: 4px')),
		'margin: 1px 2px 3px 4px;'
	);

	equal(
		styles.serialize(styles.parse('margin-top: 1px; margin-right: 1px; margin-bottom: 1px; margin-left: 2px')),
		'margin: 1px 1px 1px 2px;'
	);

	equal(
		styles.serialize(styles.parse('margin-top: 2px; margin-right: 1px; margin-bottom: 1px; margin-left: 1px')),
		'margin: 2px 1px 1px 1px;'
	);

	equal(
		styles.serialize(styles.parse('border-top-color: red; border-right-color: green; border-bottom-color: blue; border-left-color: yellow')),
		'border-color: red green blue yellow;'
	);

	equal(
		styles.serialize(styles.parse('border-width: 1px; border-style: solid; border-color: red')),
		'border: 1px solid red;'
	);

	equal(
		styles.serialize(styles.parse('border-width: 1px; border-color: red')),
		'border-width: 1px; border-color: red;'
	);
});

test('Font weight', function() {
	var styles = new tinymce.html.Styles();

	expect(1);

	equal(styles.serialize(styles.parse('font-weight: 700')), "font-weight: bold;");
});

test('Valid styles', function() {
	var styles = new tinymce.html.Styles({}, new tinymce.html.Schema({valid_styles : {'*': 'color,font-size', 'a': 'margin-left'}}));

	expect(2);

	equal(styles.serialize(styles.parse('color: #ff0000; font-size: 10px; margin-left: 10px; invalid: 1;'), 'b'), "color: #ff0000; font-size: 10px;");
	equal(styles.serialize(styles.parse('color: #ff0000; font-size: 10px; margin-left: 10px; invalid: 2;'), 'a'), "color: #ff0000; font-size: 10px; margin-left: 10px;");
});

test('Invalid styles', function() {
	var styles = new tinymce.html.Styles({}, new tinymce.html.Schema({invalid_styles : {'*': 'color,font-size', 'a': 'margin-left'}}));

	equal(styles.serialize(styles.parse('color: #ff0000; font-size: 10px; margin-left: 10px'), 'b'), "margin-left: 10px;");
	equal(styles.serialize(styles.parse('color: #ff0000; font-size: 10px; margin-left: 10px; margin-right: 10px;'), 'a'), "margin-right: 10px;");
});

test('Suspicious (XSS) property names', function() {
	var styles = new tinymce.html.Styles();

	equal(styles.serialize(styles.parse('font-fa"on-load\\3dxss\\28\\29\\20mily:\'arial\'')), "");
	equal(styles.serialize(styles.parse('font-fa\\"on-load\\3dxss\\28\\29\\20mily:\'arial\'')), "");
	equal(styles.serialize(styles.parse('font-fa\\22on-load\\3dxss\\28\\29\\20mily:\'arial\'')), "");
});

test('Script urls denied', function() {
	var styles = new tinymce.html.Styles();

	equal(styles.serialize(styles.parse('behavior:url(test.htc)')), "");
	equal(styles.serialize(styles.parse('b\\65havior:url(test.htc)')), "");
	equal(styles.serialize(styles.parse('color:expression(alert(1))')), "");
	equal(styles.serialize(styles.parse('color:\\65xpression(alert(1))')), "");
	equal(styles.serialize(styles.parse('color:exp/**/ression(alert(1))')), "");
	equal(styles.serialize(styles.parse('color:/**/')), "");
	equal(styles.serialize(styles.parse('color:  expression  (  alert(1))')), "");
	equal(styles.serialize(styles.parse('background:url(jAvaScript:alert(1)')), "");
	equal(styles.serialize(styles.parse('background:url(javascript:alert(1)')), "");
	equal(styles.serialize(styles.parse('background:url(j\\61vascript:alert(1)')), "");
	equal(styles.serialize(styles.parse('background:url(\\6a\\61vascript:alert(1)')), "");
	equal(styles.serialize(styles.parse('background:url(\\6A\\61vascript:alert(1)')), "");
	equal(styles.serialize(styles.parse('background:url\\28\\6A\\61vascript:alert(1)')), "");
	equal(styles.serialize(styles.parse('background:\\75rl(j\\61vascript:alert(1)')), "");
	equal(styles.serialize(styles.parse('b\\61ckground:\\75rl(j\\61vascript:alert(1)')), "");
	equal(styles.serialize(styles.parse('background:url(vbscript:alert(1)')), "");
	equal(styles.serialize(styles.parse('background:url(j\navas\u0000cr\tipt:alert(1)')), "");
	equal(styles.serialize(styles.parse('background:url(data:image/svg+xml,%3Csvg/%3E)')), "");
	equal(styles.serialize(styles.parse('background:url( data:image/svg+xml,%3Csvg/%3E)')), "");
	equal(styles.serialize(styles.parse('background:url\\28 data:image/svg+xml,%3Csvg/%3E)')), "");
	equal(styles.serialize(styles.parse('background:url("data: image/svg+xml,%3Csvg/%3E")')), "");
	equal(styles.serialize(styles.parse('background:url("data: ima ge/svg+xml,%3Csvg/%3E")')), "");
	equal(styles.serialize(styles.parse('background:url("data: image /svg+xml,%3Csvg/%3E")')), "");
});

test('Script urls allowed', function() {
	var styles = new tinymce.html.Styles({allow_script_urls: true});

	equal(styles.serialize(styles.parse('behavior:url(test.htc)')), "behavior: url('test.htc');");
	equal(styles.serialize(styles.parse('color:expression(alert(1))')), "color: expression(alert(1));");
	equal(styles.serialize(styles.parse('background:url(javascript:alert(1)')), "background: url('javascript:alert(1');");
	equal(styles.serialize(styles.parse('background:url(vbscript:alert(1)')), "background: url('vbscript:alert(1');");
});
