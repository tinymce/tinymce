var DOM = tinymce.DOM;

module("tinymce.dom.Serializer", {
	setupModule: function() {
		document.getElementById('view').innerHTML = '<div id="content"><div id="test"></div></div>';
	}
});

test('Schema rules', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	expect(8);

	ser.setRules('@[id|title|class|style],div,img[src|alt|-style|border],span,hr');
	DOM.setHTML('test', '<img title="test" src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" alt="test" border="0" style="border: 1px solid red" class="test" /><span id="test2">test</span><hr />');
	equal(ser.serialize(DOM.get('test')), '<div id="test"><img title="test" class="test" src="tinymce/ui/img/raster.gif" alt="test" border="0" /><span id="test2">test</span><hr /></div>', 'Global rule');

	ser.setRules('*a[*],em/i[*],strong/b[*i*]');
	DOM.setHTML('test', '<a href="test" data-mce-href="test">test</a><strong title="test" class="test">test2</strong><em title="test">test3</em>');
	equal(ser.serialize(DOM.get('test')), '<a href="test">test</a><strong title="test">test2</strong><em title="test">test3</em>', 'Wildcard rules');

	ser.setRules('br,hr,input[type|name|value],div[id],span[id],strong/b,a,em/i,a[!href|!name],img[src|border=0|title={$uid}]');
	DOM.setHTML('test', '<br /><hr /><input type="text" name="test" value="val" class="no" /><span id="test2" class="no"><b class="no">abc</b><em class="no">123</em></span>123<a href="file.html"  data-mce-href="file.html">link</a><a name="anchor"></a><a>no</a><img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" />');
	equal(ser.serialize(DOM.get('test')), '<div id="test"><br /><hr /><input type="text" name="test" value="val" /><span id="test2"><strong>abc</strong><em>123</em></span>123<a href="file.html">link</a><a name="anchor"></a>no<img src="tinymce/ui/img/raster.gif" border="0" title="mce_0" /></div>', 'Output name and attribute rules');

	ser.setRules('a[href|target<_blank?_top|title:forced value]');
	DOM.setHTML('test', '<a href="file.htm" data-mce-href="file.htm" target="_blank" title="title">link</a><a href="#" data-mce-href="#" target="test">test2</a>');
	equal(ser.serialize(DOM.get('test')), '<a href="file.htm" target="_blank" title="forced value">link</a><a href="#" title="forced value">test2</a>');

	ser.setRules('img[src|border=0|alt=]');
	DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" border="0" alt="" />');
	equal(ser.serialize(DOM.get('test')), '<img src="tinymce/ui/img/raster.gif" border="0" alt="" />', 'Default attribute with empty value');

	ser.setRules('img[src|border=0|alt=],*[*]');
	DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" /><hr />');
	equal(ser.serialize(DOM.get('test')), '<div id="test"><img src="tinymce/ui/img/raster.gif" border="0" alt="" /><hr /></div>');

	ser = new tinymce.dom.Serializer({
		valid_elements : 'img[src|border=0|alt=]',
		extended_valid_elements : 'div[id],img[src|alt=]'
	});
	DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" alt="" />');
	equal(ser.serialize(DOM.get('test')), '<div id="test"><img src="tinymce/ui/img/raster.gif" alt="" /></div>');

	ser = new tinymce.dom.Serializer({invalid_elements : 'hr,br'});
	DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" /><hr /><br />');
	equal(ser.serialize(DOM.get('test')), '<div id="test"><img src="tinymce/ui/img/raster.gif" /></div>');
});

test('Entity encoding', function() {
	var ser;

	expect(4);

	ser = new tinymce.dom.Serializer({entity_encoding : 'numeric'});
	DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
	equal(ser.serialize(DOM.get('test')), '<div id="test">&lt;&gt;&amp;"&#160;&#229;&#228;&#246;</div>');

	ser = new tinymce.dom.Serializer({entity_encoding : 'named'});
	DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
	equal(ser.serialize(DOM.get('test')), '<div id="test">&lt;&gt;&amp;"&nbsp;&aring;&auml;&ouml;</div>');

	ser = new tinymce.dom.Serializer({entity_encoding : 'named+numeric', entities : '160,nbsp,34,quot,38,amp,60,lt,62,gt'});
	DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
	equal(ser.serialize(DOM.get('test')), '<div id="test">&lt;&gt;&amp;"&nbsp;&#229;&#228;&#246;</div>');

	ser = new tinymce.dom.Serializer({entity_encoding : 'raw'});
	DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
	equal(ser.serialize(DOM.get('test')), '<div id="test">&lt;&gt;&amp;"\u00a0\u00e5\u00e4\u00f6</div>');
});

