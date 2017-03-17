asynctest(
  'browser.tinymce.core.keyboard.EnterKey',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.Env',
    'tinymce.core.FocusManager',
    'tinymce.core.test.HtmlUtils',
    'tinymce.core.util.Tools',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, LegacyUnit, TinyLoader, Env, FocusManager, HtmlUtils, Tools, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    Theme();

    var pressEnter = function (editor, evt) {
      var dom = editor.dom, target = editor.selection.getNode();

      evt = Tools.extend({ keyCode: 13 }, evt);

      dom.fire(target, 'keydown', evt);
      dom.fire(target, 'keypress', evt);
      dom.fire(target, 'keyup', evt);
    };

    suite.test('Enter at end of H1', function (editor) {
      editor.setContent('<h1>abc</h1>');
      LegacyUnit.setSelection(editor, 'h1', 3);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<h1>abc</h1><p>\u00a0</p>');
      LegacyUnit.equal(editor.selection.getRng(true).startContainer.nodeName, 'P');
    });

    suite.test('Enter in midde of H1', function (editor) {
      editor.setContent('<h1>abcd</h1>');
      LegacyUnit.setSelection(editor, 'h1', 2);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<h1>ab</h1><h1>cd</h1>');
      LegacyUnit.equal(editor.selection.getRng(true).startContainer.parentNode.nodeName, 'H1');
    });

    suite.test('Enter before text after EM', function (editor) {
      editor.setContent('<p><em>a</em>b</p>');
      editor.selection.setCursorLocation(editor.getBody().firstChild, 1);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p><em>a</em></p><p>b</p>');
      var rng = editor.selection.getRng(true);
      LegacyUnit.equal(rng.startContainer.nodeValue, 'b');
    });

    suite.test('Enter before first IMG in P', function (editor) {
      editor.setContent('<p><img src="about:blank" /></p>');
      editor.selection.setCursorLocation(editor.getBody().firstChild, 0);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>\u00a0</p><p><img src="about:blank" /></p>');
    });

    suite.test('Enter before first wrapped IMG in P', function (editor) {
      editor.setContent('<p><b><img src="about:blank" /></b></p>');
      editor.selection.setCursorLocation(editor.getBody().firstChild.firstChild, 0);
      pressEnter(editor);
      LegacyUnit.equal(editor.getBody().firstChild.innerHTML, (Env.ie && Env.ie < 11) ? '' : '<br data-mce-bogus="1">');
      LegacyUnit.equal(editor.getContent(), '<p>\u00a0</p><p><b><img src="about:blank" /></b></p>');
    });

    suite.test('Enter before last IMG in P with text', function (editor) {
      editor.setContent('<p>abc<img src="about:blank" /></p>');
      editor.selection.setCursorLocation(editor.getBody().firstChild, 1);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>abc</p><p><img src="about:blank" /></p>');
      var rng = editor.selection.getRng(true);
      LegacyUnit.equal(rng.startContainer.nodeName, 'P');
      LegacyUnit.equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'IMG');
    });

    suite.test('Enter before last IMG in P with IMG sibling', function (editor) {
      editor.setContent('<p><img src="about:blank" /><img src="about:blank" /></p>');
      editor.selection.setCursorLocation(editor.getBody().firstChild, 1);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p><img src="about:blank" /></p><p><img src="about:blank" /></p>');
      var rng = editor.selection.getRng(true);
      LegacyUnit.equal(rng.startContainer.nodeName, 'P');
      LegacyUnit.equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'IMG');
    });

    suite.test('Enter after last IMG in P', function (editor) {
      editor.setContent('<p>abc<img src="about:blank" /></p>');
      editor.selection.setCursorLocation(editor.getBody().firstChild, 2);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>abc<img src="about:blank" /></p><p>\u00a0</p>');
    });

    suite.test('Enter before last INPUT in P with text', function (editor) {
      editor.setContent('<p>abc<input type="text" /></p>');
      editor.selection.setCursorLocation(editor.getBody().firstChild, 1);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>abc</p><p><input type="text" /></p>');
      var rng = editor.selection.getRng(true);
      LegacyUnit.equal(rng.startContainer.nodeName, 'P');
      LegacyUnit.equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'INPUT');
    });

    suite.test('Enter before last INPUT in P with IMG sibling', function (editor) {
      editor.setContent('<p><input type="text" /><input type="text" /></p>');
      editor.selection.setCursorLocation(editor.getBody().firstChild, 1);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p><input type="text" /></p><p><input type="text" /></p>');
      var rng = editor.selection.getRng(true);
      LegacyUnit.equal(rng.startContainer.nodeName, 'P');
      LegacyUnit.equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'INPUT');
    });

    suite.test('Enter after last INPUT in P', function (editor) {
      editor.setContent('<p>abc<input type="text" /></p>');
      editor.selection.setCursorLocation(editor.getBody().firstChild, 2);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>abc<input type="text" /></p><p>\u00a0</p>');
    });

    suite.test('Enter at end of P', function (editor) {
      editor.setContent('<p>abc</p>');
      LegacyUnit.setSelection(editor, 'p', 3);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>abc</p><p>\u00a0</p>');
      LegacyUnit.equal(editor.selection.getRng(true).startContainer.nodeName, 'P');
    });

    suite.test('Enter at end of EM inside P', function (editor) {
      editor.setContent('<p><em>abc</em></p>');
      LegacyUnit.setSelection(editor, 'em', 3);
      pressEnter(editor);
      LegacyUnit.equal(
        HtmlUtils.cleanHtml(editor.getBody().innerHTML).replace(/<br([^>]+|)>|&nbsp;/g, ''),
        '<p><em>abc</em></p><p><em></em></p>'
      );
      LegacyUnit.equal(editor.selection.getRng(true).startContainer.nodeName, 'EM');
    });

    suite.test('Enter at middle of EM inside P', function (editor) {
      editor.setContent('<p><em>abcd</em></p>');
      LegacyUnit.setSelection(editor, 'em', 2);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p><em>ab</em></p><p><em>cd</em></p>');
      LegacyUnit.equal(editor.selection.getRng(true).startContainer.parentNode.nodeName, 'EM');
    });

    suite.test('Enter at beginning EM inside P', function (editor) {
      editor.setContent('<p><em>abc</em></p>');
      LegacyUnit.setSelection(editor, 'em', 0);
      pressEnter(editor);
      LegacyUnit.equal(
        HtmlUtils.cleanHtml(editor.getBody().innerHTML).replace(/<br([^>]+|)>|&nbsp;/g, ''),
        '<p><em></em></p><p><em>abc</em></p>'
      );
      LegacyUnit.equal(editor.selection.getRng(true).startContainer.nodeValue, 'abc');
    });

    suite.test('Enter at end of STRONG in EM inside P', function (editor) {
      editor.setContent('<p><em><strong>abc</strong></em></p>');
      LegacyUnit.setSelection(editor, 'strong', 3);
      pressEnter(editor);
      LegacyUnit.equal(
        HtmlUtils.cleanHtml(editor.getBody().innerHTML).replace(/<br([^>]+|)>|&nbsp;/g, ''),
        '<p><em><strong>abc</strong></em></p><p><em><strong></strong></em></p>'
      );
      LegacyUnit.equal(editor.selection.getRng(true).startContainer.nodeName, 'STRONG');
    });

    suite.test('Enter at middle of STRONG in EM inside P', function (editor) {
      editor.setContent('<p><em><strong>abcd</strong></em></p>');
      LegacyUnit.setSelection(editor, 'strong', 2);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p><em><strong>ab</strong></em></p><p><em><strong>cd</strong></em></p>');
      LegacyUnit.equal(editor.selection.getRng(true).startContainer.parentNode.nodeName, 'STRONG');
    });

    suite.test('Enter at beginning STRONG in EM inside P', function (editor) {
      editor.setContent('<p><em><strong>abc</strong></em></p>');
      LegacyUnit.setSelection(editor, 'strong', 0);
      pressEnter(editor);
      LegacyUnit.equal(
        HtmlUtils.cleanHtml(editor.getBody().innerHTML).replace(/<br([^>]+|)>|&nbsp;/g, ''),
        '<p><em><strong></strong></em></p><p><em><strong>abc</strong></em></p>'
      );
      LegacyUnit.equal(editor.selection.getRng(true).startContainer.nodeValue, 'abc');
    });

    suite.test('Enter at beginning of P', function (editor) {
      editor.setContent('<p>abc</p>');
      LegacyUnit.setSelection(editor, 'p', 0);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>\u00a0</p><p>abc</p>');
      LegacyUnit.equal(editor.selection.getRng(true).startContainer.nodeValue, 'abc');
    });

    suite.test('Enter at middle of P with style, id and class attributes', function (editor) {
      editor.setContent('<p id="a" class="b" style="color:#000">abcd</p>');
      LegacyUnit.setSelection(editor, 'p', 2);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p id="a" class="b" style="color: #000;">ab</p><p class="b" style="color: #000;">cd</p>');
      LegacyUnit.equal(editor.selection.getRng(true).startContainer.parentNode.nodeName, 'P');
    });

    suite.test('Enter at a range between H1 and P', function (editor) {
      editor.setContent('<h1>abcd</h1><p>efgh</p>');
      LegacyUnit.setSelection(editor, 'h1', 2, 'p', 2);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<h1>abgh</h1>');
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'H1');
    });

    suite.test('Enter at end of H1 in HGROUP', function (editor) {
      editor.setContent('<hgroup><h1>abc</h1></hgroup>');
      LegacyUnit.setSelection(editor, 'h1', 3);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<hgroup><h1>abc</h1><h1>\u00a0</h1></hgroup>');
      LegacyUnit.equal(editor.selection.getRng(true).startContainer.nodeName, 'H1');
    });

    suite.test('Enter inside empty TD', function (editor) {
      editor.getBody().innerHTML = '<table><tr><td></td></tr></table>';
      LegacyUnit.setSelection(editor, 'td', 0);
      pressEnter(editor);
      LegacyUnit.equal(
        HtmlUtils.cleanHtml(editor.getBody().innerHTML).replace(/<br([^>]+|)>|&nbsp;/g, ''),
        '<table><tbody><tr><td><p></p><p></p></td></tr></tbody></table>'
      );
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
    });

    suite.test('Shift+Enter inside STRONG inside TD with BR', function (editor) {
      editor.getBody().innerHTML = '<table><tr><td>d <strong>e</strong><br></td></tr></table>';
      LegacyUnit.setSelection(editor, 'strong', 1);
      pressEnter(editor, { shiftKey: true });
      LegacyUnit.equal(
        HtmlUtils.cleanHtml(editor.getBody().innerHTML),
        '<table><tbody><tr><td>d <strong>e<br></strong><br></td></tr></tbody></table>'
      );
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'STRONG');
    });

    suite.test('Enter inside middle of text node in body', function (editor) {
      editor.getBody().innerHTML = 'abcd';
      LegacyUnit.setSelection(editor, 'body', 2);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>ab</p><p>cd</p>');
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
    });

    suite.test('Enter inside at beginning of text node in body', function (editor) {
      editor.getBody().innerHTML = 'abcd';
      LegacyUnit.setSelection(editor, 'body', 0);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>\u00a0</p><p>abcd</p>');
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
    });

    suite.test('Enter inside at end of text node in body', function (editor) {
      editor.getBody().innerHTML = 'abcd';
      LegacyUnit.setSelection(editor, 'body', 4);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>abcd</p><p>\u00a0</p>');
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
    });

    suite.test('Enter inside empty body', function (editor) {
      editor.getBody().innerHTML = '';
      LegacyUnit.setSelection(editor, 'body', 0);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>\u00a0</p><p>\u00a0</p>');
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
    });

    suite.test('Enter in the middle of text in P with forced_root_block set to false', function (editor) {
      editor.settings.forced_root_block = false;
      editor.getBody().innerHTML = '<p>abc</p>';
      LegacyUnit.setSelection(editor, 'p', 2);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>ab<br />c</p>');
    });

    suite.test('Enter at the end of text in P with forced_root_block set to false', function (editor) {
      editor.settings.forced_root_block = false;
      editor.getBody().innerHTML = '<p>abc</p>';
      LegacyUnit.setSelection(editor, 'p', 3);
      pressEnter(editor);
      LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), (Env.ie && Env.ie < 11) ? '<p>abc<br></p>' : '<p>abc<br><br></p>');
      editor.settings.forced_root_block = 'p';
    });

    suite.test('Enter at the middle of text in BODY with forced_root_block set to false', function (editor) {
      editor.settings.forced_root_block = false;
      editor.getBody().innerHTML = 'abcd';
      LegacyUnit.setSelection(editor, 'body', 2);
      editor.focus();
      pressEnter(editor);
      LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), 'ab<br>cd');
      editor.settings.forced_root_block = 'p';
    });

    suite.test('Enter at the beginning of text in BODY with forced_root_block set to false', function (editor) {
      editor.settings.forced_root_block = false;
      editor.getBody().innerHTML = 'abcd';
      LegacyUnit.setSelection(editor, 'body', 0);
      editor.focus();
      pressEnter(editor);
      LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<br>abcd');
      editor.settings.forced_root_block = 'p';
    });

    suite.test('Enter at the end of text in BODY with forced_root_block set to false', function (editor) {
      editor.settings.forced_root_block = false;
      editor.getBody().innerHTML = 'abcd';
      LegacyUnit.setSelection(editor, 'body', 4);
      editor.focus();
      pressEnter(editor);
      LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), (Env.ie && Env.ie < 11) ? 'abcd<br>' : 'abcd<br><br>');
      editor.settings.forced_root_block = 'p';
    });

    suite.test('Enter in empty P at the end of a blockquote and end_container_on_empty_block: true', function (editor) {
      editor.settings.end_container_on_empty_block = true;
      editor.getBody().innerHTML = (Env.ie && Env.ie < 11) ?
        '<blockquote><p>abc</p><p></p></blockquote>' : '<blockquote><p>abc</p><p><br></p></blockquote>';
      LegacyUnit.setSelection(editor, 'p:last', 0);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<blockquote><p>abc</p></blockquote><p>\u00a0</p>');
      editor.settings.forced_root_block = 'p';
    });

    suite.test('Enter in empty P at the beginning of a blockquote and end_container_on_empty_block: true', function (editor) {
      editor.settings.end_container_on_empty_block = true;
      editor.getBody().innerHTML = (Env.ie && Env.ie < 11) ?
        '<blockquote><p></p><p>abc</p></blockquote>' : '<blockquote><p><br></p><p>abc</p></blockquote>';
      LegacyUnit.setSelection(editor, 'p', 0);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>\u00a0</p><blockquote><p>abc</p></blockquote>');
      editor.settings.forced_root_block = 'p';
    });

    suite.test('Enter in empty P at in the middle of a blockquote and end_container_on_empty_block: true', function (editor) {
      editor.settings.end_container_on_empty_block = true;
      editor.getBody().innerHTML = (Env.ie && Env.ie < 11) ?
        '<blockquote><p>abc</p><p></p><p>123</p></blockquote>' : '<blockquote><p>abc</p><p><br></p><p>123</p></blockquote>';
      LegacyUnit.setSelection(editor, 'p:nth-child(2)', 0);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<blockquote><p>abc</p></blockquote><p>\u00a0</p><blockquote><p>123</p></blockquote>');
      editor.settings.forced_root_block = 'p';
    });

    suite.test('Enter inside empty P with empty P siblings', function (editor) {
      // Tests that a workaround for an IE bug is working correctly
      editor.getBody().innerHTML = '<p></p><p></p><p>X</p>';
      LegacyUnit.setSelection(editor, 'p', 0);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>\u00a0</p><p>\u00a0</p><p>\u00a0</p><p>X</p>');
    });

    suite.test('Enter at end of H1 with forced_root_block_attrs', function (editor) {
      editor.settings.forced_root_block_attrs = { "class": "class1" };
      editor.getBody().innerHTML = '<h1>a</h1>';
      LegacyUnit.setSelection(editor, 'h1', 1);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<h1>a</h1><p class="class1">\u00a0</p>');
      delete editor.settings.forced_root_block_attrs;
    });

    suite.test('Shift+Enter at beginning of P', function (editor) {
      editor.getBody().innerHTML = '<p>abc</p>';
      LegacyUnit.setSelection(editor, 'p', 0);
      pressEnter(editor, { shiftKey: true });
      LegacyUnit.equal(editor.getContent(), '<p><br />abc</p>');
    });

    suite.test('Shift+Enter in the middle of P', function (editor) {
      editor.getBody().innerHTML = '<p>abcd</p>';
      LegacyUnit.setSelection(editor, 'p', 2);
      pressEnter(editor, { shiftKey: true });
      LegacyUnit.equal(editor.getContent(), '<p>ab<br />cd</p>');
    });

    suite.test('Shift+Enter at the end of P', function (editor) {
      editor.getBody().innerHTML = '<p>abcd</p>';
      LegacyUnit.setSelection(editor, 'p', 4);
      pressEnter(editor, { shiftKey: true });
      LegacyUnit.equal(editor.getContent(), (Env.ie && Env.ie < 11) ? '<p>abcd</p>' : '<p>abcd<br /><br /></p>');
    });

    suite.test('Shift+Enter in the middle of B with a BR after it', function (editor) {
      editor.getBody().innerHTML = '<p><b>abcd</b><br></p>';
      LegacyUnit.setSelection(editor, 'b', 2);
      pressEnter(editor, { shiftKey: true });
      LegacyUnit.equal(editor.getContent(), '<p><b>ab<br />cd</b></p>');
    });

    suite.test('Shift+Enter at the end of B with a BR after it', function (editor) {
      editor.getBody().innerHTML = '<p><b>abcd</b><br></p>';
      LegacyUnit.setSelection(editor, 'b', 4);
      pressEnter(editor, { shiftKey: true });
      LegacyUnit.equal(editor.getContent(), '<p><b>abcd<br /></b></p>');
    });

    suite.test('Enter in beginning of PRE', function (editor) {
      editor.getBody().innerHTML = '<pre>abc</pre>';
      LegacyUnit.setSelection(editor, 'pre', 0);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<pre><br />abc</pre>');
    });

    suite.test('Enter in the middle of PRE', function (editor) {
      editor.getBody().innerHTML = '<pre>abcd</pre>';
      LegacyUnit.setSelection(editor, 'pre', 2);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<pre>ab<br />cd</pre>');
    });

    suite.test('Enter at the end of PRE', function (editor) {
      editor.getBody().innerHTML = '<pre>abcd</pre>';
      LegacyUnit.setSelection(editor, 'pre', 4);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), (Env.ie && Env.ie < 11) ? '<pre>abcd</pre>' : '<pre>abcd<br /><br /></pre>');
    });

    suite.test('Enter in beginning of PRE and br_in_pre: false', function (editor) {
      editor.settings.br_in_pre = false;
      editor.getBody().innerHTML = '<pre>abc</pre>';
      LegacyUnit.setSelection(editor, 'pre', 0);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<pre>\u00a0</pre><pre>abc</pre>');
      delete editor.settings.br_in_pre;
    });

    suite.test('Enter in the middle of PRE and br_in_pre: false', function (editor) {
      editor.settings.br_in_pre = false;
      editor.getBody().innerHTML = '<pre>abcd</pre>';
      LegacyUnit.setSelection(editor, 'pre', 2);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<pre>ab</pre><pre>cd</pre>');
      delete editor.settings.br_in_pre;
    });

    suite.test('Enter at the end of PRE and br_in_pre: false', function (editor) {
      editor.settings.br_in_pre = false;
      editor.getBody().innerHTML = '<pre>abcd</pre>';
      LegacyUnit.setSelection(editor, 'pre', 4);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<pre>abcd</pre><p>\u00a0</p>');
      delete editor.settings.br_in_pre;
    });

    suite.test('Shift+Enter in beginning of PRE', function (editor) {
      editor.getBody().innerHTML = '<pre>abc</pre>';
      LegacyUnit.setSelection(editor, 'pre', 0);
      pressEnter(editor, { shiftKey: true });
      LegacyUnit.equal(editor.getContent(), '<pre>\u00a0</pre><pre>abc</pre>');
    });

    suite.test('Shift+Enter in the middle of PRE', function (editor) {
      editor.getBody().innerHTML = '<pre>abcd</pre>';
      LegacyUnit.setSelection(editor, 'pre', 2);
      pressEnter(editor, { shiftKey: true });
      LegacyUnit.equal(editor.getContent(), '<pre>ab</pre><pre>cd</pre>');
    });

    suite.test('Shift+Enter at the end of PRE', function (editor) {
      editor.getBody().innerHTML = '<pre>abcd</pre>';
      LegacyUnit.setSelection(editor, 'pre', 4);
      pressEnter(editor, { shiftKey: true });
      LegacyUnit.equal(editor.getContent(), '<pre>abcd</pre><p>\u00a0</p>');
    });

    suite.test('Shift+Enter in beginning of P with forced_root_block set to false', function (editor) {
      editor.settings.forced_root_block = false;
      editor.getBody().innerHTML = '<p>abc</p>';
      LegacyUnit.setSelection(editor, 'p', 0);
      pressEnter(editor, { shiftKey: true });
      LegacyUnit.equal(editor.getContent(), '<p>\u00a0</p><p>abc</p>');
      editor.settings.forced_root_block = 'p';
    });

    suite.test('Shift+Enter in middle of P with forced_root_block set to false', function (editor) {
      editor.settings.forced_root_block = false;
      editor.getBody().innerHTML = '<p>abcd</p>';
      LegacyUnit.setSelection(editor, 'p', 2);
      pressEnter(editor, { shiftKey: true });
      LegacyUnit.equal(editor.getContent(), '<p>ab</p><p>cd</p>');
      editor.settings.forced_root_block = 'p';
    });

    suite.test('Shift+Enter at the end of P with forced_root_block set to false', function (editor) {
      editor.settings.forced_root_block = false;
      editor.getBody().innerHTML = '<p>abc</p>';
      LegacyUnit.setSelection(editor, 'p', 3);
      pressEnter(editor, { shiftKey: true });
      LegacyUnit.equal(editor.getContent(), '<p>abc</p><p>\u00a0</p>');
      editor.settings.forced_root_block = 'p';
    });

    suite.test('Shift+Enter in body with forced_root_block set to false', function (editor) {
      editor.settings.forced_root_block = false;
      editor.getBody().innerHTML = 'abcd';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody().firstChild, 2);
      rng.setEnd(editor.getBody().firstChild, 2);
      editor.selection.setRng(rng);
      pressEnter(editor, { shiftKey: true });
      LegacyUnit.equal(editor.getContent(), '<p>ab</p><p>cd</p>');
      editor.settings.forced_root_block = 'p';
    });

    suite.test('Enter at the end of DIV layer', function (editor) {
      editor.settings.br_in_pre = false;
      editor.setContent('<div style="position: absolute; top: 1px; left: 2px;">abcd</div>');
      LegacyUnit.setSelection(editor, 'div', 4);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<div style="position: absolute; top: 1px; left: 2px;"><p>abcd</p><p>\u00a0</p></div>');
      delete editor.settings.br_in_pre;
    });

    suite.test('Enter at end of text in a span inside a P and keep_styles: false', function (editor) {
      editor.settings.keep_styles = false;
      editor.getBody().innerHTML = '<p><em><span style="font-size: 13px;">X</span></em></p>';
      LegacyUnit.setSelection(editor, 'span', 1);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p><em><span style="font-size: 13px;">X</span></em></p><p>\u00a0</p>');
      delete editor.settings.keep_styles;
    });

    suite.test(
      "keep_styles=false: P should not pass its styles and classes to the new P that is cloned from it when enter is pressed", function (editor) {
        editor.settings.keep_styles = false;
        editor.getBody().innerHTML = '<p class="red" style="color: #ff0000;"><span style="font-size: 13px;">X</span></p>';
        LegacyUnit.setSelection(editor, 'span', 1);
        pressEnter(editor);
        LegacyUnit.equal(editor.getContent(), '<p class="red" style="color: #ff0000;"><span style="font-size: 13px;">X</span></p><p>\u00a0</p>');
        delete editor.settings.keep_styles;
      });

    suite.test('Enter when forced_root_block: false and force_p_newlines: true', function (editor) {
      editor.settings.forced_root_block = false;
      editor.settings.force_p_newlines = true;
      editor.getBody().innerHTML = 'text';
      LegacyUnit.setSelection(editor, 'body', 2);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>te</p><p>xt</p>');
      editor.settings.forced_root_block = 'p';
      delete editor.settings.force_p_newlines;
    });

    suite.test('Enter at end of br line', function (editor) {
      editor.settings.forced_root_block = false;
      editor.settings.force_p_newlines = true;
      editor.getBody().innerHTML = '<p>a<br>b</p>';
      LegacyUnit.setSelection(editor, 'p', 1);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>a</p><p><br />b</p>');

      var rng = editor.selection.getRng(true);
      LegacyUnit.equal(rng.startContainer.nodeName, 'P');
      LegacyUnit.equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'BR');
      editor.settings.forced_root_block = 'p';
      delete editor.settings.force_p_newlines;
    });

    // Ignore on IE 7, 8 this is a known bug not worth fixing
    if (!Env.ie || Env.ie > 8) {
      suite.test('Enter before BR between DIVs', function (editor) {
        editor.getBody().innerHTML = '<div>a<span>b</span>c</div><br /><div>d</div>';
        var rng = editor.dom.createRng();
        rng.setStartBefore(editor.dom.select('br')[0]);
        rng.setEndBefore(editor.dom.select('br')[0]);
        editor.selection.setRng(rng);
        pressEnter(editor);
        LegacyUnit.equal(editor.getContent(), '<div>a<span>b</span>c</div><p>\u00a0</p><p>\u00a0</p><div>d</div>');
      });
    }

    // Only test these on modern browsers
    suite.test('Enter behind table element', function (editor) {
      var rng = editor.dom.createRng();

      editor.getBody().innerHTML = '<table><tbody><td>x</td></tbody></table>';
      rng.setStartAfter(editor.getBody().lastChild);
      rng.setEndAfter(editor.getBody().lastChild);
      editor.selection.setRng(rng);

      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<table><tbody><tr><td>x</td></tr></tbody></table><p>\u00a0</p>');
    });

    suite.test('Enter before table element', function (editor) {
      var rng = editor.dom.createRng();

      editor.getBody().innerHTML = '<table><tbody><td>x</td></tbody></table>';
      rng.setStartBefore(editor.getBody().lastChild);
      rng.setEndBefore(editor.getBody().lastChild);
      editor.selection.setRng(rng);

      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>\u00a0</p><table><tbody><tr><td>x</td></tr></tbody></table>');
    });

    suite.test('Enter behind table followed by a p', function (editor) {
      var rng = editor.dom.createRng();

      editor.getBody().innerHTML = '<table><tbody><td>x</td></tbody></table><p>x</p>';
      rng.setStartAfter(editor.getBody().firstChild);
      rng.setEndAfter(editor.getBody().firstChild);
      editor.selection.setRng(rng);

      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<table><tbody><tr><td>x</td></tr></tbody></table><p>\u00a0</p><p>x</p>');
    });

    suite.test('Enter before table element preceded by a p', function (editor) {
      var rng = editor.dom.createRng();

      editor.getBody().innerHTML = '<p>x</p><table><tbody><td>x</td></tbody></table>';
      rng.setStartBefore(editor.getBody().lastChild);
      rng.setStartBefore(editor.getBody().lastChild);
      editor.selection.setRng(rng);

      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>x</p><p>\u00a0</p><table><tbody><tr><td>x</td></tr></tbody></table>');
    });

    suite.test('Enter twice before table element', function (editor) {
      var rng = editor.dom.createRng();

      editor.getBody().innerHTML = '<table><tbody><tr><td>x</td></tr></tbody></table>';
      rng.setStartBefore(editor.getBody().lastChild);
      rng.setEndBefore(editor.getBody().lastChild);
      editor.selection.setRng(rng);

      pressEnter(editor);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p>\u00a0</p><p>\u00a0</p><table><tbody><tr><td>x</td></tr></tbody></table>');
    });

    suite.test('Enter after span with space', function (editor) {
      editor.setContent('<p><b>abc </b></p>');
      LegacyUnit.setSelection(editor, 'b', 3);
      pressEnter(editor);
      LegacyUnit.equal(editor.getContent(), '<p><b>abc</b></p><p>\u00a0</p>');

      var rng = editor.selection.getRng(true);
      LegacyUnit.equal(rng.startContainer.nodeName, 'B');
      LegacyUnit.equal(rng.startContainer.data !== ' ', true);
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      disable_nodechange: true,
      schema: 'html5',
      extended_valid_elements: 'div[id|style|contenteditable],span[id|style|contenteditable],#dt,#dd',
      entities: 'raw',
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);