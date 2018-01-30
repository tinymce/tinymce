import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.FormattingCommandsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  const ok = function (value, label?) {
    return LegacyUnit.equal(value, true, label);
  };

  suite.test('Justify - multiple block elements selected - queryCommandState', function (editor) {
    editor.setContent(
      '<div style="text-align: left;"><div id="a" style="text-align: right;">' +
      'one</div><div id="b" style="text-align: right;">two</div></div>'
    );
    LegacyUnit.setSelection(editor, '#a', 0, '#b', 3);
    LegacyUnit.equal(editor.queryCommandState('JustifyLeft'), false);
    ok(editor.queryCommandState('JustifyRight'));
  });

  suite.test('Formatting commands (xhtmlTextStyles)', function (editor) {
    editor.focus();
    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('Bold');
    LegacyUnit.equal(editor.getContent(), '<p><strong>test 123</strong></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('Italic');
    LegacyUnit.equal(editor.getContent(), '<p><em>test 123</em></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('Underline');
    LegacyUnit.equal(editor.getContent(), '<p><span style="text-decoration: underline;">test 123</span></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('Strikethrough');
    LegacyUnit.equal(editor.getContent(), '<p><span style="text-decoration: line-through;">test 123</span></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('FontName', false, 'Arial');
    LegacyUnit.equal(editor.getContent(), '<p><span style="font-family: Arial;">test 123</span></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('FontSize', false, '7');
    LegacyUnit.equal(editor.getContent(), '<p><span style="font-size: xx-large;">test 123</span></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('ForeColor', false, '#FF0000');
    LegacyUnit.equal(editor.getContent(), '<p><span style="color: #ff0000;">test 123</span></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('HiliteColor', false, '#FF0000');
    LegacyUnit.equal(editor.getContent(), '<p><span style="background-color: #ff0000;">test 123</span></p>');

    editor.setContent('<p><span style="text-decoration: underline;">test 123</span></p>');
    LegacyUnit.equal(editor.getContent(), '<p><span style="text-decoration: underline;">test 123</span></p>');

    editor.setContent('<p><span style="text-decoration: line-through;">test 123</span></p>');
    LegacyUnit.equal(editor.getContent(), '<p><span style="text-decoration: line-through;">test 123</span></p>');

    editor.setContent('<p><span style="font-family: Arial;">test 123</span></p>');
    LegacyUnit.equal(editor.getContent(), '<p><span style="font-family: Arial;">test 123</span></p>');

    editor.setContent('<p><span style="font-size: xx-large;">test 123</span></p>');
    LegacyUnit.equal(editor.getContent(), '<p><span style="font-size: xx-large;">test 123</span></p>');

    editor.setContent('<p><strike>test 123</strike></p>');
    LegacyUnit.equal(editor.getContent(), '<p><span style="text-decoration: line-through;">test 123</span></p>');

    editor.setContent('<p><font face="Arial">test 123</font></p>');
    LegacyUnit.equal(editor.getContent(), '<p><span style="font-family: Arial;">test 123</span></p>');

    editor.setContent('<p><font size="7">test 123</font></p>');
    LegacyUnit.equal(editor.getContent(), '<p><span style="font-size: 300%;">test 123</span></p>');

    editor.setContent('<p><font face="Arial" size="7">test 123</font></p>');
    LegacyUnit.equal(editor.getContent(), '<p><span style="font-size: 300%; font-family: Arial;">test 123</span></p>');

    editor.setContent('<font style="background-color: #ff0000" color="#ff0000">test</font><font face="Arial">test</font>');
    LegacyUnit.equal(
      editor.getContent(),
      '<p><span style="color: #ff0000; background-color: #ff0000;">test</span><span style="font-family: Arial;">test</span></p>'
    );

    editor.setContent('<p><font face="Arial" style="color: #ff0000">test 123</font></p>');
    LegacyUnit.equal(editor.getContent(), '<p><span style="color: #ff0000; font-family: Arial;">test 123</span></p>');
  });

  suite.test('Formatting commands (alignInline)', function (editor) {
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('JustifyLeft');
    LegacyUnit.equal(editor.getContent(), '<p style="text-align: left;">test 123</p>');

    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('JustifyCenter');
    LegacyUnit.equal(editor.getContent(), '<p style="text-align: center;">test 123</p>');

    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('JustifyRight');
    LegacyUnit.equal(editor.getContent(), '<p style="text-align: right;">test 123</p>');

    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('JustifyFull');
    LegacyUnit.equal(editor.getContent(), '<p style="text-align: justify;">test 123</p>');

    editor.setContent('<img src="tinymce/ui/img/raster.gif" />');
    editor.selection.select(editor.dom.select('img')[0]);
    editor.execCommand('JustifyLeft');
    LegacyUnit.equal(editor.getContent(), '<p><img style="float: left;" src="tinymce/ui/img/raster.gif" /></p>');

    editor.setContent('<img src="tinymce/ui/img/raster.gif" />');
    editor.selection.select(editor.dom.select('img')[0]);
    editor.execCommand('JustifyCenter');
    LegacyUnit.equal(
      editor.getContent(),
      '<p><img style="margin-right: auto; margin-left: auto; display: block;" src="tinymce/ui/img/raster.gif" /></p>'
    );

    editor.setContent('<img src="tinymce/ui/img/raster.gif" />');
    editor.selection.select(editor.dom.select('img')[0]);
    editor.execCommand('JustifyRight');
    LegacyUnit.equal(editor.getContent(), '<p><img style="float: right;" src="tinymce/ui/img/raster.gif" /></p>');
  });

  suite.test('mceBlockQuote', function (editor) {
    editor.focus();
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('mceBlockQuote');
    LegacyUnit.equal(editor.getContent().replace(/\s+/g, ''), '<blockquote><p>test123</p></blockquote>');

    editor.setContent('<p>test 123</p><p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('mceBlockQuote');
    LegacyUnit.equal(editor.getContent().replace(/\s+/g, ''), '<blockquote><p>test123</p><p>test123</p></blockquote>');
  });

  suite.test('FormatBlock', function (editor) {
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'h1');
    LegacyUnit.equal(editor.getContent(), '<h1>test 123</h1>');

    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'h2');
    LegacyUnit.equal(editor.getContent(), '<h2>test 123</h2>');

    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'h3');
    LegacyUnit.equal(editor.getContent(), '<h3>test 123</h3>');

    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'h4');
    LegacyUnit.equal(editor.getContent(), '<h4>test 123</h4>');

    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'h5');
    LegacyUnit.equal(editor.getContent(), '<h5>test 123</h5>');

    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'h6');
    LegacyUnit.equal(editor.getContent(), '<h6>test 123</h6>');

    editor.execCommand('SelectAll');

    try {
      editor.execCommand('FormatBlock', false, 'div');
    } catch (ex) {
      // t.log('Failed: ' + ex.message);
    }

    LegacyUnit.equal(editor.getContent(), '<div>test 123</div>');

    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'address');
    LegacyUnit.equal(editor.getContent(), '<address>test 123</address>');

    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'pre');
    LegacyUnit.equal(editor.getContent(), '<pre>test 123</pre>');
  });

  suite.test('mceInsertLink (relative)', function (editor) {
    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertLink', false, 'test');
    LegacyUnit.equal(editor.getContent(), '<p><a href="test">test 123</a></p>');
  });

  suite.test('mceInsertLink (link absolute)', function (editor) {
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertLink', false, 'http://www.site.com');
    LegacyUnit.equal(editor.getContent(), '<p><a href="http://www.site.com">test 123</a></p>');
  });

  suite.test('mceInsertLink (link encoded)', function (editor) {
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertLink', false, '"&<>');
    LegacyUnit.equal(editor.getContent(), '<p><a href="&quot;&amp;&lt;&gt;">test 123</a></p>');
  });

  suite.test('mceInsertLink (link encoded and with class)', function (editor) {
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertLink', false, { href: '"&<>', class: 'test' });
    LegacyUnit.equal(editor.getContent(), '<p><a class="test" href="&quot;&amp;&lt;&gt;">test 123</a></p>');
  });

  suite.test('mceInsertLink (link with space)', function (editor) {
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertLink', false, { href: 'foo bar' });
    LegacyUnit.equal(editor.getContent(), '<p><a href="foo%20bar">test 123</a></p>');
  });

  suite.test('mceInsertLink (link floated img)', function (editor) {
    editor.setContent('<p><img style="float: right;" src="about:blank" /></p>');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertLink', false, 'link');
    LegacyUnit.equal(editor.getContent(), '<p><a href="link"><img style="float: right;" src="about:blank" /></a></p>');
  });

  suite.test('mceInsertLink (link adjacent text)', function (editor) {
    let rng;

    editor.setContent('<p><a href="#">a</a>b</p>');

    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild.lastChild, 0);
    rng.setEnd(editor.getBody().firstChild.lastChild, 1);
    editor.selection.setRng(rng);

    editor.execCommand('mceInsertLink', false, 'link');
    LegacyUnit.equal(editor.getContent(), '<p><a href="#">a</a><a href="link">b</a></p>');
  });

  suite.test('mceInsertLink (link text inside text)', function (editor) {
    editor.setContent('<p><a href="#"><em>abc</em></a></p>');
    LegacyUnit.setSelection(editor, 'em', 1, 'em', 2);

    editor.execCommand('mceInsertLink', false, 'link');
    LegacyUnit.equal(editor.getContent(), '<p><a href="link"><em>abc</em></a></p>');
  });

  suite.test('mceInsertLink (link around existing links)', function (editor) {
    editor.setContent('<p><a href="#1">1</a><a href="#2">2</a></p>');
    editor.execCommand('SelectAll');

    editor.execCommand('mceInsertLink', false, 'link');
    LegacyUnit.equal(editor.getContent(), '<p><a href="link">12</a></p>');
  });

  suite.test('mceInsertLink (link around existing links with different attrs)', function (editor) {
    editor.setContent('<p><a id="a" href="#1">1</a><a id="b" href="#2">2</a></p>');
    editor.execCommand('SelectAll');

    editor.execCommand('mceInsertLink', false, 'link');
    LegacyUnit.equal(editor.getContent(), '<p><a href="link">12</a></p>');
  });

  suite.test('mceInsertLink (link around existing complex contents with links)', function (editor) {
    editor.setContent(
      '<p><span id="s1"><strong><a id="a" href="#1"><em>1</em></a></strong></span><span id="s2">' +
      '<em><a id="b" href="#2"><strong>2</strong></a></em></span></p>'
    );
    editor.execCommand('SelectAll');

    editor.execCommand('mceInsertLink', false, 'link');
    LegacyUnit.equal(
      editor.getContent(),
      '<p><a href="link"><span id="s1"><strong><em>1</em>' +
        '</strong></span><span id="s2"><em><strong>2</strong></em></span></a></p>'
    );
  });

  suite.test('mceInsertLink (link text inside link)', function (editor) {
    editor.setContent('<p><a href="#">test</a></p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    editor.execCommand('SelectAll');

    editor.execCommand('mceInsertLink', false, 'link');
    LegacyUnit.equal(editor.getContent(), '<p><a href="link">test</a></p>');
  });

  suite.test('mceInsertLink bug #7331', function (editor) {
    editor.setContent('<table><tbody><tr><td>A</td></tr><tr><td>B</td></tr></tbody></table>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.$('td')[1].firstChild, 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertLink', false, { href: 'x' });
    LegacyUnit.equal(editor.getContent(), '<table><tbody><tr><td>A</td></tr><tr><td><a href=\"x\">B</a></td></tr></tbody></table>');
  });

  suite.test('unlink', function (editor) {
    editor.setContent('<p><a href="test">test</a> <a href="test">123</a></p>');
    editor.execCommand('SelectAll');
    editor.execCommand('unlink');
    LegacyUnit.equal(editor.getContent(), '<p>test 123</p>');
  });

  suite.test('unlink - unselected a[href] with childNodes', function (editor) {
    editor.setContent('<p><a href="test"><strong><em>test</em></strong></a></p>');
    LegacyUnit.setSelection(editor, 'em', 0);
    editor.execCommand('unlink');
    LegacyUnit.equal(editor.getContent(), '<p><strong><em>test</em></strong></p>');
  });

  suite.test('subscript/superscript', function (editor) {
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('subscript');
    LegacyUnit.equal(editor.getContent(), '<p><sub>test 123</sub></p>');

    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('superscript');
    LegacyUnit.equal(editor.getContent(), '<p><sup>test 123</sup></p>');

    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('subscript');
    editor.execCommand('subscript');
    LegacyUnit.equal(editor.getContent(), '<p>test 123</p>');

    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('superscript');
    editor.execCommand('superscript');
    LegacyUnit.equal(editor.getContent(), '<p>test 123</p>');
  });

  suite.test('indent/outdent', function (editor) {
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('Indent');
    LegacyUnit.equal(editor.getContent(), '<p style="padding-left: 30px;">test 123</p>');

    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('Indent');
    editor.execCommand('Indent');
    LegacyUnit.equal(editor.getContent(), '<p style="padding-left: 60px;">test 123</p>');

    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('Indent');
    editor.execCommand('Indent');
    editor.execCommand('Outdent');
    LegacyUnit.equal(editor.getContent(), '<p style="padding-left: 30px;">test 123</p>');

    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('Outdent');
    LegacyUnit.equal(editor.getContent(), '<p>test 123</p>');
  });

  suite.test('indent/outdent table always uses margin', function (editor) {
    editor.setContent('<table><tbody><tr><td>test</td></tr></tbody></table>');
    editor.execCommand('SelectAll');
    editor.execCommand('Indent');
    LegacyUnit.equal(editor.getContent(), '<table style="margin-left: 30px;"><tbody><tr><td>test</td></tr></tbody></table>');

    editor.setContent('<table><tbody><tr><td>test</td></tr></tbody></table>');
    editor.execCommand('SelectAll');
    editor.execCommand('Indent');
    editor.execCommand('Indent');
    LegacyUnit.equal(editor.getContent(), '<table style="margin-left: 60px;"><tbody><tr><td>test</td></tr></tbody></table>');

    editor.setContent('<table><tbody><tr><td>test</td></tr></tbody></table>');
    editor.execCommand('SelectAll');
    editor.execCommand('Indent');
    editor.execCommand('Indent');
    editor.execCommand('Outdent');
    LegacyUnit.equal(editor.getContent(), '<table style="margin-left: 30px;"><tbody><tr><td>test</td></tr></tbody></table>');

    editor.setContent('<table><tbody><tr><td>test</td></tr></tbody></table>');
    editor.execCommand('SelectAll');
    editor.execCommand('Outdent');
    LegacyUnit.equal(editor.getContent(), '<table><tbody><tr><td>test</td></tr></tbody></table>');
  });

  suite.test('RemoveFormat', function (editor) {
    editor.setContent('<p><em>test</em> <strong>123</strong> <a href="123">123</a> 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('RemoveFormat');
    LegacyUnit.equal(editor.getContent(), '<p>test 123 <a href="123">123</a> 123</p>');

    editor.setContent('<p><em><em>test</em> <strong>123</strong> <a href="123">123</a> 123</em></p>');
    editor.execCommand('SelectAll');
    editor.execCommand('RemoveFormat');
    LegacyUnit.equal(editor.getContent(), '<p>test 123 <a href="123">123</a> 123</p>');

    editor.setContent('<p><em>test<span id="x">test <strong>123</strong></span><a href="123">123</a> 123</em></p>');
    editor.selection.select(editor.dom.get('x'));
    editor.execCommand('RemoveFormat');
    LegacyUnit.equal(editor.getContent(), '<p><em>test</em><span id="x">test 123</span><em><a href="123">123</a> 123</em></p>');

    editor.setContent(
      '<p><dfn>dfn tag </dfn> <code>code tag </code> <samp>samp tag</samp> ' +
      '<kbd> kbd tag</kbd> <var> var tag</var> <cite> cite tag</cite> <mark> mark tag</mark> <q> q tag</q></p>'
    );
    editor.execCommand('SelectAll');
    editor.execCommand('RemoveFormat');
    LegacyUnit.equal(editor.getContent(), '<p>dfn tag code tag samp tag kbd tag var tag cite tag mark tag q tag</p>');
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    convert_urls: false,
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,' +
        'float,margin,margin-top,margin-right,margin-bottom,margin-left,padding-left,text-align,display'
    },
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