test('Form elements (general)', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	expect(5);

	ser.setRules('form[method],label[for],input[type|name|value|checked|disabled|readonly|length|maxlength],select[multiple],option[value|selected],textarea[name|disabled|readonly]');

	DOM.setHTML('test', '<input type="text" />');
	equal(ser.serialize(DOM.get('test')), '<input type="text" />');

	DOM.setHTML('test', '<input type="text" value="text" length="128" maxlength="129" />');
	equal(ser.serialize(DOM.get('test')), '<input type="text" value="text" length="128" maxlength="129" />');

	DOM.setHTML('test', '<form method="post"><input type="hidden" name="method" value="get" /></form>');
	equal(ser.serialize(DOM.get('test')), '<form method="post"><input type="hidden" name="method" value="get" /></form>');

	DOM.setHTML('test', '<label for="test">label</label>');
	equal(ser.serialize(DOM.get('test')), '<label for="test">label</label>');

	DOM.setHTML('test', '<input type="checkbox" value="test" /><input type="button" /><textarea></textarea>');

	// Edge will add an empty input value so remove that to normalize test since it doesn't break anything
	equal(ser.serialize(DOM.get('test')).replace(/ value=""/g, ''), '<input type="checkbox" value="test" /><input type="button" /><textarea></textarea>');
});

test('Form elements (checkbox)', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	expect(4);

	ser.setRules('form[method],label[for],input[type|name|value|checked|disabled|readonly|length|maxlength],select[multiple],option[value|selected]');

	DOM.setHTML('test', '<input type="checkbox" value="1">');
	equal(ser.serialize(DOM.get('test')), '<input type="checkbox" value="1" />');

	DOM.setHTML('test', '<input type="checkbox" value="1" checked disabled readonly>');
	equal(ser.serialize(DOM.get('test')), '<input type="checkbox" value="1" checked="checked" disabled="disabled" readonly="readonly" />');

	DOM.setHTML('test', '<input type="checkbox" value="1" checked="1" disabled="1" readonly="1">');
	equal(ser.serialize(DOM.get('test')), '<input type="checkbox" value="1" checked="checked" disabled="disabled" readonly="readonly" />');

	DOM.setHTML('test', '<input type="checkbox" value="1" checked="true" disabled="true" readonly="true">');
	equal(ser.serialize(DOM.get('test')), '<input type="checkbox" value="1" checked="checked" disabled="disabled" readonly="readonly" />');
});

test('Form elements (select)', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	expect(7);

	ser.setRules('form[method],label[for],input[type|name|value|checked|disabled|readonly|length|maxlength],select[multiple],option[value|selected]');

	DOM.setHTML('test', '<select><option value="1">test1</option><option value="2" selected>test2</option></select>');
	equal(ser.serialize(DOM.get('test')), '<select><option value="1">test1</option><option value="2" selected="selected">test2</option></select>');

	DOM.setHTML('test', '<select><option value="1">test1</option><option selected="1" value="2">test2</option></select>');
	equal(ser.serialize(DOM.get('test')), '<select><option value="1">test1</option><option value="2" selected="selected">test2</option></select>');

	DOM.setHTML('test', '<select><option value="1">test1</option><option value="2" selected="true">test2</option></select>');
	equal(ser.serialize(DOM.get('test')), '<select><option value="1">test1</option><option value="2" selected="selected">test2</option></select>');

	DOM.setHTML('test', '<select multiple></select>');
	equal(ser.serialize(DOM.get('test')), '<select multiple="multiple"></select>');

	DOM.setHTML('test', '<select multiple="multiple"></select>');
	equal(ser.serialize(DOM.get('test')), '<select multiple="multiple"></select>');

	DOM.setHTML('test', '<select multiple="1"></select>');
	equal(ser.serialize(DOM.get('test')), '<select multiple="multiple"></select>');

	DOM.setHTML('test', '<select></select>');
	equal(ser.serialize(DOM.get('test')), '<select></select>');
});

