import { context, describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.FormattingCommandsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    convert_urls: false,
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,' +
        'float,margin,margin-top,margin-right,margin-bottom,margin-left,padding-left,text-align,display'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('Justify - multiple block elements selected - queryCommandState', () => {
    const editor = hook.editor();
    editor.setContent(
      '<div style="text-align: left;"><div id="a" style="text-align: right;">' +
      'one</div><div id="b" style="text-align: right;">two</div></div>'
    );
    LegacyUnit.setSelection(editor, '#a', 0, '#b', 3);
    assert.isFalse(editor.queryCommandState('JustifyLeft'));
    assert.ok(editor.queryCommandState('JustifyRight'));
  });

  it('Formatting commands (xhtmlTextStyles)', () => {
    const editor = hook.editor();
    editor.focus();
    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('Bold');
    TinyAssertions.assertContent(editor, '<p><strong>test 123</strong></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('Italic');
    TinyAssertions.assertContent(editor, '<p><em>test 123</em></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('Underline');
    TinyAssertions.assertContent(editor, '<p><span style="text-decoration: underline;">test 123</span></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('Strikethrough');
    TinyAssertions.assertContent(editor, '<p><s>test 123</s></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('FontName', false, 'Arial');
    TinyAssertions.assertContent(editor, '<p><span style="font-family: Arial;">test 123</span></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('FontName', false, 'Bauhaus 93');
    TinyAssertions.assertContent(editor, `<p><span style="font-family: 'Bauhaus 93';">test 123</span></p>`);

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('FontSize', false, '7');
    TinyAssertions.assertContent(editor, '<p><span style="font-size: xx-large;">test 123</span></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('FontSize', false, '7pt');
    TinyAssertions.assertContent(editor, '<p><span style="font-size: 7pt;">test 123</span></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('ForeColor', false, '#FF0000');
    TinyAssertions.assertContent(editor, '<p><span style="color: rgb(255, 0, 0);">test 123</span></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('HiliteColor', false, '#FF0000');
    TinyAssertions.assertContent(editor, '<p><span style="background-color: rgb(255, 0, 0);">test 123</span></p>');

    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('BackColor', false, '#FF0000');
    TinyAssertions.assertContent(editor, '<p><span style="background-color: rgb(255, 0, 0);">test 123</span></p>');

    editor.setContent('<p><span style="text-decoration: underline;">test 123</span></p>');
    TinyAssertions.assertContent(editor, '<p><span style="text-decoration: underline;">test 123</span></p>');

    editor.setContent('<p><span style="text-decoration: line-through;">test 123</span></p>');
    TinyAssertions.assertContent(editor, '<p><span style="text-decoration: line-through;">test 123</span></p>');

    editor.setContent('<p><span style="font-family: Arial;">test 123</span></p>');
    TinyAssertions.assertContent(editor, '<p><span style="font-family: Arial;">test 123</span></p>');

    editor.setContent('<p><span style="font-size: xx-large;">test 123</span></p>');
    TinyAssertions.assertContent(editor, '<p><span style="font-size: xx-large;">test 123</span></p>');

    editor.setContent('<p><strike>test 123</strike></p>');
    TinyAssertions.assertContent(editor, '<p><s>test 123</s></p>');

    editor.setContent('<p><font face="Arial">test 123</font></p>');
    TinyAssertions.assertContent(editor, '<p><span style="font-family: Arial;">test 123</span></p>');

    editor.setContent('<p><font size="7">test 123</font></p>');
    TinyAssertions.assertContent(editor, '<p><span style="font-size: 300%;">test 123</span></p>');

    editor.setContent('<p><font face="Arial" size="7">test 123</font></p>');
    TinyAssertions.assertContent(editor, '<p><span style="font-size: 300%; font-family: Arial;">test 123</span></p>');

    editor.setContent('<font style="background-color: #ff0000" color="#ff0000">test</font><font face="Arial">test</font>');
    TinyAssertions.assertContent(
      editor,
      '<p><span style="color: #ff0000; background-color: #ff0000;">test</span><span style="font-family: Arial;">test</span></p>'
    );

    editor.setContent('<p><font face="Arial" style="color: #ff0000">test 123</font></p>');
    TinyAssertions.assertContent(editor, '<p><span style="color: #ff0000; font-family: Arial;">test 123</span></p>');
  });

  context('Formatting commands (alignInline)', () => {
    it('TBA - p, JustifyLeft', () => {
      const editor = hook.editor();
      editor.setContent('<p>test 123</p>');
      editor.execCommand('SelectAll');
      editor.execCommand('JustifyLeft');
      TinyAssertions.assertContent(editor, '<p style="text-align: left;">test 123</p>');
      assert.isTrue(editor.queryCommandState('JustifyLeft'), 'should have JustifyLeft state true');
    });

    it('TBA - p, JustifyCenter', () => {
      const editor = hook.editor();
      editor.setContent('<p>test 123</p>');
      editor.execCommand('SelectAll');
      editor.execCommand('JustifyCenter');
      TinyAssertions.assertContent(editor, '<p style="text-align: center;">test 123</p>');
      assert.isTrue(editor.queryCommandState('JustifyCenter'), 'should have JustifyCenter state true');
    });

    it('TBA - p, JustifyRight', () => {
      const editor = hook.editor();
      editor.setContent('<p>test 123</p>');
      editor.execCommand('SelectAll');
      editor.execCommand('JustifyRight');
      TinyAssertions.assertContent(editor, '<p style="text-align: right;">test 123</p>');
      assert.isTrue(editor.queryCommandState('JustifyRight'), 'should have JustifyRight state true');
    });

    it('TBA - p, JustifyFull', () => {
      const editor = hook.editor();
      editor.setContent('<p>test 123</p>');
      editor.execCommand('SelectAll');
      editor.execCommand('JustifyFull');
      TinyAssertions.assertContent(editor, '<p style="text-align: justify;">test 123</p>');
      assert.isTrue(editor.queryCommandState('JustifyFull'), 'should have JustifyFull state true');
    });

    it('TINY-7715 - pre, JustifyLeft', () => {
      const editor = hook.editor();
      editor.setContent('<pre>test 123</pre>');
      editor.execCommand('SelectAll');
      editor.execCommand('JustifyLeft');
      TinyAssertions.assertContent(editor, '<pre style="text-align: left;">test 123</pre>');
      assert.isTrue(editor.queryCommandState('JustifyLeft'), 'should have JustifyLeft state true');
    });

    it('TINY-7715 - pre, JustifyCenter', () => {
      const editor = hook.editor();
      editor.setContent('<pre>test 123</pre>');
      editor.execCommand('SelectAll');
      editor.execCommand('JustifyCenter');
      TinyAssertions.assertContent(editor, '<pre style="text-align: center;">test 123</pre>');
      assert.isTrue(editor.queryCommandState('JustifyCenter'), 'should have JustifyCenter state true');
    });

    it('TINY-7715 - pre, JustifyRight', () => {
      const editor = hook.editor();
      editor.setContent('<pre>test 123</pre>');
      editor.execCommand('SelectAll');
      editor.execCommand('JustifyRight');
      TinyAssertions.assertContent(editor, '<pre style="text-align: right;">test 123</pre>');
      assert.isTrue(editor.queryCommandState('JustifyRight'), 'should have JustifyRight state true');
    });

    it('TINY-7715 - pre, JustifyFull', () => {
      const editor = hook.editor();
      editor.setContent('<pre>test 123</pre>');
      editor.execCommand('SelectAll');
      editor.execCommand('JustifyFull');
      TinyAssertions.assertContent(editor, '<pre style="text-align: justify;">test 123</pre>');
      assert.isTrue(editor.queryCommandState('JustifyFull'), 'should have JustifyFull state true');
    });

    it('TBA - img, JustifyLeft', () => {
      const editor = hook.editor();
      editor.setContent('<img src="tinymce/ui/img/raster.gif" />');
      editor.selection.select(editor.dom.select('img')[0]);
      editor.execCommand('JustifyLeft');
      TinyAssertions.assertContent(editor, '<p><img style="float: left;" src="tinymce/ui/img/raster.gif"></p>');
    });

    it('TBA - img, JustifyCenter', () => {
      const editor = hook.editor();
      editor.setContent('<img src="tinymce/ui/img/raster.gif" />');
      editor.selection.select(editor.dom.select('img')[0]);
      editor.execCommand('JustifyCenter');
      TinyAssertions.assertContent(
        editor,
        '<p><img style="margin-right: auto; margin-left: auto; display: block;" src="tinymce/ui/img/raster.gif"></p>'
      );
    });

    it('TBA - img, JustifyRight', () => {
      const editor = hook.editor();
      editor.setContent('<img src="tinymce/ui/img/raster.gif" />');
      editor.selection.select(editor.dom.select('img')[0]);
      editor.execCommand('JustifyRight');
      TinyAssertions.assertContent(editor, '<p><img style="float: right;" src="tinymce/ui/img/raster.gif"></p>');
    });
  });

  it('mceBlockQuote', () => {
    const editor = hook.editor();
    editor.focus();
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('mceBlockQuote');
    assert.equal(editor.getContent().replace(/\s+/g, ''), '<blockquote><p>test123</p></blockquote>');

    editor.setContent('<p>test 123</p><p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('mceBlockQuote');
    assert.equal(editor.getContent().replace(/\s+/g, ''), '<blockquote><p>test123</p><p>test123</p></blockquote>');
  });

  it('FormatBlock', () => {
    const editor = hook.editor();
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'h1');
    TinyAssertions.assertContent(editor, '<h1>test 123</h1>');

    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'h2');
    TinyAssertions.assertContent(editor, '<h2>test 123</h2>');

    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'h3');
    TinyAssertions.assertContent(editor, '<h3>test 123</h3>');

    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'h4');
    TinyAssertions.assertContent(editor, '<h4>test 123</h4>');

    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'h5');
    TinyAssertions.assertContent(editor, '<h5>test 123</h5>');

    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'h6');
    TinyAssertions.assertContent(editor, '<h6>test 123</h6>');

    editor.execCommand('SelectAll');

    try {
      editor.execCommand('FormatBlock', false, 'div');
    } catch (ex) {
      // t.log('Failed: ' + ex.message);
    }

    TinyAssertions.assertContent(editor, '<div>test 123</div>');

    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'address');
    TinyAssertions.assertContent(editor, '<address>test 123</address>');

    editor.execCommand('SelectAll');
    editor.execCommand('FormatBlock', false, 'pre');
    TinyAssertions.assertContent(editor, '<pre>test 123</pre>');
  });

  it('createLink', () => {
    const editor = hook.editor();
    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('createLink', false, 'http://www.site.com');
    TinyAssertions.assertContent(editor, '<p><a href="http://www.site.com">test 123</a></p>');
  });

  it('mceInsertLink (relative)', () => {
    const editor = hook.editor();
    editor.setContent('test 123');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertLink', false, 'test');
    TinyAssertions.assertContent(editor, '<p><a href="test">test 123</a></p>');
  });

  it('mceInsertLink (link absolute)', () => {
    const editor = hook.editor();
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertLink', false, 'http://www.site.com');
    TinyAssertions.assertContent(editor, '<p><a href="http://www.site.com">test 123</a></p>');
  });

  it('mceInsertLink (link encoded)', () => {
    const editor = hook.editor();
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertLink', false, '"&<>');
    TinyAssertions.assertContent(editor, '<p><a href="&quot;&amp;&lt;&gt;">test 123</a></p>');
  });

  it('mceInsertLink (link encoded and with class)', () => {
    const editor = hook.editor();
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertLink', false, { href: '"&<>', class: 'test' });
    TinyAssertions.assertContent(editor, '<p><a class="test" href="&quot;&amp;&lt;&gt;">test 123</a></p>');
  });

  it('mceInsertLink (link with space)', () => {
    const editor = hook.editor();
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertLink', false, { href: 'foo bar' });
    TinyAssertions.assertContent(editor, '<p><a href="foo%20bar">test 123</a></p>');
  });

  it('mceInsertLink (link floated img)', () => {
    const editor = hook.editor();
    editor.setContent('<p><img style="float: right;" src="about:blank" /></p>');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertLink', false, 'link');
    TinyAssertions.assertContent(editor, '<p><a href="link"><img style="float: right;" src="about:blank"></a></p>');
  });

  it('mceInsertLink (link adjacent text)', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="#">a</a>b</p>');

    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild?.lastChild as Text, 0);
    rng.setEnd(editor.getBody().firstChild?.lastChild as Text, 1);
    editor.selection.setRng(rng);

    editor.execCommand('mceInsertLink', false, 'link');
    TinyAssertions.assertContent(editor, '<p><a href="#">a</a><a href="link">b</a></p>');
  });

  it('mceInsertLink (link text inside text)', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="#"><em>abc</em></a></p>');
    LegacyUnit.setSelection(editor, 'em', 1, 'em', 2);

    editor.execCommand('mceInsertLink', false, 'link');
    TinyAssertions.assertContent(editor, '<p><a href="link"><em>abc</em></a></p>');
  });

  it('mceInsertLink (link around existing links)', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="#1">1</a><a href="#2">2</a></p>');
    editor.execCommand('SelectAll');

    editor.execCommand('mceInsertLink', false, 'link');
    TinyAssertions.assertContent(editor, '<p><a href="link">12</a></p>');
  });

  it('mceInsertLink (link around existing links with different attrs)', () => {
    const editor = hook.editor();
    editor.setContent('<p><a id="a" href="#1">1</a><a id="b" href="#2">2</a></p>');
    editor.execCommand('SelectAll');

    editor.execCommand('mceInsertLink', false, 'link');
    TinyAssertions.assertContent(editor, '<p><a href="link">12</a></p>');
  });

  it('mceInsertLink (link around existing complex contents with links)', () => {
    const editor = hook.editor();
    editor.setContent(
      '<p><span id="s1"><strong><a id="a" href="#1"><em>1</em></a></strong></span><span id="s2">' +
      '<em><a id="b" href="#2"><strong>2</strong></a></em></span></p>'
    );
    editor.execCommand('SelectAll');

    editor.execCommand('mceInsertLink', false, 'link');
    TinyAssertions.assertContent(
      editor,
      '<p><a href="link"><span id="s1"><strong><em>1</em>' +
      '</strong></span><span id="s2"><em><strong>2</strong></em></span></a></p>'
    );
  });

  it('mceInsertLink (link text inside link)', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="#">test</a></p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    editor.execCommand('SelectAll');

    editor.execCommand('mceInsertLink', false, 'link');
    TinyAssertions.assertContent(editor, '<p><a href="link">test</a></p>');
  });

  it('mceInsertLink bug #7331', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td>A</td></tr><tr><td>B</td></tr></tbody></table>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('td')[1].firstChild as Text, 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertLink', false, { href: 'x' });
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>A</td></tr><tr><td><a href=\"x\">B</a></td></tr></tbody></table>');
  });

  it('unlink', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="test">test</a> <a href="test">123</a></p>');
    editor.execCommand('SelectAll');
    editor.execCommand('unlink');
    TinyAssertions.assertContent(editor, '<p>test 123</p>');
  });

  it('unlink - unselected a[href] with childNodes', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="test"><strong><em>test</em></strong></a></p>');
    LegacyUnit.setSelection(editor, 'em', 0);
    editor.execCommand('unlink');
    TinyAssertions.assertContent(editor, '<p><strong><em>test</em></strong></p>');
  });

  it('TINY-9172: unlink block links', () => {
    const editor = hook.editor();
    editor.setContent('<a href="test">test</a><div><a href="#"><p>test</p></a></div>');
    editor.execCommand('SelectAll');
    editor.execCommand('unlink');
    TinyAssertions.assertContent(editor, '<p>test</p><div><p>test</p></div>');
  });

  it('TINY-9739: Removing link should be a noop for noneditable selections', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<p><a href="#">tiny</a></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 3);
      editor.execCommand('unlink');
      TinyAssertions.assertContent(editor, '<p><a href="#">tiny</a></p>');
    });
  });

  it('subscript/superscript', () => {
    const editor = hook.editor();
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('subscript');
    TinyAssertions.assertContent(editor, '<p><sub>test 123</sub></p>');

    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('superscript');
    TinyAssertions.assertContent(editor, '<p><sup>test 123</sup></p>');

    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('subscript');
    editor.execCommand('subscript');
    TinyAssertions.assertContent(editor, '<p>test 123</p>');

    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('superscript');
    editor.execCommand('superscript');
    TinyAssertions.assertContent(editor, '<p>test 123</p>');
  });

  it('indent/outdent', () => {
    const editor = hook.editor();
    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('Indent');
    TinyAssertions.assertContent(editor, '<p style="padding-left: 40px;">test 123</p>');

    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('Indent');
    editor.execCommand('Indent');
    TinyAssertions.assertContent(editor, '<p style="padding-left: 80px;">test 123</p>');

    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('Indent');
    editor.execCommand('Indent');
    editor.execCommand('Outdent');
    TinyAssertions.assertContent(editor, '<p style="padding-left: 40px;">test 123</p>');

    editor.setContent('<p>test 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('Outdent');
    TinyAssertions.assertContent(editor, '<p>test 123</p>');
  });

  it('indent/outdent table always uses margin', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td>test</td></tr></tbody></table>');
    editor.execCommand('SelectAll');
    editor.execCommand('Indent');
    TinyAssertions.assertContent(editor, '<table style="margin-left: 40px;"><tbody><tr><td>test</td></tr></tbody></table>');

    editor.setContent('<table><tbody><tr><td>test</td></tr></tbody></table>');
    editor.execCommand('SelectAll');
    editor.execCommand('Indent');
    editor.execCommand('Indent');
    TinyAssertions.assertContent(editor, '<table style="margin-left: 80px;"><tbody><tr><td>test</td></tr></tbody></table>');

    editor.setContent('<table><tbody><tr><td>test</td></tr></tbody></table>');
    editor.execCommand('SelectAll');
    editor.execCommand('Indent');
    editor.execCommand('Indent');
    editor.execCommand('Outdent');
    TinyAssertions.assertContent(editor, '<table style="margin-left: 40px;"><tbody><tr><td>test</td></tr></tbody></table>');

    editor.setContent('<table><tbody><tr><td>test</td></tr></tbody></table>');
    editor.execCommand('SelectAll');
    editor.execCommand('Outdent');
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>test</td></tr></tbody></table>');
  });

  it('RemoveFormat', () => {
    const editor = hook.editor();
    editor.setContent('<p><em>test</em> <strong>123</strong> <a href="123">123</a> 123</p>');
    editor.execCommand('SelectAll');
    editor.execCommand('RemoveFormat');
    TinyAssertions.assertContent(editor, '<p>test 123 <a href="123">123</a> 123</p>');

    editor.setContent('<p><em><em>test</em> <strong>123</strong> <a href="123">123</a> 123</em></p>');
    editor.execCommand('SelectAll');
    editor.execCommand('RemoveFormat');
    TinyAssertions.assertContent(editor, '<p>test 123 <a href="123">123</a> 123</p>');

    editor.setContent('<p><em>test<span id="x">test <strong>123</strong></span><a href="123">123</a> 123</em></p>');
    editor.selection.select(editor.dom.get('x') as HTMLSpanElement);
    editor.execCommand('RemoveFormat');
    TinyAssertions.assertContent(editor, '<p><em>test</em><span id="x">test 123</span><em><a href="123">123</a> 123</em></p>');

    editor.setContent(
      '<p><dfn>dfn tag </dfn> <code>code tag </code> <samp>samp tag</samp> ' +
      '<kbd> kbd tag</kbd> <var> var tag</var> <cite> cite tag</cite> <mark> mark tag</mark> <q> q tag</q> ' +
      '<strike>strike tag</strike> <s>s tag</s> <small>small tag</small></p>'
    );
    editor.execCommand('SelectAll');
    editor.execCommand('RemoveFormat');
    TinyAssertions.assertContent(editor, '<p>dfn tag code tag samp tag kbd tag var tag cite tag mark tag q tag strike tag s tag small tag</p>');
  });
});
