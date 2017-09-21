asynctest(
  'browser.tinymce.core.FormatterApplyTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Pipeline',
    'ephox.katamari.api.Obj',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.test.HtmlUtils',
    'tinymce.core.test.KeyUtils',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Pipeline, Obj, LegacyUnit, TinyLoader, HtmlUtils, KeyUtils, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    Theme();

    var getContent = function (editor) {
      return editor.getContent().toLowerCase().replace(/[\r]+/g, '');
    };

    suite.test('apply inline to a list', function (editor) {
      editor.formatter.register('format', {
        inline: 'b',
        toggle: false
      });
      editor.getBody().innerHTML = '<p>1234</p><ul><li>first element</li><li>second element</li></ul><p>5678</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[1].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<p><b>1234</b></p><ul><li><b>first element</b></li><li><b>second element</b></li></ul><p><b>5678</b></p>',
        'selection of a list'
      );
    });

    suite.test('Toggle OFF - Inline element on selected text', function (editor) {
      // Toggle OFF - Inline element on selected text
      editor.formatter.register('format', {
        inline: 'b',
        toggle: false
      });
      editor.getBody().innerHTML = '<p><b>1234</b></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('b')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('b')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.toggle('format');
      LegacyUnit.equal(getContent(editor), '<p><b>1234</b></p>');
    });

    suite.test('Toggle OFF - Inline element on partially selected text', function (editor) {
      // Toggle OFF - Inline element on partially selected text
      editor.formatter.register('format', {
        inline: 'b',
        toggle: 0
      });
      editor.getBody().innerHTML = '<p>1<b>23</b>4</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('b')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('b')[0].firstChild, 2);
      editor.selection.setRng(rng);
      editor.formatter.toggle('format');
      LegacyUnit.equal(getContent(editor), '<p>1<b>23</b>4</p>');
    });

    suite.test('Toggle OFF - Inline element on partially selected text in start/end elements', function (editor) {
      // Toggle OFF - Inline element on partially selected text in start/end elements
      editor.formatter.register('format', {
        inline: 'b',
        toggle: false
      });
      editor.getBody().innerHTML = '<p>1<b>234</b></p><p><b>123</b>4</p>'; //'<p>1234</p><p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('b')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('b')[1].firstChild, 3);
      editor.selection.setRng(rng);
      editor.formatter.toggle('format');
      LegacyUnit.equal(getContent(editor), '<p>1<b>234</b></p><p><b>123</b>4</p>');
    });

    suite.test('Toggle OFF - Inline element with data attribute', function (editor) {
      editor.formatter.register('format', { inline: 'b' });
      editor.getBody().innerHTML = '<p><b data-x="1">1</b></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('b')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('b')[0].firstChild, 1);
      editor.selection.setRng(rng);
      editor.formatter.toggle('format');
      LegacyUnit.equal(getContent(editor), '<p>1</p>');
    });

    suite.test('Toggle ON - NO inline element on selected text', function (editor) {
      // Inline element on selected text
      editor.formatter.register('format', {
        inline: 'b',
        toggle: true
      });
      editor.getBody().innerHTML = '<p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b>1234</b></p>', 'Inline element on selected text');
      editor.formatter.toggle('format');
      LegacyUnit.equal(getContent(editor), '<p>1234</p>', 'Toggle ON - NO inline element on selected text');
    });

    suite.test('Selection spanning from within format to outside format with toggle off', function (editor) {
      editor.formatter.register('format', {
        inline: 'b',
        toggle: false
      });
      editor.getBody().innerHTML = '<p><b>12</b>34</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('b')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[0].lastChild, 2);
      editor.selection.setRng(rng);
      editor.formatter.toggle('format');
      LegacyUnit.equal(getContent(editor), '<p><b>1234</b></p>', 'Extend formating if start of selection is already formatted');
    });

    suite.test('Inline element on partially selected text', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 1);
      rng.setEnd(editor.dom.select('p')[0].firstChild, 3);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p>1<b>23</b>4</p>', 'Inline element on partially selected text');
      editor.formatter.toggle('format');
      LegacyUnit.equal(getContent(editor), '<p>1234</p>', 'Toggle ON - NO inline element on partially selected text');
    });

    suite.test('Inline element on partially selected text in start/end elements', function (editor) {
      // Inline element on partially selected text in start/end elements
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p>1234</p><p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 1);
      rng.setEnd(editor.dom.select('p')[1].firstChild, 3);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p>1<b>234</b></p><p><b>123</b>4</p>');
    });

    suite.test('Inline element on selected element', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b>1234</b></p>', 'Inline element on selected element');
    });

    suite.test('Inline element on multiple selected elements', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p>1234</p><p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 2);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b>1234</b></p><p><b>1234</b></p>', 'Inline element on multiple selected elements');
    });

    suite.test('Inline element on multiple selected elements with various childnodes', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p><em>1234</em>5678<span>9</span></p><p><em>1234</em>5678<span>9</span></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 2);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<p><b><em>1234</em>5678<span>9</span></b></p><p><b><em>1234</em>5678<span>9</span></b></p>',
        'Inline element on multiple selected elements with various childnodes'
      );
    });

    suite.test('Inline element with attributes', function (editor) {
      editor.formatter.register('format', {
        inline: 'b',
        attributes: {
          title: 'value1',
          id: 'value2'
        }
      });
      editor.getBody().innerHTML = '<p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b id="value2" title="value1">1234</b></p>', 'Inline element with attributes');
    });

    suite.test('Inline element with styles', function (editor) {
      editor.formatter.register('format', {
        inline: 'b',
        styles: {
          color: '#ff0000',
          fontSize: '10px'
        }
      });
      editor.getBody().innerHTML = '<p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b style=\"color: #ff0000; font-size: 10px;\">1234</b></p>', 'Inline element with styles');
    });

    suite.test('Inline element with attributes and styles', function (editor) {
      editor.formatter.register('format', {
        inline: 'b',
        attributes: {
          title: 'value1',
          id: 'value2'
        },
        styles: {
          color: '#ff0000',
          fontSize: '10px'
        }
      });
      editor.getBody().innerHTML = '<p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<p><b id="value2" style="color: #ff0000; font-size: 10px;" title="value1">1234</b></p>',
        'Inline element with attributes and styles'
      );
    });

    suite.test('Inline element with wrapable parents', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p>x<em><span>1234</span></em>y</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('span')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p>x<b><em><span>1234</span></em></b>y</p>', 'Inline element with wrapable parents');
    });

    suite.test('Inline element with redundant child', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p><b>1234</b></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0], 0);
      rng.setEnd(editor.dom.select('p')[0], 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b>1234</b></p>', 'Inline element with redundant child');
    });

    suite.test('Inline element with redundant parent', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p><b>a<em>1234</em>b</b></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('em')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('em')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b>a<em>1234</em>b</b></p>', 'Inline element with redundant parent');
    });

    suite.test('Inline element with redundant child of similar type 1', function (editor) {
      editor.formatter.register('format', [{
        inline: 'b'
      }, {
        inline: 'strong'
      }]);
      editor.getBody().innerHTML = '<p>a<strong>1234</strong>b</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0], 0);
      rng.setEnd(editor.dom.select('p')[0], 3);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b>a1234b</b></p>', 'Inline element with redundant child of similar type 1');
    });

    suite.test('Inline element with redundant child of similar type 2', function (editor) {
      editor.formatter.register('format', [{
        inline: 'b'
      }, {
        inline: 'span',
        styles: {
          fontWeight: 'bold'
        }
      }]);
      editor.getBody().innerHTML = '<p><span style="font-weight:bold">1234</span></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0], 0);
      rng.setEnd(editor.dom.select('p')[0], 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b>1234</b></p>', 'Inline element with redundant child of similar type 2');
    });

    suite.test('Inline element with redundant children of similar types', function (editor) {
      editor.formatter.register('format', [{
        inline: 'b'
      }, {
        inline: 'strong'
      }, {
        inline: 'span',
        styles: {
          fontWeight: 'bold'
        }
      }]);
      editor.getBody().innerHTML = '<p><span style="font-weight:bold">a<strong>1234</strong><b>5678</b>b</span></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0], 0);
      rng.setEnd(editor.dom.select('p')[0], 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b>a12345678b</b></p>', 'Inline element with redundant children of similar types');
    });

    suite.test('Inline element with redundant parent 1', function (editor) {
      editor.formatter.register('format', [{
        inline: 'b'
      }, {
        inline: 'strong'
      }]);
      editor.getBody().innerHTML = '<p><strong>a<em>1234</em>b</strong></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('em')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('em')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><strong>a<em>1234</em>b</strong></p>', 'Inline element with redundant parent 1');
    });

    suite.test('Inline element with redundant parent 2', function (editor) {
      editor.formatter.register('format', [{
        inline: 'b'
      }, {
        inline: 'span',
        styles: {
          fontWeight: 'bold'
        }
      }]);
      editor.getBody().innerHTML = '<p><span style="font-weight:bold">a<em>1234</em>b</span></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('em')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('em')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><span style="font-weight: bold;">a<em>1234</em>b</span></p>', 'Inline element with redundant parent 2');
    });

    suite.test('Inline element with redundant parents of similar types', function (editor) {
      editor.formatter.register('format', [{
        inline: 'b'
      }, {
        inline: 'strong'
      }, {
        inline: 'span',
        styles: {
          fontWeight: 'bold'
        }
      }]);
      editor.getBody().innerHTML = '<p><span style="font-weight:bold"><strong><b>a<em>1234</em>b</b></strong></span></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('em')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('em')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<p><span style="font-weight: bold;"><strong><b>a<em>1234</em>b</b></strong></span></p>',
        'Inline element with redundant parents of similar types'
      );
    });

    suite.test('Inline element merged with parent and child', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p>a<b>12<b>34</b>56</b>b</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('b')[0].firstChild, 1);
      rng.setEnd(editor.dom.select('b')[0].lastChild, 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p>a<b>123456</b>b</p>', 'Inline element merged with parent and child');
    });

    suite.test('Inline element merged with child 1', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        styles: {
          fontWeight: 'bold'
        }
      });
      editor.getBody().innerHTML = '<p>a<span style="font-weight:bold">1234</span>b</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><span style="font-weight: bold;">a1234b</span></p>', 'Inline element merged with child 1');
    });

    suite.test('Inline element merged with child 2', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        styles: {
          fontWeight: 'bold'
        }
      });
      editor.getBody().innerHTML = '<p>a<span style="font-weight:bold; color:#ff0000">1234</span>b</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<p><span style=\"font-weight: bold;\">a<span style=\"color: #ff0000;\">1234</span>b</span></p>',
        'Inline element merged with child 2'
      );
    });

    suite.test('Inline element merged with child 3', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        styles: {
          fontWeight: 'bold'
        }
      });
      editor.getBody().innerHTML = '<p>a<span id="id" style="font-weight:bold">1234</span>b</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<p><span style=\"font-weight: bold;\">a<span id=\"id\">1234</span>b</span></p>',
        'Inline element merged with child 3'
      );
    });

    suite.test('Inline element merged with child 3', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        styles: {
          fontWeight: 'bold'
        },
        merge: true
      });
      editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><span style="color: #ff0000; font-weight: bold;">1234</span></p>', 'Inline element merged with child 3');
    });

    suite.test('Inline element merged with child 4', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        styles: {
          color: '#00ff00'
        }
      });
      editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><span style="color: #00ff00;">1234</span></p>', 'Inline element merged with child 4');
    });

    suite.test('Inline element with attributes merged with child 1', function (editor) {
      editor.formatter.register('format', {
        inline: 'font',
        attributes: {
          face: 'arial'
        },
        merge: true
      });
      editor.getBody().innerHTML = '<p><font size="7">1234</font></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><font face="arial" size="7">1234</font></p>', 'Inline element with attributes merged with child 1');
    });

    suite.test('Inline element with attributes merged with child 2', function (editor) {
      editor.formatter.register('format', {
        inline: 'font',
        attributes: {
          size: '7'
        }
      });
      editor.getBody().innerHTML = '<p>a<font size="7">1234</font>b</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><font size="7">a1234b</font></p>', 'Inline element with attributes merged with child 2');
    });

    suite.test('Inline element merged with left sibling', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p><b>1234</b>5678</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].lastChild, 0);
      rng.setEnd(editor.dom.select('p')[0].lastChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b>12345678</b></p>', 'Inline element merged with left sibling');
    });

    suite.test('Inline element merged with right sibling', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p>1234<b>5678</b></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b>12345678</b></p>', 'Inline element merged with right sibling');
    });

    suite.test('Inline element merged with left and right siblings', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p><b>12</b>34<b>56</b></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].childNodes[1], 0);
      rng.setEnd(editor.dom.select('p')[0].childNodes[1], 2);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b>123456</b></p>', 'Inline element merged with left and right siblings');
    });

    suite.test('Inline element merged with data attributed left sibling', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p><b data-x="1">1234</b>5678</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].lastChild, 0);
      rng.setEnd(editor.dom.select('p')[0].lastChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b data-x="1">12345678</b></p>', 'Inline element merged with left sibling');
    });

    suite.test('Don\'t merge siblings with whitespace between 1', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p><b>a</b> b</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].lastChild, 1);
      rng.setEnd(editor.dom.select('p')[0].lastChild, 2);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b>a</b> <b>b</b></p>', 'Don\'t merge siblings with whitespace between 1');
    });

    suite.test('Don\'t merge siblings with whitespace between 1', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p>a <b>b</b></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[0].firstChild, 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b>a</b> <b>b</b></p>', 'Don\'t merge siblings with whitespace between 2');
    });

    suite.test('Inline element not merged in exact mode', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        styles: {
          color: '#00ff00'
        },
        exact: true
      });
      editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<p><span style="color: #00ff00;"><span style="color: #ff0000;">1234</span></span></p>',
        'Inline element not merged in exact mode'
      );
    });

    suite.test('Inline element merged in exact mode', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        styles: {
          color: '#ff0000'
        },
        exact: true
      });
      editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><span style="color: #ff0000;">1234</span></p>', 'Inline element merged in exact mode');
    });

    suite.test('Deep left branch', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p><em><i><ins>1234</ins></i></em><em>text1</em><em>text2</em></p><p><em>5678</em></p><p>9012</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('ins')[0].firstChild, 1);
      rng.setEnd(editor.dom.select('p')[2].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<p><em><i><ins>1<b>234</b></ins></i></em><b><em>text1</em><em>text2</em></b></p><p><b><em>5678</em></b></p><p><b>9012</b></p>',
        'Deep left branch'
      );
    });

    suite.test('Deep right branch', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p>9012</p><p><em>5678</em></p><p><em><i><ins>1234</ins></i></em><em>text1</em><em>text2</em></p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('em')[3].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<p><b>9012</b></p><p><b><em>5678</em></b></p><p><b><em><i><ins>1234</ins></i></em><em>text1</em></b><em><b>text</b>2</em></p>',
        'Deep right branch'
      );
    });

    suite.test('Full element text selection on two elements with a table in the middle', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.getBody().innerHTML = '<p>1234</p><table><tbody><tr><td>123</td></tr></tbody></table><p>5678</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[1].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<p><b>1234</b></p><table><tbody><tr><td><b>123</b></td></tr></tbody></table><p><b>5678</b></p>',
        'Full element text selection on two elements with a table in the middle'
      );
    });

    suite.test('Inline element on selected text with variables', function (editor) {
      editor.formatter.register('format', {
        inline: 'b',
        styles: {
          color: '%color'
        },
        attributes: {
          title: '%title'
        }
      }, {
        color: '#ff0000',
        title: 'title'
      });
      editor.getBody().innerHTML = '<p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format', {
        color: '#ff0000',
        title: 'title'
      });
      LegacyUnit.equal(getContent(editor), '<p><b style="color: #ff0000;" title="title">1234</b></p>', 'Inline element on selected text');
    });

    suite.test('Remove redundant children', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        styles: {
          fontFamily: 'arial'
        }
      });
      editor.getBody().innerHTML = (
        '<p><span style="font-family: sans-serif;"><span style="font-family: palatino;">1</span>2<span style="font-family: verdana;">3</span>4</span></p>'
      );
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0], 0);
      rng.setEnd(editor.dom.select('p')[0], 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><span style=\"font-family: arial;\">1234</span></p>', 'Remove redundant children');
    });

    suite.test('Inline element on selected text with function values', function (editor) {
      editor.formatter.register('format', {
        inline: 'b',
        styles: {
          color: function (vars) {
            return vars.color + '00ff';
          }
        },
        attributes: {
          title: function (vars) {
            return vars.title + '2';
          }
        }
      });
      editor.getBody().innerHTML = '<p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format', {
        color: '#ff',
        title: 'title'
      });
      LegacyUnit.equal(getContent(editor), '<p><b style="color: #ff00ff;" title="title2">1234</b></p>', 'Inline element on selected text with function values');
    });

    suite.test('Block element on selected text', function (editor) {
      editor.formatter.register('format', {
        block: 'div'
      });
      editor.getBody().innerHTML = '<p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<div>1234</div>', 'Block element on selected text');
    });

    suite.test('Block element on partially selected text', function (editor) {
      editor.formatter.register('format', {
        block: 'div'
      });
      editor.getBody().innerHTML = '<p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 1);
      rng.setEnd(editor.dom.select('p')[0].firstChild, 3);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<div>1234</div>', 'Block element on partially selected text');
    });

    suite.test('Block element on selected element', function (editor) {
      editor.formatter.register('format', {
        block: 'div'
      });
      editor.getBody().innerHTML = '<p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<div>1234</div>', 'Block element on selected element');
    });

    suite.test('Block element on selected elements', function (editor) {
      editor.formatter.register('format', {
        block: 'div'
      });
      editor.getBody().innerHTML = '<p>1234</p><p>5678</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 2);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<div>1234</div><div>5678</div>', 'Block element on selected elements');
    });

    suite.test('Block element on selected elements with attributes', function (editor) {
      editor.formatter.register('format', {
        block: 'div',
        attributes: {
          'title': 'test'
        }
      });
      editor.getBody().innerHTML = '<p>1234</p><p>5678</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 2);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<div title="test">1234</div><div title="test">5678</div>', 'Block element on selected elements with attributes');
    });

    suite.test('Block element on nested element', function (editor) {
      editor.formatter.register('format', {
        block: 'p'
      });
      editor.getBody().innerHTML = '<div><h1>1234</h1></div>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('h1')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('h1')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<div><p>1234</p></div>', 'Block element on nested element');
    });

    suite.test('Block element on selected non wrapped text 1', function (editor) {
      editor.formatter.register('format', {
        block: 'div'
      });
      editor.getBody().innerHTML = '1234';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody().firstChild, 0);
      rng.setEnd(editor.getBody().firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<div>1234</div>', 'Block element on selected non wrapped text 1');
    });

    suite.test('Block element on selected non wrapped text 2', function (editor) {
      editor.formatter.register('format', {
        block: 'div'
      });
      editor.getBody().innerHTML = '1234<br />4567<br />8910';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody().firstChild, 0);
      rng.setEnd(editor.getBody().lastChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<div>1234</div><div>4567</div><div>8910</div>', 'Block element on selected non wrapped text 2');
    });

    suite.test('Block element on selected non wrapped text 3', function (editor) {
      editor.formatter.register('format', {
        block: 'div'
      });
      editor.getBody().innerHTML = '<br />1234<br /><br />4567<br />8910<br />';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 7);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<div>1234</div><div>4567</div><div>8910</div>', 'Block element on selected non wrapped text 3');
    });

    suite.test('Block element wrapper 1', function (editor) {
      editor.formatter.register('format', {
        block: 'blockquote',
        wrapper: 1
      });
      editor.getBody().innerHTML = '<h1>1234</h1><p>5678</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('h1')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<blockquote><h1>1234</h1><p>5678</p></blockquote>', 'Block element wrapper 1');
    });

    suite.test('Block element wrapper 2', function (editor) {
      editor.formatter.register('format', {
        block: 'blockquote',
        wrapper: 1
      });
      editor.getBody().innerHTML = '<h1>1234</h1>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('h1')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('h1')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<blockquote><h1>1234</h1></blockquote>', 'Block element wrapper 2');
    });

    suite.test('Block element wrapper 3', function (editor) {
      editor.formatter.register('format', {
        block: 'blockquote',
        wrapper: 1
      });
      editor.getBody().innerHTML = '<br /><h1>1234</h1><br />';
      var rng = editor.dom.createRng();
      rng.setStart(editor.getBody(), 0);
      rng.setEnd(editor.getBody(), 3);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<blockquote><h1>1234</h1></blockquote>', 'Block element wrapper 3');
    });

    suite.test('Apply format on single element that matches a selector 1', function (editor) {
      editor.formatter.register('format', {
        selector: 'p',
        attributes: {
          title: 'test'
        },
        styles: {
          'color': '#ff0000'
        },
        classes: 'a b c'
      });
      editor.getBody().innerHTML = '<p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<p class="a b c" style="color: #ff0000;" title="test">1234</p>',
        'Apply format on single element that matches a selector'
      );
    });

    suite.test('Apply format on single element parent that matches a selector 2', function (editor) {
      editor.formatter.register('format', {
        selector: 'div',
        attributes: {
          title: 'test'
        },
        styles: {
          'color': '#ff0000'
        },
        classes: 'a b c'
      });
      editor.getBody().innerHTML = '<div><p>1234</p><p>test</p><p>1234</p></div>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('div')[0], 1);
      rng.setEnd(editor.dom.select('div')[0], 2);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<div class="a b c" style="color: #ff0000;" title="test"><p>1234</p><p>test</p><p>1234</p></div>',
        'Apply format on single element parent that matches a selector'
      );
    });

    suite.test('Apply format on multiple elements that matches a selector 2', function (editor) {
      editor.formatter.register('format', {
        selector: 'p',
        attributes: {
          title: 'test'
        },
        styles: {
          'color': '#ff0000'
        },
        classes: 'a b c'
      });
      editor.getBody().innerHTML = '<p>1234</p><div>test</div><p>1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[1].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<p class="a b c" style="color: #ff0000;" title="test">1234</p><div>test</div><p class="a b c" style="color: #ff0000;" title="test">1234</p>',
        'Apply format on multiple elements that matches a selector'
      );
    });

    suite.test('Apply format on top of existing selector element', function (editor) {
      editor.formatter.register('format', {
        selector: 'p',
        attributes: {
          title: 'test2'
        },
        styles: {
          'color': '#00ff00'
        },
        classes: 'a b c'
      });
      editor.getBody().innerHTML = '<p class=\"c d\" title=\"test\">1234</p>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<p class="c d a b" style="color: #00ff00;" title="test2">1234</p>',
        'Apply format on top of existing selector element'
      );
    });

    suite.test('Format on single li that matches a selector', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        selector: 'li',
        attributes: {
          title: 'test'
        },
        styles: {
          'color': '#ff0000'
        },
        classes: 'a b c'
      });
      editor.getBody().innerHTML = '<div>text</div>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('div')[0], 0);
      rng.setEnd(editor.dom.select('div')[0], 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<div><span class="a b c" style="color: #ff0000;" title="test">text</span></div>',
        'Apply format on single element that matches a selector'
      );
    });

    suite.test('Format on single div that matches a selector', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        selector: 'div',
        attributes: {
          title: 'test'
        },
        styles: {
          'color': '#ff0000'
        },
        classes: 'a b c'
      });
      editor.getBody().innerHTML = '<div>text</div>';
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('div')[0], 0);
      rng.setEnd(editor.dom.select('div')[0], 1);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<div class="a b c" style="color: #ff0000;" title="test">text</div>',
        'Apply format on single element that matches a selector'
      );
    });

    suite.test('Bold and italics is applied to text that is not highlighted', function (editor) {
      var rng = editor.dom.createRng();
      editor.setContent('<p><span style="font-family: Arial;"><strong>test1 test2</strong> test3 test4 test5 test6</span></p>');
      rng.setStart(editor.dom.select('strong')[0].firstChild, 6);
      rng.setEnd(editor.dom.select('strong')[0].firstChild, 11);
      editor.focus();
      editor.selection.setRng(rng);
      editor.execCommand('Italic');
      LegacyUnit.equal(
        editor.getContent(editor),
        '<p><span style="font-family: Arial;"><strong>test1 <em>test2</em></strong> test3 test4 test5 test6</span></p>',
        'Selected text should be bold.'
      );
    });

    suite.test('Apply color format to links as well', function (editor) {
      editor.setContent('<p>123<a href="#">abc</a>456</p>');
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[0].lastChild, 3);
      editor.selection.setRng(rng);

      editor.formatter.register('format', {
        inline: 'span',
        styles: {
          color: '#FF0000'
        },
        links: true
      });
      editor.formatter.apply('format');

      LegacyUnit.equal(
        editor.getContent(editor),
        '<p><span style="color: #ff0000;">123<a style="color: #ff0000;" href="#">abc</a>456</span></p>',
        'Link should have it\'s own color.'
      );
    });

    suite.test('Color on link element', function (editor) {
      editor.setContent('<p><span style="font-size: 10px;">123<a href="#">abc</a>456</span></p>');
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('span')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('span')[0].lastChild, 3);
      editor.selection.setRng(rng);

      editor.formatter.register('format', {
        inline: 'span',
        styles: {
          color: '#FF0000'
        },
        links: true
      });
      editor.formatter.apply('format');

      LegacyUnit.equal(
        editor.getContent(editor),
        '<p><span style="color: #ff0000; font-size: 10px;">123<a style="color: #ff0000;" href="#">abc</a>456</span></p>',
        'Link should have it\'s own color.'
      );
    });

    suite.test("Applying formats in lists", function (editor) {
      editor.setContent('<ul><li>text<ul><li>nested</li></ul></li></ul>');
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('li')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('li')[0].firstChild, 1);
      editor.selection.setRng(rng);
      editor.formatter.apply("h1");
      LegacyUnit.equal(
        editor.getContent(editor),
        '<ul><li><h1>text</h1><ul><li>nested</li></ul></li></ul>',
        "heading should not automatically apply to sublists"
      );
    });

    suite.test('Applying block format to first character in li', function (editor) {
      editor.setContent('<ul><li>ab</li><li>cd</li>');
      LegacyUnit.setSelection(editor, 'li:nth-child(1)', 0, 'li:nth-child(1)', 0);
      editor.formatter.apply("h1");
      LegacyUnit.equal(
        editor.getContent(editor),
        '<ul><li><h1>ab</h1></li><li>cd</li></ul>',
        'heading should be applied to first li'
      );
    });

    suite.test('Applying block format to li wrapped in block', function (editor) {
      editor.setContent('<div><ul><li>ab</li><li>cd</li></ul></div>');
      LegacyUnit.setSelection(editor, 'li:nth-child(1)', 1, 'li:nth-child(1)', 1);
      editor.formatter.apply("h1");
      LegacyUnit.equal(
        editor.getContent(editor),
        '<div><ul><li><h1>ab</h1></li><li>cd</li></ul></div>',
        'heading should be applied to first li only'
      );
    });

    suite.test("Applying formats on a list including child nodes", function (editor) {
      editor.formatter.register('format', { inline: 'strong' });
      editor.setContent('<ol><li>a</li><li>b<ul><li>c</li><li>d<br /><ol><li>e</li><li>f</li></ol></li></ul></li><li>g</li></ol>');
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('li')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('li')[6].firstChild, 1);
      editor.selection.setRng(rng);
      editor.formatter.apply("format");
      LegacyUnit.equal(
        editor.getContent(editor),
        '<ol><li><strong>a</strong></li><li><strong>b</strong><ul><li><strong>c</strong></li><li><strong>d</strong>' +
        '<br /><ol><li><strong>e</strong></li><li><strong>f</strong></li></ol></li></ul></li><li><strong>g</strong>' +
        '</li></ol>',
        "should be applied to all sublists"
      );
    });

    suite.test('Block format on li element', function (editor) {
      editor.setContent('<ul><li>text<ul><li>nested</li></ul></li></ul>');
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('li')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('li')[1].firstChild, 1);
      editor.selection.setRng(rng);
      editor.formatter.apply("h1");
      LegacyUnit.equal(
        editor.getContent(editor),
        '<ul><li><h1>text</h1><ul><li><h1>nested</h1></li></ul></li></ul>',
        "heading should automatically apply to sublists, when selection spans the sublist"
      );
    });

    suite.test('Block on li element 2', function (editor) {
      editor.setContent('<ul><li>before<ul><li>nested</li></ul>after</li></ul>');
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('li')[0].lastChild, 1);
      rng.setEnd(editor.dom.select('li')[0].lastChild, 2);
      editor.selection.setRng(rng);
      editor.formatter.apply("h1");
      LegacyUnit.equal(
        editor.getContent(editor),
        '<ul><li>before<ul><li>nested</li></ul><h1>after</h1></li></ul>',
        "heading should automatically apply to sublists, when selection spans the sublist"
      );
    });

    suite.test('Block on li element 3', function (editor) {
      editor.setContent('<ul><li>before<ul><li>nested</li></ul>after</li></ul>');
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('li')[1].firstChild, 0);
      rng.setEnd(editor.dom.select('li')[0].lastChild, 1);
      editor.selection.setRng(rng);
      editor.formatter.apply("h1");
      LegacyUnit.equal(
        editor.getContent(editor),
        '<ul><li>before<ul><li><h1>nested</h1></li></ul><h1>after</h1></li></ul>',
        "heading should automatically apply to sublists, when selection spans the sublist"
      );
    });

    suite.test('Block on li element 4', function (editor) {
      editor.setContent('<ul><li>before<ul><li>nested</li></ul>after</li></ul>');
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('li')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('li')[0].lastChild, 1);
      editor.selection.setRng(rng);
      editor.formatter.apply("h1");
      LegacyUnit.equal(
        editor.getContent(editor),
        '<ul><li><h1>before</h1><ul><li><h1>nested</h1></li></ul><h1>after</h1></li></ul>',
        "heading should apply correctly when selection is after a sublist"
      );
    });

    suite.test('Underline colors 1', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        styles: {
          'color': '#ff0000'
        }
      });
      editor.setContent('<p><span style="font-family: \'arial black\'; text-decoration: underline;">test</span></p>');
      editor.execCommand('SelectAll');
      editor.formatter.apply('format');
      LegacyUnit.equal(
        editor.getContent(editor),
        '<p><span style="color: #ff0000; font-family: \'arial black\'; text-decoration: underline;">test</span></p>',
        'Coloring an underlined text should result in a colored underline'
      );
    });

    suite.test('Underline colors 2', function (editor) {
      editor.formatter.register('format', {
        inline: "span",
        exact: true,
        styles: {
          'textDecoration': 'underline'
        }
      });
      editor.setContent('<p><span style="font-family: \'arial black\'; color: rgb(255, 0, 0);">test</span></p>');
      editor.execCommand('SelectAll');
      editor.formatter.apply('format');
      LegacyUnit.equal(
        editor.getContent(editor),
        '<p><span style="text-decoration: underline;"><span style="color: #ff0000; font-family: ' +
        '\'arial black\'; text-decoration: underline;">test</span></span></p>',
        'Underlining colored text should result in a colored underline'
      );
    });

    suite.test('Underline colors 3', function (editor) {
      editor.formatter.register('format', {
        inline: "span",
        exact: true,
        styles: {
          'textDecoration': 'underline'
        }
      });
      editor.setContent(
        '<p><span style="font-family: \'arial black\'; text-decoration: underline;"><em><strong>This is some ' +
        '<span style="color: rgb(255, 0, 0);">example</span></strong></em> text</span></p>'
      );
      editor.execCommand('SelectAll');
      editor.formatter.apply('format');
      LegacyUnit.equal(
        editor.getContent(editor),
        '<p><span style="text-decoration: underline;"><span style="font-family: \'arial black\';"><em>' +
        '<strong>This is some <span style="color: #ff0000; text-decoration: underline;">example</span></strong>' +
        '</em> text</span></span></p>', 'Underlining colored and underlined text should result in a colored underline'
      );
    });

    suite.test('Underline colors 4', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        styles: {
          'color': '#ff0000'
        }
      });
      editor.setContent(
        '<p style="font-size: 22pt;"><span style=\"text-decoration: underline;\"><span style=\"color: yellow; ' +
        'text-decoration: underline;\">yellowredyellow</span></span></p>'
      );
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('span')[1].firstChild, 6);
      rng.setEnd(editor.dom.select('span')[1].firstChild, 9);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p style="font-size: 22pt;"><span style="text-decoration: underline;"><span style="color: yellow;' +
        ' text-decoration: underline;">yellow<span style="color: #ff0000; text-decoration: underline;">red</span>yellow</span></span></p>',
        'Coloring an colored underdlined text should result in newly colored underline'
      );
    });

    suite.test('Underline colors 5', function (editor) {
      editor.formatter.register('format', {
        inline: "span",
        exact: true,
        styles: {
          'textDecoration': 'underline'
        }
      });
      editor.setContent(
        '<p><span style="font-family: \'arial black\',\'avant garde\';"><em><strong>This is some <span style="color: ' +
        'rgb(255, 0, 0);">example</span></strong></em> text</span></p><p><span style="font-family: \'arial black\',' +
        '\'avant garde\';"><em><strong>This is some <span style="color: rgb(255, 0, 0);">example</span></strong>' +
        '</em> text</span></p><p><span style="font-family: \'arial black\', \'avant garde\';"><em><strong>This is' +
        ' some <span style="color: rgb(255, 0, 0);">example</span></strong></em> text</span></p>'
      );
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('strong')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('span')[4].lastChild, 5);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        editor.getContent(editor),
        '<p><span style="text-decoration: underline;"><span style="font-family: \'arial black\',\'avant garde\';"' +
        '><em><strong>This is some <span style="color: #ff0000; text-decoration: underline;">example</span></strong' +
        '></em> text</span></span></p><p><span style="text-decoration: underline;"><span style="font-family: ' +
        '\'arial black\',\'avant garde\';"><em><strong>This is some <span style="color: #ff0000; text-decoration:' +
        ' underline;">example</span></strong></em> text</span></span></p><p><span style="text-decoration: underline;' +
        '"><span style="font-family: \'arial black\', \'avant garde\';"><em><strong>This is some <span style="color:' +
        ' #ff0000; text-decoration: underline;">example</span></strong></em> text</span></span></p>',
        'Colored elements should be underlined when selection is across multiple paragraphs'
      );
    });

    suite.test('Underline colors 6', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        exact: true,
        styles: {
          'color': '#ff0000'
        }
      });
      editor.setContent('<p><span style="text-decoration: underline;">This is some text.</span></p>');
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('span')[0].firstChild, 8);
      rng.setEnd(editor.dom.select('span')[0].firstChild, 12);
      editor.selection.setRng(rng);
      editor.formatter.apply('format');
      editor.formatter.remove('format');
      LegacyUnit.equal(
        editor.getContent(editor),
        '<p><span style="text-decoration: underline;">This is some text.</span></p>',
        'Children nodes that are underlined should be removed if their parent nodes are underlined'
      );
    });

    suite.test('Underline colors 7', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        exact: true,
        styles: {
          'color': '#ff0000'
        }
      });
      editor.setContent(
        '<p><span style="text-decoration: underline;">This is <span style="color: #ff0000; text-decoration: underline; ' +
        'background-color: #ff0000">some</span> text.</span></p>'
      );
      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('span')[1].firstChild, 0);
      rng.setEnd(editor.dom.select('span')[1].firstChild, 4);
      editor.selection.setRng(rng);
      editor.formatter.remove('format');
      LegacyUnit.equal(
        editor.getContent(editor),
        '<p><span style=\"text-decoration: underline;\">This is <span style=\"background-color: #ff0000;\">' +
        'some</span> text.</span></p>',
        'Children nodes that are underlined should be removed if their parent nodes are underlined'
      );
    });

    suite.test('Caret format inside single block word', function (editor) {
      editor.setContent('<p>abc</p>');
      editor.formatter.register('format', {
        inline: 'b'
      });
      LegacyUnit.setSelection(editor, 'p', 2, 'p', 2);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p><b>abc</b></p>');
    });

    suite.test('Caret format inside non-ascii single block word', function (editor) {
      editor.setContent('<p>noël</p>');
      editor.formatter.register('format', {
        inline: 'b'
      });
      LegacyUnit.setSelection(editor, 'p', 2, 'p', 2);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p><b>noël</b></p>');
    });

    suite.test('Caret format inside first block word', function (editor) {
      editor.setContent('<p>abc 123</p>');
      editor.formatter.register('format', {
        inline: 'b'
      });
      LegacyUnit.setSelection(editor, 'p', 2, 'p', 2);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p><b>abc</b> 123</p>');
    });

    suite.test('Caret format inside last block word', function (editor) {
      editor.setContent('<p>abc 123</p>');
      editor.formatter.register('format', {
        inline: 'b'
      });
      LegacyUnit.setSelection(editor, 'p', 5, 'p', 5);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p>abc <b>123</b></p>');
    });

    suite.test('Caret format inside middle block word', function (editor) {
      editor.setContent('<p>abc 123 456</p>');
      editor.formatter.register('format', {
        inline: 'b'
      });
      LegacyUnit.setSelection(editor, 'p', 5, 'p', 5);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p>abc <b>123</b> 456</p>');
    });

    suite.test('Caret format on word separated by non breaking space', function (editor) {
      editor.setContent('<p>one&nbsp;two</p>');
      editor.formatter.register('format', {
        inline: 'b'
      });
      LegacyUnit.setSelection(editor, 'p', 1, 'p', 1);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p><b>one</b>\u00a0two</p>');
    });

    suite.test('Caret format inside single inline wrapped word', function (editor) {
      editor.setContent('<p>abc <em>123</em> 456</p>');
      editor.formatter.register('format', {
        inline: 'b'
      });
      LegacyUnit.setSelection(editor, 'em', 1, 'em', 1);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p>abc <b><em>123</em></b> 456</p>');
    });

    suite.test('Caret format inside word before similar format', function (editor) {
      editor.setContent('<p>abc 123 <b>456</b></p>');
      editor.formatter.register('format', {
        inline: 'b'
      });
      LegacyUnit.setSelection(editor, 'p', 1, 'p', 1);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p><b>abc</b> 123 <b>456</b></p>');
    });

    suite.test('Caret format inside last inline wrapped word', function (editor) {
      editor.setContent('<p>abc <em>abc 123</em> 456</p>');
      editor.formatter.register('format', {
        inline: 'b'
      });
      LegacyUnit.setSelection(editor, 'em', 5, 'em', 5);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p>abc <em>abc <b>123</b></em> 456</p>');
    });

    suite.test('Caret format before text', function (editor) {
      editor.setContent('<p>a</p>');
      editor.formatter.register('format', {
        inline: 'b'
      });
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 0);
      editor.formatter.apply('format');
      KeyUtils.type(editor, 'b');
      LegacyUnit.equal(editor.getContent(editor), '<p><b>b</b>a</p>');
    });

    suite.test('Caret format after text', function (editor) {
      editor.setContent('<p>a</p>');
      editor.formatter.register('format', {
        inline: 'b'
      });
      LegacyUnit.setSelection(editor, 'p', 1, 'p', 1);
      editor.formatter.apply('format');
      KeyUtils.type(editor, 'b');
      LegacyUnit.equal(editor.getContent(editor), '<p>a<b>b</b></p>');
    });

    suite.test('Caret format and no key press', function (editor) {
      editor.setContent('<p>a</p>');
      editor.formatter.register('format', {
        inline: 'b'
      });
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 0);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p>a</p>');
    });

    suite.test('Caret format and arrow left', function (editor) {
      editor.setContent('<p>a</p>');
      editor.formatter.register('format', {
        inline: 'b'
      });
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 0);
      editor.formatter.apply('format');
      KeyUtils.type(editor, {
        keyCode: 37
      });
      LegacyUnit.equal(editor.getContent(editor), '<p>a</p>');
    });

    suite.test('Caret format and arrow right', function (editor) {
      editor.setContent('<p>a</p>');
      editor.formatter.register('format', {
        inline: 'b'
      });
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 0);
      editor.formatter.apply('format');
      KeyUtils.type(editor, {
        keyCode: 39
      });
      LegacyUnit.equal(editor.getContent(editor), '<p>a</p>');
    });

    suite.test('Caret format and backspace', function (editor) {
      var rng;

      editor.formatter.register('format', {
        inline: 'b'
      });

      editor.setContent('<p>abc</p>');
      rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 3);
      rng.setEnd(editor.dom.select('p')[0].firstChild, 3);
      editor.selection.setRng(rng);

      editor.formatter.apply('format');
      KeyUtils.type(editor, '\b');
      LegacyUnit.equal(editor.getContent(editor), '<p>ab</p>');
    });

    suite.test('Caret format on word in li with word in parent li before it', function (editor) {
      editor.setContent('<ul><li>one<ul><li>two</li></ul></li></ul>');
      editor.formatter.register('format', {
        inline: 'b'
      });
      LegacyUnit.setSelection(editor, 'ul li li', 1, 'ul li li', 1);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<ul><li>one<ul><li><b>two</b></li></ul></li></ul>');
    });

    suite.test('Format caret with multiple formats', function (editor) {
      editor.getBody().innerHTML = '<p><br></p>';
      editor.formatter.register('format1', { inline: 'b' });
      editor.formatter.register('format2', { inline: 'i' });
      editor.selection.setCursorLocation(editor.getBody().firstChild, 0);
      editor.formatter.apply('format1');
      editor.formatter.apply('format2');
      LegacyUnit.equal(1, editor.dom.select('b').length, 'Should be one b element');
      LegacyUnit.equal(1, editor.dom.select('i').length, 'Should be one i element');
    });

    suite.test('Selector format on whole contents', function (editor) {
      editor.setContent('<p>a</p>');
      editor.formatter.register('format', {
        inline: 'span',
        selector: '*',
        classes: 'test'
      });
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p class="test">a</p>');
    });

    suite.test('format inline on contentEditable: false block', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.setContent('<p>abc</p><p contenteditable="false">def</p>');
      LegacyUnit.setSelection(editor, 'p:nth-child(2)', 0, 'p:nth-child(2)', 3);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p>abc</p><p contenteditable="false">def</p>', 'Text is not bold');
    });

    suite.test('format block on contentEditable: false block', function (editor) {
      editor.formatter.register('format', {
        block: 'h1'
      });
      editor.setContent('<p>abc</p><p contenteditable="false">def</p>');
      LegacyUnit.setSelection(editor, 'p:nth-child(2)', 0, 'p:nth-child(2)', 3);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p>abc</p><p contenteditable="false">def</p>', 'P is not h1');
    });

    suite.test('contentEditable: false on start and contentEditable: true on end', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.setContent('<p>abc</p><p contenteditable="false">def</p><p>ghi</p>');
      LegacyUnit.setSelection(editor, 'p:nth-child(2)', 0, 'p:nth-child(3)', 3);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p>abc</p><p contenteditable="false">def</p><p><b>ghi</b></p>', 'Text in last paragraph is bold');
    });

    suite.test('contentEditable: true on start and contentEditable: false on end', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.setContent('<p>abc</p><p contenteditable="false">def</p>');
      LegacyUnit.setSelection(editor, 'p:nth-child(1)', 0, 'p:nth-child(2)', 3);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p><b>abc</b></p><p contenteditable="false">def</p>', 'Text in first paragraph is bold');
    });

    suite.test('contentEditable: true inside contentEditable: false', function (editor) {
      editor.formatter.register('format', {
        inline: 'b'
      });
      editor.setContent('<p>abc</p><p contenteditable="false"><span contenteditable="true">def</span></p>');
      LegacyUnit.setSelection(editor, 'span', 0, 'span', 3);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p>abc</p><p contenteditable="false"><span contenteditable="true"><b>def</b></span></p>', 'Text is bold');
    });

    suite.test('Del element wrapping blocks', function (editor) {
      editor.setContent('<p>a</p>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
      editor.formatter.register('format', {
        block: 'del',
        wrapper: true
      });
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<del><p>a</p></del>');
    });

    suite.test('Del element replacing block', function (editor) {
      editor.setContent('<p>a</p>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
      editor.formatter.register('format', {
        block: 'del'
      });
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<del>a</del>');
    });

    suite.test('Del element as inline', function (editor) {
      editor.setContent('<p>a</p>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
      editor.formatter.register('format', {
        inline: 'del'
      });
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><del>a</del></p>');
    });

    suite.test('Align specified table element with collapsed: false and selection collapsed', function (editor) {
      editor.setContent('<table><tr><td>a</td></tr></table>');
      LegacyUnit.setSelection(editor, 'td', 0, 'td', 0);
      editor.formatter.register('format', {
        selector: 'table',
        collapsed: false,
        styles: {
          'float': 'right'
        }
      });
      editor.formatter.apply('format', {}, editor.getBody().firstChild);
      LegacyUnit.equal(getContent(editor), '<table style="float: right;"><tbody><tr><td>a</td></tr></tbody></table>');
    });

    suite.test('Align nested table cell to same as parent', function (editor) {
      editor.setContent(
        '<table>' +
        '<tbody>' +
        '<tr>' +
        '<td style="text-align: right;">a' +
        '<table>' +
        '<tbody>' +
        '<tr>' +
        '<td><b>b</b></td>' +
        '</tr>' +
        '</tbody>' +
        '</table>' +
        '</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>'
      );

      LegacyUnit.setSelection(editor, 'b', 0);

      editor.formatter.register('format', {
        selector: 'td',
        styles: {
          'text-align': 'right'
        }
      });

      editor.formatter.apply('format', {}, editor.$('td td')[0]);

      LegacyUnit.equal(
        getContent(editor),
        '<table>' +
        '<tbody>' +
        '<tr>' +
        '<td style="text-align: right;">a' +
        '<table>' +
        '<tbody>' +
        '<tr>' +
        '<td style="text-align: right;"><b>b</b></td>' +
        '</tr>' +
        '</tbody>' +
        '</table>' +
        '</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>'
      );
    });

    suite.test('Apply ID format to around existing bookmark node', function (editor) {
      editor.getBody().innerHTML = '<p>a<span id="b" data-mce-type="bookmark"></span>b</p>';

      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('p')[0].lastChild, 1);
      editor.selection.setRng(rng);

      editor.formatter.register('format', {
        inline: 'span',
        attributes: {
          id: 'id'
        }
      });
      editor.formatter.apply('format');

      LegacyUnit.equal(HtmlUtils.normalizeHtml(editor.getBody().innerHTML), '<p><span id="id">a<span data-mce-type="bookmark" id="b"></span>b</span></p>');
    });

    suite.test('Bug #5134 - TinyMCE removes formatting tags in the getContent', function (editor) {
      editor.setContent('');
      editor.formatter.register('format', {
        inline: 'strong',
        toggle: false
      });
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '', 'empty TinyMCE');
      editor.selection.setContent('a');
      LegacyUnit.equal(getContent(editor), '<strong>a</strong>', 'bold text inside TinyMCE');
    });

    suite.test('Bug #5134 - TinyMCE removes formatting tags in the getContent - typing', function (editor) {
      editor.setContent('');
      editor.formatter.register('format', {
        inline: 'strong',
        toggle: false
      });
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '', 'empty TinyMCE');
      KeyUtils.type(editor, 'a');
      LegacyUnit.equal(getContent(editor), '<strong>a</strong>', 'bold text inside TinyMCE');
    });

    suite.test('Bug #5453 - TD contents with BR gets wrapped in block format', function (editor) {
      editor.setContent('<table><tr><td>abc<br />123</td></tr></table>');
      LegacyUnit.setSelection(editor, 'td', 1, 'td', 1);
      editor.formatter.register('format', {
        block: 'h1'
      });
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<table><tbody><tr><td><h1>abc</h1>123</td></tr></tbody></table>');
    });

    suite.test('Bug #6471 - Merge left/right style properties', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        styles: {
          fontWeight: 'bold'
        }
      });
      editor.setContent('<p>abc</p>');
      LegacyUnit.setSelection(editor, 'p', 2, 'p', 3);
      editor.formatter.apply('format');
      LegacyUnit.setSelection(editor, 'p', 1, 'p', 2);
      editor.formatter.apply('format');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p><span style="font-weight: bold;">abc</span></p>');
    });

    suite.test('merge_with_parents', function (editor) {
      editor.formatter.register('format', {
        inline: 'span',
        styles: {
          fontWeight: 'bold'
        },
        merge_with_parents: true
      });
      editor.setContent('<p><span style="color: red">a</span></p>');
      LegacyUnit.setSelection(editor, 'span', 0, 'span', 1);
      editor.formatter.apply('format');
      LegacyUnit.equal(editor.getContent(editor), '<p><span style="color: red; font-weight: bold;">a</span></p>');
    });

    suite.test('Format selection from with end at beginning of block', function (editor) {
      editor.setContent("<div id='a'>one</div><div id='b'>two</div>");
      editor.focus();
      LegacyUnit.setSelection(editor, '#a', 0, '#b', 0);
      editor.execCommand('formatBlock', false, 'h1');
      LegacyUnit.equal(getContent(editor), '<h1 id="a">one</h1><div id="b">two</div>');
    });

    suite.test('Format selection over fragments', function (editor) {
      editor.setContent("<p><strong>a</strong>bc<em>d</em></p>");
      LegacyUnit.setSelection(editor, 'strong', 1, 'em', 0);
      editor.formatter.apply('underline');
      LegacyUnit.equal(getContent(editor), '<p><strong>a</strong><span style="text-decoration: underline;">bc</span><em>d</em></p>');
    });

    suite.test("Child wrapper having the same format as the immediate parent, shouldn't be removed if it also has other formats merged", function (editor) {
      editor.getBody().innerHTML = '<p><span style="font-family: verdana;">a <span style="color: #ff0000;">b</span>c</span></p>';
      LegacyUnit.setSelection(editor, 'span span', 0, 'span span', 1);
      editor.formatter.apply('fontname', { value: "verdana" });
      LegacyUnit.equal(getContent(editor), '<p><span style="font-family: verdana;">a <span style="color: #ff0000;">b</span>c</span></p>');
    });

    suite.test("All the nested childNodes having fontSize should receive backgroundColor as well", function (editor) {
      editor.getBody().innerHTML = '<p>a <span style="font-size: 36pt;">b</span> c</p>';
      editor.selection.select(editor.dom.select('p')[0]);

      editor.formatter.apply('hilitecolor', { value: "#ff0000" });
      LegacyUnit.equal(
        getContent(editor),
        '<p><span style="background-color: #ff0000;">a <span style="font-size: 36pt; background-color: #ff0000;">b</span> c</span></p>'
      );

      editor.formatter.remove('hilitecolor', { value: "#ff0000" });
      LegacyUnit.equal(getContent(editor), '<p>a <span style="font-size: 36pt;">b</span> c</p>');
    });

    suite.test("Formatter should wrap elements that have data-mce-bogus attribute, rather then attempt to inject styles into it", function (editor) {
      // add a class to retain bogus element
      editor.getBody().innerHTML = '<p>That is a <span class="mce-spellchecker-word" data-mce-bogus="1">misespelled</span> text</p>';
      editor.selection.select(editor.dom.select('span')[0]);

      editor.formatter.apply('fontname', { value: "verdana" });

      LegacyUnit.equal(editor.getBody().innerHTML,
        '<p>That is a <span style="font-family: verdana;" data-mce-style="font-family: verdana;"><span class="mce-spellchecker-word" data-mce-bogus="1">misespelled</span></span> text</p>');

      LegacyUnit.equal(getContent(editor),
        '<p>that is a <span style="font-family: verdana;">misespelled</span> text</p>');

      editor.selection.select(editor.dom.select('span')[0]);
      editor.formatter.remove('fontname', { value: "verdana" });

      LegacyUnit.equal(editor.getBody().innerHTML,
        '<p>That is a <span class="mce-spellchecker-word" data-mce-bogus="1">misespelled</span> text</p>');

      LegacyUnit.equal(getContent(editor),
        '<p>that is a misespelled text</p>');
    });

    suite.test("TINY-1180: Formatting gets applied outside the currently selected range", function (editor) {
      editor.getBody().innerHTML = '<p>a <em><em>em</em> </em></p>';
      LegacyUnit.setSelection(editor, 'p', 0, 'em em', 0);
      editor.formatter.apply('strikethrough');
      LegacyUnit.equal(getContent(editor), '<p><span style="text-decoration: line-through;">a </span><em><em>em</em> </em></p>');
    });

    suite.test("Superscript on subscript removes the subscript element", function (editor) {
      editor.getBody().innerHTML = '<p><sub>a</sub></p>';
      LegacyUnit.setSelection(editor, 'sub', 0, 'sub', 1);
      editor.formatter.apply('superscript');
      LegacyUnit.equal(getContent(editor), '<p><sup>a</sup></p>');
    });

    suite.test("Subscript on superscript removes the superscript element", function (editor) {
      editor.getBody().innerHTML = '<p><sup>a</sup></p>';
      LegacyUnit.setSelection(editor, 'sup', 0, 'sup', 1);
      editor.formatter.apply('subscript');
      LegacyUnit.equal(getContent(editor), '<p><sub>a</sub></p>');
    });

    suite.test("TINY-782: Can't apply sub/sup to word on own line with large font", function (editor) {
      editor.getBody().innerHTML = '<p><span style="font-size: 18px;">abc</span></p>';
      LegacyUnit.setSelection(editor, 'span', 0, 'span', 3);
      editor.formatter.apply('superscript');
      LegacyUnit.equal(getContent(editor), '<p><sup>abc</sup></p>');
    });

    suite.test("TINY-782: Apply sub/sup to range with multiple font sizes", function (editor) {
      editor.getBody().innerHTML = '<p>a<span style="font-size: 18px;">b</span><span style="font-size: 24px;">c</span></p>';
      LegacyUnit.setSelection(editor, 'p', 0, 'span:nth-child(2)', 1);
      editor.formatter.apply('superscript');
      LegacyUnit.equal(getContent(editor), '<p><sup>abc</sup></p>');
    });

    suite.test("TINY-671: Background color on nested font size bug", function (editor) {
      editor.getBody().innerHTML = '<p><strong><span style="font-size: 18px;">abc</span></strong></p>';
      LegacyUnit.setSelection(editor, 'span', 0, 'span', 3);
      editor.formatter.apply('hilitecolor', { value: '#ff0000' });
      LegacyUnit.equal(getContent(editor), '<p><span style="background-color: #ff0000;"><strong><span style="font-size: 18px; background-color: #ff0000;">abc</span></strong></span></p>');
    });

    suite.test("Background color over range of font sizes", function (editor) {
      editor.getBody().innerHTML = '<p>a<span style="font-size: 18px;">b</span><span style="font-size: 24px;">c</span></p>';
      LegacyUnit.setSelection(editor, 'p', 0, 'span:nth-child(2)', 1);
      editor.formatter.apply('hilitecolor', { value: '#ff0000' });
      LegacyUnit.equal(
        getContent(editor),
        '<p><span style="background-color: #ff0000;">a<span style="font-size: 18px; background-color: #ff0000;">b</span><span style="font-size: 24px; background-color: #ff0000;">c</span></span></p>'
      );
    });

    suite.test("TINY-865: Font size removed when changing background color", function (editor) {
      editor.getBody().innerHTML = (
        '<p><span style="background-color: #ffff00;"><span style="font-size: 8pt;">a</span> ' +
        '<span style="font-size: 36pt;">b</span> <span style="font-size: 8pt;">c</span></span></p>'
      );
      LegacyUnit.setSelection(editor, 'span span:nth-child(2)', 0, 'span span:nth-child(2)', 1);
      editor.formatter.apply('hilitecolor', { value: '#ff0000' });
      LegacyUnit.equal(
        getContent(editor),
        '<p><span style="background-color: #ffff00;"><span style="font-size: 8pt;">a</span> <span ' +
        'style="font-size: 36pt; background-color: #ff0000;">b</span> <span style="font-size: 8pt;">c</span></span></p>'
      );
    });

    suite.test("TINY-935: Text color, then size, then change color wraps span doesn't change color", function (editor) {
      editor.getBody().innerHTML = '<p><span style="color: #00ff00; font-size: 14pt;">text</span></p>';
      LegacyUnit.setSelection(editor, 'span', 0, 'span', 4);
      editor.formatter.apply('forecolor', { value: '#ff0000' });
      LegacyUnit.equal(getContent(editor), '<p><span style="color: #ff0000; font-size: 14pt;">text</span></p>');
    });

    suite.test("GH-3519: Font family selection does not work after changing font size", function (editor) {
      editor.getBody().innerHTML = '<p><span style="font-size: 14pt; font-family: \'comic sans ms\', sans-serif;">text</span></p>';
      LegacyUnit.setSelection(editor, 'span', 0, 'span', 4);
      editor.formatter.apply('fontname', { value: "verdana" });
      LegacyUnit.equal(getContent(editor), '<p><span style="font-size: 14pt; font-family: verdana;">text</span></p>');
    });

    suite.test("Formatter should remove similar styles when clear_child_styles is set to true", function (editor) {
      editor.getBody().innerHTML = (
        '<p><span style="font-family: Arial; font-size: 13px">a</span>' +
        '<del style="font-family: Arial; font-size: 13px">b</del>' +
        '<span style="font-size: 13px">c</span></p>'
      );

      editor.selection.select(editor.dom.select('p')[0]);

      editor.formatter.register('format', { inline: 'span', styles: { fontSize: '14px' }, clear_child_styles: true });
      editor.formatter.apply('format');

      LegacyUnit.equal(
        getContent(editor),
        '<p><span style="font-size: 14px;"><span style="font-family: arial;">a</span><del style="font-family: arial;">b</del>c</span></p>'
      );
    });

    suite.test("If links=true, formatter shouldn't remove similar styles from links even if clear_child_styles=true", function (editor) {
      editor.getBody().innerHTML = '<p>a<a href="#">b</a>c</p>';

      editor.selection.select(editor.dom.select('p')[0]);

      editor.formatter.register('format', { inline: 'span', styles: { fontSize: '14px' }, links: true, clear_child_styles: true });
      editor.formatter.apply('format');

      LegacyUnit.equal(
        getContent(editor),
        '<p><span style="font-size: 14px;">a<a style="font-size: 14px;" href="#">b</a>c</span></p>'
      );
    });

    suite.test("Formatter should remove similar styles when clear_child_styles isn't defined", function (editor) {
      editor.getBody().innerHTML = (
        '<p><span style="font-family: Arial; font-size: 13px">a</span>' +
        '<del style="font-family: Arial; font-size: 13px">b</del>' +
        '<span style="font-size: 13px">c</span></p>'
      );

      editor.selection.select(editor.dom.select('p')[0]);

      editor.formatter.register('format', { inline: 'span', styles: { fontSize: '14px' } });
      editor.formatter.apply('format');

      LegacyUnit.equal(
        getContent(editor),
        '<p><span style="font-size: 14px;"><span style="font-family: arial;">a</span><del style="font-size: 13px; font-family: arial;">b</del>c</span></p>'
      );
    });

    suite.test('register/unregister', function (editor) {
      editor.formatter.register('format', { inline: 'span' });
      Assertions.assertEq('Should have format', true, !!editor.formatter.get('format'));
      editor.formatter.unregister('format');
      Assertions.assertEq('Should not have format', false, !!editor.formatter.get('format'));
    });

    suite.test('Get all formats', function (editor) {
      Assertions.assertEq('Should have a bunch of formats', true, Obj.keys(editor.formatter.get()).length > 0);
    });

    suite.test("Apply ceFalseOverride format", function (editor) {
      editor.setContent('<p contenteditable="false">a</p><div contenteditable="false">b</div>');
      editor.formatter.register('format', { selector: 'div', classes: ['a'], ceFalseOverride: true });

      editor.selection.select(editor.dom.select('p')[0]);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<p contenteditable="false">a</p><div contenteditable="false">b</div>'
      );

      editor.selection.select(editor.dom.select('div')[0]);
      editor.formatter.apply('format');
      LegacyUnit.equal(
        getContent(editor),
        '<p contenteditable="false">a</p><div class="a" contenteditable="false">b</div>'
      );
    });

    suite.test("Apply defaultBlock format", function (editor) {
      editor.getBody().innerHTML = 'a<br>b';
      editor.formatter.register('format', { selector: 'div', defaultBlock: 'div', classes: ['a'] });
      editor.selection.setCursorLocation(editor.firstChild, 0);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<div class="a">a</div>b');
    });

    suite.test("Apply format excluding trailing space", function (editor) {
      editor.setContent('<p>a b</p>');
      editor.formatter.register('format', { inline: 'b' });
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 2);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b>a</b> b</p>');
    });

    suite.test("Apply format with onformat handler", function (editor) {
      editor.setContent('<p>a</p>');
      editor.formatter.register('format', {
        inline: 'span',
        onformat: function (elm) {
          elm.className = 'x';
        }
      });
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><span class="x">a</span></p>');
    });

    suite.test("Apply format to triple clicked selection (webkit)", function (editor) {
      editor.setContent('<p>a</p><ul><li>a</li><li>b</li></ul>');
      editor.formatter.register('format', { inline: 'b' });

      var rng = editor.dom.createRng();
      rng.setStart(editor.dom.select('p')[0].firstChild, 0);
      rng.setEnd(editor.dom.select('li')[0], 0);
      editor.selection.setRng(rng);

      editor.formatter.apply('format');
      LegacyUnit.equal(getContent(editor), '<p><b>a</b></p><ul><li>a</li><li>b</li></ul>');
    });

    suite.test("Applying background color to partically selected contents", function (editor) {
      editor.setContent('<p><span style="background-color: #ff0000;">ab<span style="font-size: 32px;">cd</span><strong>ef</strong></span></p>');
      LegacyUnit.setSelection(editor, 'span span', 1, 'strong', 1);
      editor.formatter.apply('hilitecolor', { value: "#00ff00" });
      LegacyUnit.equal(getContent(editor), '<p><span style="background-color: #ff0000;">ab<span style="font-size: 32px;">c<span style="background-color: #00ff00;">d</span></span><strong><span style="background-color: #00ff00;">e</span>f</strong></span></p>');
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
    }, {
      indent: false,
      extended_valid_elements: 'b[id|style|title],i[id|style|title],span[id|class|style|title|contenteditable],font[face|size]',
      entities: 'raw',
      convert_fonts_to_spans: false,
      forced_root_block: false,
      valid_styles: {
        '*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,' +
            'margin,margin-top,margin-right,margin-bottom,margin-left,display,text-align'
      },
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