test('List elements', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	expect(5);

	ser.setRules('ul[compact],ol,li');

	DOM.setHTML('test', '<ul compact></ul>');
	equal(ser.serialize(DOM.get('test')), '<ul compact="compact"></ul>');

	DOM.setHTML('test', '<ul compact="compact"></ul>');
	equal(ser.serialize(DOM.get('test')), '<ul compact="compact"></ul>');

	DOM.setHTML('test', '<ul compact="1"></ul>');
	equal(ser.serialize(DOM.get('test')), '<ul compact="compact"></ul>');

	DOM.setHTML('test', '<ul></ul>');
	equal(ser.serialize(DOM.get('test')), '<ul></ul>');

	DOM.setHTML('test', '<ol><li>a</li><ol><li>b</li><li>c</li></ol><li>e</li></ol>');
	equal(ser.serialize(DOM.get('test')), '<ol><li>a<ol><li>b</li><li>c</li></ol></li><li>e</li></ol>');
});

test('Tables', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	expect(4);

	ser.setRules('table,tr,td[nowrap]');

	DOM.setHTML('test', '<table><tr><td></td></tr></table>');
	equal(ser.serialize(DOM.get('test')), '<table><tr><td></td></tr></table>');

	DOM.setHTML('test', '<table><tr><td nowrap></td></tr></table>');
	equal(ser.serialize(DOM.get('test')), '<table><tr><td nowrap="nowrap"></td></tr></table>');

	DOM.setHTML('test', '<table><tr><td nowrap="nowrap"></td></tr></table>');
	equal(ser.serialize(DOM.get('test')), '<table><tr><td nowrap="nowrap"></td></tr></table>');

	DOM.setHTML('test', '<table><tr><td nowrap="1"></td></tr></table>');
	equal(ser.serialize(DOM.get('test')), '<table><tr><td nowrap="nowrap"></td></tr></table>');
});

test('Styles', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	expect(1);

	ser.setRules('*[*]');

	DOM.setHTML('test', '<span style="border: 1px solid red" data-mce-style="border: 1px solid red;">test</span>');
	equal(ser.serialize(DOM.get('test')), '<div id="test"><span style="border: 1px solid red;">test</span></div>');
});

test('Comments', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	expect(1);

	ser.setRules('*[*]');

	DOM.setHTML('test', '<!-- abc -->');
	equal(ser.serialize(DOM.get('test')), '<div id="test"><!-- abc --></div>');
});

test('Non HTML elements and attributes', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	expect(2);

	ser.setRules('*[*]');
	ser.schema.addValidChildren('+div[prefix:test]');

	DOM.setHTML('test', '<div test:attr="test">test</div>');
	equal(ser.serialize(DOM.get('test'), {getInner : 1}), '<div test:attr="test">test</div>');

	DOM.setHTML('test', 'test1<prefix:test>Test</prefix:test>test2');
	equal(ser.serialize(DOM.get('test')), '<div id="test">test1<prefix:test>Test</prefix:test>test2</div>');
});

test('Padd empty elements', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	expect(1);

	ser.setRules('#p');

	DOM.setHTML('test', '<p>test</p><p></p>');
	equal(ser.serialize(DOM.get('test')), '<p>test</p><p>&nbsp;</p>');
});

test('Remove empty elements', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	expect(1);

	ser.setRules('-p');

	DOM.setHTML('test', '<p>test</p><p></p>');
	equal(ser.serialize(DOM.get('test')), '<p>test</p>');
});

test('Pre/post process events', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	expect(3);

	ser.setRules('div[id],span[id|class],a[href],b[class]');

	ser.onPreProcess = function(o) {
		equal(o.test, 'abc');
		DOM.setAttrib(o.node.getElementsByTagName('span')[0], 'class', 'abc');
	};

	ser.onPostProcess = function(o) {
		equal(o.test, 'abc');
		o.content = o.content.replace(/<b>/g, '<b class="123">');
	};

	DOM.setHTML('test', '<span id="test2"><b>abc</b></span>123<a href="file.html" data-mce-href="file.html">link</a>');
	equal(ser.serialize(DOM.get('test'), {test : 'abc'}), '<div id="test"><span id="test2" class="abc"><b class="123">abc</b></span>123<a href="file.html">link</a></div>');
});

