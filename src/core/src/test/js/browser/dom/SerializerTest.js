asynctest(
  'browser.tinymce.core.dom.SerializerTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Arr',
    'ephox.mcagar.api.LegacyUnit',
    'global!document',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.Serializer',
    'tinymce.core.test.ViewBlock'
  ],
  function (Pipeline, Step, Arr, LegacyUnit, document, DOMUtils, Serializer, ViewBlock) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var DOM = DOMUtils.DOM;
    var viewBlock = ViewBlock();

    var teardown = function () {
      viewBlock.update('');
    };

    var addTeardown = function (steps) {
      return Arr.bind(steps, function (step) {
        return [step, Step.sync(teardown)];
      });
    };

    suite.test('Schema rules', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules('@[id|title|class|style],div,img[src|alt|-style|border],span,hr');
      DOM.setHTML('test', '<img title="test" src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" alt="test" ' +
        'border="0" style="border: 1px solid red" class="test" /><span id="test2">test</span><hr />');
      LegacyUnit.equal(
        ser.serialize(DOM.get('test'), { getInner: true }),
        '<img title="test" class="test" src="tinymce/ui/img/raster.gif" ' +
        'alt="test" border="0" /><span id="test2">test</span><hr />', 'Global rule'
      );

      ser.setRules('*a[*],em/i[*],strong/b[*i*]');
      DOM.setHTML('test', '<a href="test" data-mce-href="test">test</a><strong title="test" class="test">test2</strong><em title="test">test3</em>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<a href="test">test</a><strong title="test">test2</strong><em title="test">' +
        'test3</em>', 'Wildcard rules');

      ser.setRules('br,hr,input[type|name|value],div[id],span[id],strong/b,a,em/i,a[!href|!name],img[src|border=0|title={$uid}]');
      DOM.setHTML('test', '<br /><hr /><input type="text" name="test" value="val" class="no" />' +
        '<span id="test2" class="no"><b class="no">abc</b><em class="no">123</em></span>123<a href="file.html" ' +
        'data-mce-href="file.html">link</a><a name="anchor"></a><a>no</a><img src="tinymce/ui/img/raster.gif" ' +
        'data-mce-src="tinymce/ui/img/raster.gif" />');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<div id="test"><br /><hr /><input type="text" name="test" value="val" />' +
        '<span id="test2"><strong>abc</strong><em>123</em></span>123<a href="file.html">link</a>' +
        '<a name="anchor"></a>no<img src="tinymce/ui/img/raster.gif" border="0" title="mce_0" /></div>', 'Output name and attribute rules');

      ser.setRules('img[src|border=0|alt=]');
      DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" border="0" alt="" />');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<img src="tinymce/ui/img/raster.gif" border="0" alt="" />', 'Default attribute with empty value');

      ser.setRules('img[src|border=0|alt=],div[style|id],*[*]');
      DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" /><hr />');
      LegacyUnit.equal(
        ser.serialize(DOM.get('test'), { getInner: true }),
        '<img src="tinymce/ui/img/raster.gif" border="0" alt="" /><hr />'
      );

      ser = new Serializer({
        valid_elements : 'img[src|border=0|alt=]',
        extended_valid_elements : 'div[id],img[src|alt=]'
      });
      DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" alt="" />');
      LegacyUnit.equal(
        ser.serialize(DOM.get('test')),
        '<div id="test"><img src="tinymce/ui/img/raster.gif" alt="" /></div>'
      );

      ser = new Serializer({ invalid_elements : 'hr,br' });
      DOM.setHTML('test', '<img src="tinymce/ui/img/raster.gif" data-mce-src="tinymce/ui/img/raster.gif" /><hr /><br />');
      LegacyUnit.equal(
        ser.serialize(DOM.get('test'), { getInner: true }),
        '<img src="tinymce/ui/img/raster.gif" />'
      );
    });

    suite.test('allow_unsafe_link_target (default)', function () {
      var ser = new Serializer({ });

      DOM.setHTML('test', '<a href="a" target="_blank">a</a><a href="b" target="_blank">b</a>');
      LegacyUnit.equal(
        ser.serialize(DOM.get('test'), { getInner: true }),
        '<a href="a" target="_blank" rel="noopener">a</a><a href="b" target="_blank" rel="noopener">b</a>'
      );

      DOM.setHTML('test', '<a href="a" rel="lightbox" target="_blank">a</a><a href="b" rel="lightbox" target="_blank">b</a>');
      LegacyUnit.equal(
        ser.serialize(DOM.get('test'), { getInner: true }),
        '<a href="a" target="_blank" rel="lightbox noopener">a</a><a href="b" target="_blank" rel="lightbox noopener">b</a>'
      );

      DOM.setHTML('test', '<a href="a" rel="lightbox x" target="_blank">a</a><a href="b" rel="lightbox x" target="_blank">b</a>');
      LegacyUnit.equal(
        ser.serialize(DOM.get('test'), { getInner: true }),
        '<a href="a" target="_blank" rel="lightbox x noopener">a</a><a href="b" target="_blank" rel="lightbox x noopener">b</a>'
      );

      DOM.setHTML('test', '<a href="a" rel="noopener a" target="_blank">a</a>');
      LegacyUnit.equal(
        ser.serialize(DOM.get('test'), { getInner: true }),
        '<a href="a" target="_blank" rel="noopener a">a</a>'
      );

      DOM.setHTML('test', '<a href="a" rel="a noopener b" target="_blank">a</a>');
      LegacyUnit.equal(
        ser.serialize(DOM.get('test'), { getInner: true }),
        '<a href="a" target="_blank" rel="a noopener b">a</a>'
      );
    });

    suite.test('allow_unsafe_link_target (disabled)', function () {
      var ser = new Serializer({ allow_unsafe_link_target: true });

      DOM.setHTML('test', '<a href="a" target="_blank">a</a><a href="b" target="_blank">b</a>');
      LegacyUnit.equal(
        ser.serialize(DOM.get('test'), { getInner: true }),
        '<a href="a" target="_blank">a</a><a href="b" target="_blank">b</a>'
      );
    });

    suite.test('Entity encoding', function () {
      var ser;

      ser = new Serializer({ entity_encoding : 'numeric' });
      DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
      LegacyUnit.equal(ser.serialize(DOM.get('test'), { getInner : true }), '&lt;&gt;&amp;"&#160;&#229;&#228;&#246;');

      ser = new Serializer({ entity_encoding : 'named' });
      DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
      LegacyUnit.equal(ser.serialize(DOM.get('test'), { getInner : true }), '&lt;&gt;&amp;"&nbsp;&aring;&auml;&ouml;');

      ser = new Serializer({ entity_encoding : 'named+numeric', entities : '160,nbsp,34,quot,38,amp,60,lt,62,gt' });
      DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
      LegacyUnit.equal(ser.serialize(DOM.get('test'), { getInner : true }), '&lt;&gt;&amp;"&nbsp;&#229;&#228;&#246;');

      ser = new Serializer({ entity_encoding : 'raw' });
      DOM.setHTML('test', '&lt;&gt;&amp;&quot;&nbsp;&aring;&auml;&ouml;');
      LegacyUnit.equal(ser.serialize(DOM.get('test'), { getInner : true }), '&lt;&gt;&amp;"\u00a0\u00e5\u00e4\u00f6');
    });

    suite.test('Form elements (general)', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules(
        'form[method],label[for],input[type|name|value|checked|disabled|readonly|length|maxlength],select[multiple],' +
        'option[value|selected],textarea[name|disabled|readonly]'
      );

      DOM.setHTML('test', '<input type="text" />');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<input type="text" />');

      DOM.setHTML('test', '<input type="text" value="text" length="128" maxlength="129" />');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<input type="text" value="text" length="128" maxlength="129" />');

      DOM.setHTML('test', '<form method="post"><input type="hidden" name="method" value="get" /></form>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<form method="post"><input type="hidden" name="method" value="get" /></form>');

      DOM.setHTML('test', '<label for="test">label</label>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<label for="test">label</label>');

      DOM.setHTML('test', '<input type="checkbox" value="test" /><input type="button" /><textarea></textarea>');

      // Edge will add an empty input value so remove that to normalize test since it doesn't break anything
      LegacyUnit.equal(
        ser.serialize(DOM.get('test')).replace(/ value=""/g, ''),
        '<input type="checkbox" value="test" /><input type="button" /><textarea></textarea>'
      );
    });

    suite.test('Form elements (checkbox)', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules('form[method],label[for],input[type|name|value|checked|disabled|readonly|length|maxlength],select[multiple],option[value|selected]');

      DOM.setHTML('test', '<input type="checkbox" value="1">');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<input type="checkbox" value="1" />');

      DOM.setHTML('test', '<input type="checkbox" value="1" checked disabled readonly>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<input type="checkbox" value="1" checked="checked" disabled="disabled" readonly="readonly" />');

      DOM.setHTML('test', '<input type="checkbox" value="1" checked="1" disabled="1" readonly="1">');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<input type="checkbox" value="1" checked="checked" disabled="disabled" readonly="readonly" />');

      DOM.setHTML('test', '<input type="checkbox" value="1" checked="true" disabled="true" readonly="true">');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<input type="checkbox" value="1" checked="checked" disabled="disabled" readonly="readonly" />');
    });

    suite.test('Form elements (select)', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules('form[method],label[for],input[type|name|value|checked|disabled|readonly|length|maxlength],select[multiple],option[value|selected]');

      DOM.setHTML('test', '<select><option value="1">test1</option><option value="2" selected>test2</option></select>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<select><option value="1">test1</option><option value="2" selected="selected">test2</option></select>');

      DOM.setHTML('test', '<select><option value="1">test1</option><option selected="1" value="2">test2</option></select>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<select><option value="1">test1</option><option value="2" selected="selected">test2</option></select>');

      DOM.setHTML('test', '<select><option value="1">test1</option><option value="2" selected="true">test2</option></select>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<select><option value="1">test1</option><option value="2" selected="selected">test2</option></select>');

      DOM.setHTML('test', '<select multiple></select>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<select multiple="multiple"></select>');

      DOM.setHTML('test', '<select multiple="multiple"></select>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<select multiple="multiple"></select>');

      DOM.setHTML('test', '<select multiple="1"></select>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<select multiple="multiple"></select>');

      DOM.setHTML('test', '<select></select>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<select></select>');
    });

    suite.test('List elements', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules('ul[compact],ol,li');

      DOM.setHTML('test', '<ul compact></ul>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<ul compact="compact"></ul>');

      DOM.setHTML('test', '<ul compact="compact"></ul>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<ul compact="compact"></ul>');

      DOM.setHTML('test', '<ul compact="1"></ul>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<ul compact="compact"></ul>');

      DOM.setHTML('test', '<ul></ul>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<ul></ul>');

      DOM.setHTML('test', '<ol><li>a</li><ol><li>b</li><li>c</li></ol><li>e</li></ol>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<ol><li>a<ol><li>b</li><li>c</li></ol></li><li>e</li></ol>');
    });

    suite.test('Tables', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules('table,tr,td[nowrap]');

      DOM.setHTML('test', '<table><tr><td></td></tr></table>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<table><tr><td></td></tr></table>');

      DOM.setHTML('test', '<table><tr><td nowrap></td></tr></table>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<table><tr><td nowrap="nowrap"></td></tr></table>');

      DOM.setHTML('test', '<table><tr><td nowrap="nowrap"></td></tr></table>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<table><tr><td nowrap="nowrap"></td></tr></table>');

      DOM.setHTML('test', '<table><tr><td nowrap="1"></td></tr></table>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<table><tr><td nowrap="nowrap"></td></tr></table>');
    });

    suite.test('Styles', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules('*[*]');

      DOM.setHTML('test', '<span style="border: 1px solid red" data-mce-style="border: 1px solid red;">test</span>');
      LegacyUnit.equal(ser.serialize(DOM.get('test'), { getInner: true }), '<span style="border: 1px solid red;">test</span>');
    });

    suite.test('Comments', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules('*[*]');

      DOM.setHTML('test', '<!-- abc -->');
      LegacyUnit.equal(ser.serialize(DOM.get('test'), { getInner: true }), '<!-- abc -->');
    });

    suite.test('Non HTML elements and attributes', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules('*[*]');
      ser.schema.addValidChildren('+div[prefix:test]');

      DOM.setHTML('test', '<div test:attr="test">test</div>');
      LegacyUnit.equal(ser.serialize(DOM.get('test'), { getInner : true }), '<div test:attr="test">test</div>');

      DOM.setHTML('test', 'test1<prefix:test>Test</prefix:test>test2');
      LegacyUnit.equal(ser.serialize(DOM.get('test'), { getInner: true }), 'test1<prefix:test>Test</prefix:test>test2');
    });

    suite.test('Padd empty elements', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules('#p');

      DOM.setHTML('test', '<p>test</p><p></p>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<p>test</p><p>&nbsp;</p>');
    });

    suite.test('Padd empty elements with BR', function () {
      var ser = new Serializer({ padd_empty_with_br: true });

      ser.setRules('#p,table,tr,#td,br');

      DOM.setHTML('test', '<p>a</p><p></p>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<p>a</p><p><br /></p>');
      DOM.setHTML('test', '<p>a</p><table><tr><td><br></td></tr></table>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<p>a</p><table><tr><td><br /></td></tr></table>');
    });

    suite.test('Remove empty elements', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules('-p');

      DOM.setHTML('test', '<p>test</p><p></p>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<p>test</p>');
    });

    suite.test('Pre/post process events', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules('div[id],span[id|class],a[href],b[class]');

      ser.onPreProcess = function (o) {
        LegacyUnit.equal(o.test, 'abc');
        DOM.setAttrib(o.node.getElementsByTagName('span')[0], 'class', 'abc');
      };

      ser.onPostProcess = function (o) {
        LegacyUnit.equal(o.test, 'abc');
        o.content = o.content.replace(/<b>/g, '<b class="123">');
      };

      DOM.setHTML('test', '<span id="test2"><b>abc</b></span>123<a href="file.html" data-mce-href="file.html">link</a>');
      LegacyUnit.equal(
        ser.serialize(DOM.get('test'), { test : 'abc' }),
        '<div id="test"><span id="test2" class="abc"><b class="123">abc</b></span>123<a href="file.html">link</a></div>'
      );
    });

    suite.test('Script with non JS type attribute', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<s' + 'cript type="mylanguage"></s' + 'cript>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript type="mylanguage"></s' + 'cript>');
    });

    suite.test('Script with tags inside a comment', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<s' + 'cript>// <img src="test"><a href="#"></a></s' + 'cript>');
      LegacyUnit.equal(
        ser.serialize(DOM.get('test')).replace(/\r/g, ''),
        '<s' + 'cript>// <![CDATA[\n// <img src="test"><a href="#"></a>\n// ]]></s' + 'cript>'
      );
    });

    suite.test('Script with less than', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<s' + 'cript>1 < 2;</s' + 'cript>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
    });

    suite.test('Script with type attrib and less than', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<s' + 'cript type="text/javascript">1 < 2;</s' + 'cript>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<script type="text/javascript">// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
    });

    suite.test('Script with whitespace in beginning/end', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<script>\n\t1 < 2;\n\t if (2 < 1)\n\t\talert(1);\n</s' + 'cript>');
      LegacyUnit.equal(
        ser.serialize(DOM.get('test')).replace(/\r/g, ''),
        '<s' + 'cript>// <![CDATA[\n\t1 < 2;\n\t if (2 < 1)\n\t\talert(1);\n// ]]></s' + 'cript>'
      );
    });

    suite.test('Script with a HTML comment and less than', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<script><!-- 1 < 2; // --></s' + 'cript>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
    });

    suite.test('Script with white space in beginning, comment and less than', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<script>\n\n<!-- 1 < 2;\n\n--></s' + 'cript>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
    });

    suite.test('Script with comments and cdata', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<script>// <![CDATA[1 < 2; // ]]></s' + 'cript>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
    });

    suite.test('Script with cdata', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<script><![CDATA[1 < 2; ]]></s' + 'cript>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
    });

    suite.test('Script whitespace in beginning/end and cdata', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<script>\n\n<![CDATA[\n\n1 < 2;\n\n]]>\n\n</s' + 'cript>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<s' + 'cript>// <![CDATA[\n1 < 2;\n// ]]></s' + 'cript>');
    });

    suite.test('Whitespace preserve in pre', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('pre');

      DOM.setHTML('test', '<pre>  </pre>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<pre>  </pre>');
    });

    suite.test('Script with src attr', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<script src="test.js" data-mce-src="test.js"></s' + 'cript>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<s' + 'cript src="test.js"></s' + 'cript>');
    });

    suite.test('Script with HTML comment, comment and CDATA', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<script><!--// <![CDATA[var hi = "hello";// ]]>--></s' + 'cript>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
    });

    suite.test('Script with block comment around cdata', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<script>/* <![CDATA[ */\nvar hi = "hello";\n/* ]]> */</s' + 'cript>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
    });

    suite.test('Script with html comment and block comment around cdata', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<script><!-- /* <![CDATA[ */\nvar hi = "hello";\n/* ]]>*/--></s' + 'cript>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
    });

    suite.test('Script with line comment and html comment', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<script>// <!--\nvar hi = "hello";\n// --></s' + 'cript>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
    });

    suite.test('Script with block comment around html comment', function () {
      var ser = new Serializer({ fix_list_elements : true });
      ser.setRules('script[type|language|src]');

      DOM.setHTML('test', '<script>/* <!-- */\nvar hi = "hello";\n/*-->*/</s' + 'cript>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<script>// <![CDATA[\nvar hi = \"hello\";\n// ]]></s' + 'cript>');
    });

    suite.test('Protected blocks', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules('noscript[test]');

      DOM.setHTML('test', '<!--mce:protected ' + escape('<noscript test="test"><br></noscript>') + '-->');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<noscript test="test"><br></noscript>');

      DOM.setHTML('test', '<!--mce:protected ' + escape('<noscript><br></noscript>') + '-->');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<noscript><br></noscript>');

      DOM.setHTML('test', '<!--mce:protected ' + escape('<noscript><!-- text --><br></noscript>') + '-->');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<noscript><!-- text --><br></noscript>');
    });

    suite.test('Style with whitespace at beginning', function () {
      var ser = new Serializer({ fix_list_elements : true, valid_children: '+body[style]' });
      ser.setRules('style');

      DOM.setHTML('test', '<style> body { background:#fff }</style>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<style><!--\n body { background:#fff }\n--></style>');
    });

    suite.test('Style with cdata', function () {
      var ser = new Serializer({ fix_list_elements : true, valid_children: '+body[style]' });
      ser.setRules('style');

      DOM.setHTML('test', '<style>\r\n<![CDATA[\r\n   body { background:#fff }]]></style>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '<style><!--\nbody { background:#fff }\n--></style>');
    });

    suite.test('CDATA', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules('span');

      DOM.setHTML('test', '123<!--[CDATA[<test>]]-->abc');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '123<![CDATA[<test>]]>abc');

      DOM.setHTML('test', '123<!--[CDATA[<te\n\nst>]]-->abc');
      LegacyUnit.equal(ser.serialize(DOM.get('test')).replace(/\r/g, ''), '123<![CDATA[<te\n\nst>]]>abc');
    });

    suite.test('BR at end of blocks', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules('ul,li,br');

      DOM.setHTML('test', '<ul><li>test<br /></li><li>test<br /></li><li>test<br /></li></ul>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<ul><li>test</li><li>test</li><li>test</li></ul>');
    });

    suite.test('Map elements', function () {
      var ser = new Serializer({ fix_list_elements : true });

      ser.setRules('map[id|name],area[shape|coords|href|target|alt]');

      DOM.setHTML(
        'test',
        '<map id="planetmap" name="planetmap"><area shape="rect" coords="0,0,82,126" href="sun.htm" data-mce-href="sun.htm" target="_blank" alt="sun" /></map>'
      );
      LegacyUnit.equal(
        ser.serialize(DOM.get('test')).toLowerCase(),
        '<map id="planetmap" name="planetmap"><area shape="rect" coords="0,0,82,126" href="sun.htm" target="_blank" alt="sun" /></map>'
      );
    });

    suite.test('Custom elements', function () {
      var ser = new Serializer({
        custom_elements: 'custom1,~custom2',
        valid_elements: 'custom1,custom2'
      });

      document.createElement('custom1');
      document.createElement('custom2');

      DOM.setHTML('test', '<p><custom1>c1</custom1><custom2>c2</custom2></p>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<custom1>c1</custom1><custom2>c2</custom2>');
    });

    suite.test('Remove internal classes', function () {
      var ser = new Serializer({
        valid_elements: 'span[class]'
      });

      DOM.setHTML('test', '<span class="a mce-item-X mce-item-selected b"></span>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<span class="a b"></span>');

      DOM.setHTML('test', '<span class="a mce-item-X"></span>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<span class="a"></span>');

      DOM.setHTML('test', '<span class="mce-item-X"></span>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<span></span>');

      DOM.setHTML('test', '<span class="mce-item-X b"></span>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<span class=" b"></span>');

      DOM.setHTML('test', '<span class="b mce-item-X"></span>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<span class="b"></span>');
    });

    suite.test('Restore tabindex', function () {
      var ser = new Serializer({
        valid_elements: 'span[tabindex]'
      });

      DOM.setHTML('test', '<span data-mce-tabindex="42"></span>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<span tabindex="42"></span>');
    });

    suite.test('Trailing BR (IE11)', function () {
      var ser = new Serializer({
        valid_elements: 'p,br'
      });

      DOM.setHTML('test', '<p>a</p><br><br>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), '<p>a</p>');

      DOM.setHTML('test', 'a<br><br>');
      LegacyUnit.equal(ser.serialize(DOM.get('test')), 'a');
    });

    suite.test('addTempAttr', function () {
      var ser = new Serializer({});

      ser.addTempAttr('data-x');
      ser.addTempAttr('data-y');

      DOM.setHTML('test', '<p data-x="1" data-y="2" data-z="3">a</p>');
      LegacyUnit.equal(ser.serialize(DOM.get('test'), { getInner: 1 }), '<p data-z="3">a</p>');
      LegacyUnit.equal(ser.trimHtml('<p data-x="1" data-y="2" data-z="3">a</p>'), '<p data-z="3">a</p>');
    });

    suite.test('addTempAttr same attr twice', function () {
      var ser1 = new Serializer({});
      var ser2 = new Serializer({});

      ser1.addTempAttr('data-x');
      ser2.addTempAttr('data-x');

      DOM.setHTML('test', '<p data-x="1" data-z="3">a</p>');
      LegacyUnit.equal(ser1.serialize(DOM.get('test'), { getInner: 1 }), '<p data-z="3">a</p>');
      LegacyUnit.equal(ser1.trimHtml('<p data-x="1" data-z="3">a</p>'), '<p data-z="3">a</p>');
      LegacyUnit.equal(ser2.serialize(DOM.get('test'), { getInner: 1 }), '<p data-z="3">a</p>');
      LegacyUnit.equal(ser2.trimHtml('<p data-x="1" data-z="3">a</p>'), '<p data-z="3">a</p>');
    });

    viewBlock.attach();
    viewBlock.get().id = 'test';

    Pipeline.async({}, addTeardown(suite.toSteps({})), function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);