test('Script with non JS type attribute', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<s' + 'cript type="mylanguage"></s' + 'cript>');
	equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript type="mylanguage"></s' + 'cript>');
});

test('Script with tags inside a comment', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<s' + 'cript>// <img src="test"><a href="#"></a></s' + 'cript>');
	equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n// <img src="test"><a href="#"></a>\n// ]]></s' + 'cript>');
});

test('Script with less than', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<s' + 'cript>1 < 2;</s' + 'cript>');
	equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
});

test('Script with type attrib and less than', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<s' + 'cript type="text/javascript">1 < 2;</s' + 'cript>');
	equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script type="text/javascript">// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
});

test('Script with whitespace in beginning/end', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<script>\n\t1 < 2;\n\t if (2 < 1)\n\t\talert(1);\n</s' + 'cript>');
	equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n\t1 < 2;\n\t if (2 < 1)\n\t\talert(1);\n// ]]></s' + 'cript>');
});

test('Script with a HTML comment and less than', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<script><!-- 1 < 2; // --></s' + 'cript>');
	equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
});

test('Script with white space in beginning, comment and less than', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<script>\n\n<!-- 1 < 2;\n\n--></s' + 'cript>');
	equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
});

test('Script with comments and cdata', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<script>// <![CDATA[1 < 2; // ]]></s' + 'cript>');
	equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
});

test('Script with cdata', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<script><![CDATA[1 < 2; ]]></s' + 'cript>');
	equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
});

test('Script whitespace in beginning/end and cdata', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<script>\n\n<![CDATA[\n\n1 < 2;\n\n]]>\n\n</s' + 'cript>');
	equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
});

test('Script with src attr', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<script src="test.js" data-mce-src="test.js"></s' + 'cript>');
	equal(ser.serialize(DOM.get('test')), '<s' + 'cript src="test.js"></s' + 'cript>');
});

test('Script with HTML comment, comment and CDATA', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<script><!--// <![CDATA[var hi = "hello";// ]]>--></s' + 'cript>');
	equal(ser.serialize(DOM.get('test')), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
});

test('Script with block comment around cdata', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<script>/* <![CDATA[ */\nvar hi = "hello";\n/* ]]> */</s' + 'cript>');
	equal(ser.serialize(DOM.get('test')), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
});

test('Script with html comment and block comment around cdata', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<script><!-- /* <![CDATA[ */\nvar hi = "hello";\n/* ]]>*/--></s' + 'cript>');
	equal(ser.serialize(DOM.get('test')), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
});

test('Script with line comment and html comment', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<script>// <!--\nvar hi = "hello";\n// --></s' + 'cript>');
	equal(ser.serialize(DOM.get('test')), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
});

test('Script with block comment around html comment', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});
	ser.setRules('script[type|language|src]');

	DOM.setHTML('test', '<script>/* <!-- */\nvar hi = "hello";\n/*-->*/</s' + 'cript>');
	equal(ser.serialize(DOM.get('test')), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
});

test('Protected blocks', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	expect(3);

	ser.setRules('noscript[test]');

	DOM.setHTML('test', '<!--mce:protected ' + escape('<noscript test="test"><br></noscript>') + '-->');
	equal(ser.serialize(DOM.get('test')), '<noscript test="test"><br></noscript>');

	DOM.setHTML('test', '<!--mce:protected ' + escape('<noscript><br></noscript>') + '-->');
	equal(ser.serialize(DOM.get('test')), '<noscript><br></noscript>');

	DOM.setHTML('test', '<!--mce:protected ' + escape('<noscript><!-- text --><br></noscript>') + '-->');
	equal(ser.serialize(DOM.get('test')), '<noscript><!-- text --><br></noscript>');
});

test('Style with whitespace at beginning', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true, valid_children: '+body[style]'});
	ser.setRules('style');

	DOM.setHTML('test', '<style> body { background:#fff }</style>');
	equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<style><!--\n body { background:#fff }\n--></style>');
});

test('Style with cdata', 1, function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true, valid_children: '+body[style]'});
	ser.setRules('style');

	DOM.setHTML('test', '<style>\r\n<![CDATA[\r\n   body { background:#fff }]]></style>');
	equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<style><!--\nbody { background:#fff }\n--></style>');
});

test('CDATA', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	expect(2);

	ser.setRules('span');

	DOM.setHTML('test', '123<!--[CDATA[<test>]]-->abc');
	equal(ser.serialize(DOM.get('test')), '123<![CDATA[<test>]]>abc');

	DOM.setHTML('test', '123<!--[CDATA[<te\n\nst>]]-->abc');
	equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '123<![CDATA[<te\n\nst>]]>abc');
});

test('BR at end of blocks', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	ser.setRules('ul,li,br');

	DOM.setHTML('test', '<ul><li>test<br /></li><li>test<br /></li><li>test<br /></li></ul>');
	equal(ser.serialize(DOM.get('test')), '<ul><li>test</li><li>test</li><li>test</li></ul>');
});

test('Map elements', function() {
	var ser = new tinymce.dom.Serializer({fix_list_elements : true});

	ser.setRules('map[id|name],area[shape|coords|href|target|alt]');

	DOM.setHTML('test', '<map id="planetmap" name="planetmap"><area shape="rect" coords="0,0,82,126" href="sun.htm" data-mce-href="sun.htm" target="_blank" alt="sun" /></map>');
	equal(ser.serialize(DOM.get('test')).toLowerCase(), '<map id="planetmap" name="planetmap"><area shape="rect" coords="0,0,82,126" href="sun.htm" target="_blank" alt="sun" /></map>');
});

test('Custom elements', function() {
	var ser = new tinymce.dom.Serializer({
		custom_elements: 'custom1,~custom2',
		valid_elements: 'custom1,custom2'
	});

	document.createElement('custom1');
	document.createElement('custom2');

	DOM.setHTML('test', '<p><custom1>c1</custom1><custom2>c2</custom2></p>');
	equal(ser.serialize(DOM.get('test')), '<custom1>c1</custom1><custom2>c2</custom2>');
});

test('Remove internal classes', function() {
	var ser = new tinymce.dom.Serializer({
		valid_elements: 'span[class]'
	});

	DOM.setHTML('test', '<span class="a mce-item-X mce-item-selected b"></span>');
	equal(ser.serialize(DOM.get('test')), '<span class="a b"></span>');

	DOM.setHTML('test', '<span class="a mce-item-X"></span>');
	equal(ser.serialize(DOM.get('test')), '<span class="a"></span>');

	DOM.setHTML('test', '<span class="mce-item-X"></span>');
	equal(ser.serialize(DOM.get('test')), '<span></span>');

	DOM.setHTML('test', '<span class="mce-item-X b"></span>');
	equal(ser.serialize(DOM.get('test')), '<span class=" b"></span>');

	DOM.setHTML('test', '<span class="b mce-item-X"></span>');
	equal(ser.serialize(DOM.get('test')), '<span class="b"></span>');
});

test('Restore tabindex', function() {
	var ser = new tinymce.dom.Serializer({
		valid_elements: 'span[tabindex]'
	});

	DOM.setHTML('test', '<span data-mce-tabindex="42"></span>');
	equal(ser.serialize(DOM.get('test')), '<span tabindex="42"></span>');
});

test('Trailing BR (IE11)', function() {
	var ser = new tinymce.dom.Serializer({
		valid_elements: 'p,br'
	});

	DOM.setHTML('test', '<p>a</p><br><br>');
	equal(ser.serialize(DOM.get('test')), '<p>a</p>');

	DOM.setHTML('test', 'a<br><br>');
	equal(ser.serialize(DOM.get('test')), 'a');
});

test('addTempAttr', function() {
	var ser = new tinymce.dom.Serializer({});

	ser.addTempAttr('data-x');
	ser.addTempAttr('data-y');

	DOM.setHTML('test', '<p data-x="1" data-y="2" data-z="3">a</p>');
	equal(ser.serialize(DOM.get('test'), {getInner: 1}), '<p data-z="3">a</p>');
	equal(ser.trimHtml('<p data-x="1" data-y="2" data-z="3">a</p>'), '<p data-z="3">a</p>');
});
