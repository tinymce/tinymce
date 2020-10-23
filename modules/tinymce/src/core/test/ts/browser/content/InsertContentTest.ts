import { Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import * as InsertContent from 'tinymce/core/content/InsertContent';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.content.InsertContentTest', (success, failure) => {
  Theme();

  const sInsert = (editor: Editor, value: string | { content: string; paste?: boolean; merge?: boolean }) => Step.sync(() => {
    InsertContent.insertAtCaret(editor, value);
  });

  const getTests = (editor: Editor, tinyApis: TinyApis) => [
    Log.stepsAsStep('TBA', 'insertAtCaret - i inside text, converts to em', [
      tinyApis.sSetContent('<p>1234</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 2, [ 0, 0 ], 2),
      sInsert(editor, '<i>a</i>'),
      tinyApis.sAssertContent('<p>12<em>a</em>34</p>')
    ]),

    Log.stepsAsStep('TBA', 'insertAtCaret - ul at beginning of li', [
      tinyApis.sSetContent('<ul><li>12</li></ul>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0),
      sInsert(editor, { content: '<ul><li>a</li></ul>', paste: true }),
      tinyApis.sAssertContent('<ul><li>a</li><li>12</li></ul>'),
      tinyApis.sAssertSelection([ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0)
    ]),

    Log.stepsAsStep('TBA', 'insertAtCaret - ul with multiple items at beginning of li', [
      tinyApis.sSetContent('<ul><li>12</li></ul>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0),
      sInsert(editor, { content: '<ul><li>a</li><li>b</li></ul>', paste: true }),
      tinyApis.sAssertContent('<ul><li>a</li><li>b</li><li>12</li></ul>'),
      tinyApis.sAssertSelection([ 0, 2, 0 ], 0, [ 0, 2, 0 ], 0)
    ]),

    Log.stepsAsStep('TBA', 'insertAtCaret - ul at end of li', [
      tinyApis.sSetContent('<ul><li>12</li></ul>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0, 0 ], 2, [ 0, 0, 0 ], 2),
      sInsert(editor, { content: '<ul><li>a</li></ul>', paste: true }),
      tinyApis.sAssertContent('<ul><li>12</li><li>a</li></ul>'),
      tinyApis.sAssertSelection([ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1)
    ]),

    Log.stepsAsStep('TBA', 'insertAtCaret - ul with multiple items at end of li', [
      tinyApis.sSetContent('<ul><li>12</li></ul>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0, 0 ], 2, [ 0, 0, 0 ], 2),
      sInsert(editor, { content: '<ul><li>a</li><li>b</li><li>c</li></ul>', paste: true }),
      tinyApis.sAssertContent('<ul><li>12</li><li>a</li><li>b</li><li>c</li></ul>'),
      tinyApis.sAssertSelection([ 0, 3, 0 ], 1, [ 0, 3, 0 ], 1)
    ]),

    Log.stepsAsStep('TBA', 'insertAtCaret - ul with multiple items in middle of li', [
      tinyApis.sSetContent('<ul><li>12</li></ul>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1),
      sInsert(editor, { content: '<ul><li>a</li><li>b</li></ul>', paste: true }),
      tinyApis.sAssertContent('<ul><li>1</li><li>a</li><li>b</li><li>2</li></ul>'),
      tinyApis.sAssertSelection([ 0, 2, 0 ], 1, [ 0, 2, 0 ], 1)
    ]),

    Log.stepsAsStep('TBA', 'insertAtCaret - ul in middle of li with formatting', [
      tinyApis.sSetContent('<ul><li><em><strong>12</strong></em></li></ul>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0, 0, 0, 0 ], 1, [ 0, 0, 0, 0, 0 ], 1),
      sInsert(editor, { content: '<ul><li>a</li></ul>', paste: true }),
      tinyApis.sAssertContent('<ul><li><em><strong>1</strong></em></li><li>a</li><li><em><strong>2</strong></em></li></ul>'),
      tinyApis.sAssertSelection([ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1)
    ]),

    Log.stepsAsStep('TBA', 'insertAtCaret - ul with trailing empty block in middle of li', [
      tinyApis.sSetContent('<ul><li>a</li><li>d</li></ul>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection( [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1),
      sInsert(editor, { content: '<ul><li>b</li><li>c</li></ul><p>\u00a0</p>', paste: true }),
      tinyApis.sAssertContent('<ul><li>a</li><li>b</li><li>c</li><li>d</li></ul>'),
      tinyApis.sAssertSelection([ 0, 2, 0 ], 1, [ 0, 2, 0 ], 1)
    ]),

    Log.stepsAsStep('TBA', 'insertAtCaret - ul at beginning of li with empty end li', [
      tinyApis.sSetContent('<ul><li>12</li></ul>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0),
      sInsert(editor, { content: '<ul><li>a</li><li></li></ul>', paste: true }),
      tinyApis.sAssertContent('<ul><li>a</li><li>12</li></ul>'),
      tinyApis.sAssertSelection([ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0)
    ]),

    Log.stepsAsStep('TBA', 'insertAtCaret - merge inline elements', [
      tinyApis.sSetContent('<p><strong><em>abc</em></strong></p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0, 0, 0 ], 1, [ 0, 0, 0, 0 ], 1),
      sInsert(editor, { content: '<em><strong>123</strong></em>', merge: true }),
      tinyApis.sAssertContent('<p><strong><em>a123bc</em></strong></p>')
    ]),

    Log.stepsAsStep('TINY-1231', 'insertAtCaret - list into empty table cell with invalid contents', [
      tinyApis.sSetRawContent('<table class="mce-item-table"><tbody><tr><td><br></td></tr></tbody></table>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0),
      sInsert(editor, {
        content: '<meta http-equiv="content-type" content="text/html; charset=utf-8"><ul><li>a</li></ul>',
        paste: true
      }),
      tinyApis.sAssertContent('<table><tbody><tr><td><ul><li>a</li></ul></td></tr></tbody></table>'),
      tinyApis.sAssertSelection([ 0, 0, 0, 0, 0, 0, 0 ], 1, [ 0, 0, 0, 0, 0, 0, 0 ], 1)
    ]),

    Log.stepsAsStep('TBA', 'insertAtCaret - content into single table cell with all content selected', [
      tinyApis.sSetRawContent('<table class="mce-item-table"><tbody><tr><td>content</td></tr></tbody></table>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 7),
      sInsert(editor, { content: 'replace', paste: true }),
      tinyApis.sAssertContent('<table><tbody><tr><td>replace</td></tr></tbody></table>')
    ]),

    Log.stepsAsStep('TBA', 'insertAtCaret - empty paragraph pad the empty element with br on insert and nbsp on save', [
      tinyApis.sSetContent('<p>ab</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 1, [ 0, 0 ], 1),
      sInsert(editor, { content: '<p></p>', merge: true }),
      Step.sync(() => {
        Assert.eq('Raw content', editor.getContent({ format: 'raw' }), '<p>a</p><p><br data-mce-bogus="1"></p><p>b</p>');
      }),
      tinyApis.sAssertContent('<p>a</p><p>\u00a0</p><p>b</p>')
    ]),

    Log.step('TBA', 'insertAtCaret prevent default of beforeSetContent', Step.sync(() => {
      let args;

      const handler = function (e) {
        if (e.selection === true) {
          e.preventDefault();
          e.content = '<h1>b</h1>';
          editor.getBody().innerHTML = '<h1>c</h1>';
        }
      };

      const collector = function (e) {
        args = e;
      };

      editor.on('BeforeSetContent', handler);
      editor.on('SetContent', collector);

      editor.setContent('<p>a</p>');
      editor.selection.setCursorLocation(editor.dom.select('p')[0].firstChild, 0);
      InsertContent.insertAtCaret(editor, { content: '<p>b</p>', paste: true });
      Assert.eq('', editor.getContent(), '<h1>c</h1>');
      Assert.eq('', args.content, '<h1>b</h1>');
      Assert.eq('', args.type, 'setcontent');
      Assert.eq('', args.paste, true);

      editor.off('BeforeSetContent', handler);
      editor.on('BeforeSetContent', collector);
    })),

    Log.stepsAsStep('TBA', 'insertAtCaret - text content at a text node with a trailing nbsp character', [
      tinyApis.sSetContent('<p>abc&nbsp;</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 4, [ 0, 0 ], 4),
      sInsert(editor, 'd'),
      tinyApis.sAssertContent('<p>abc d</p>')
    ]),

    Log.stepsAsStep('TBA', 'insertAtCaret - html at a text node with a trailing nbsp character', [
      tinyApis.sSetContent('<p>abc&nbsp;</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 4, [ 0, 0 ], 4),
      sInsert(editor, '<em>d</em>'),
      tinyApis.sAssertContent('<p>abc <em>d</em></p>')
    ]),

    Log.stepsAsStep('TBA', 'insertAtCaret - text in the middle of a text node with nbsp characters', [
      tinyApis.sSetContent('<p>a&nbsp;c</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 2, [ 0, 0 ], 2),
      sInsert(editor, 'b'),
      tinyApis.sAssertContent('<p>a bc</p>')
    ]),

    Log.stepsAsStep('TBA', 'insertAtCaret - html in the middle of a text node with nbsp characters', [
      tinyApis.sSetContent('<p>a&nbsp;c</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 2, [ 0, 0 ], 2),
      sInsert(editor, '<em>b</em>'),
      tinyApis.sAssertContent('<p>a <em>b</em>c</p>')
    ]),

    Log.stepsAsStep('TINY-5966', ' insertAtCaret - text content at a text node with a leading nbsp character', [
      tinyApis.sSetContent('<p>&nbsp;abc</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 0),
      sInsert(editor, 'd'),
      tinyApis.sAssertContent('<p>d abc</p>')
    ]),

    Log.stepsAsStep('TINY-5966', ' insertAtCaret - html at a text node with a leading nbsp character', [
      tinyApis.sSetContent('<p>&nbsp;abc</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 0),
      sInsert(editor, '<em>d</em>'),
      tinyApis.sAssertContent('<p><em>d</em> abc</p>')
    ]),

    Log.stepsAsStep('TINY-5966', ' insertAtCaret - text content at a text node with a only a nbsp character', [
      tinyApis.sSetRawContent('<p>&nbsp;</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 1, [ 0, 0 ], 1),
      sInsert(editor, 'a'),
      tinyApis.sAssertContent('<p>\u00a0a</p>'),

      tinyApis.sSetRawContent('<p>&nbsp;</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 0),
      sInsert(editor, 'a'),
      tinyApis.sAssertContent('<p>a\u00a0</p>')
    ]),

    Log.stepsAsStep('TINY-5966', ' insertAtCaret - html at a text node with a only a nbsp character', [
      tinyApis.sSetRawContent('<p>&nbsp;</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 1, [ 0, 0 ], 1),
      sInsert(editor, '<em>a</em>'),
      tinyApis.sAssertContent('<p>\u00a0<em>a</em></p>'),

      tinyApis.sSetRawContent('<p>&nbsp;</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 0),
      sInsert(editor, '<em>a</em>'),
      tinyApis.sAssertContent('<p><em>a</em>\u00a0</p>')
    ]),

    Log.stepsAsStep('TINY-5966', ' insertAtCaret - text content at a empty block with leading/trailing spaces', [
      tinyApis.sSetContent('<p></p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 0),
      sInsert(editor, ' a '),
      tinyApis.sAssertContent('<p>\u00a0a\u00a0</p>')
    ]),

    Log.stepsAsStep('TINY-5966', ' insertAtCaret - text content at a text node between 2 spaces with leading/trailing spaces', [
      tinyApis.sSetContent('<p>a&nbsp; c</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 2, [ 0, 0 ], 2),
      sInsert(editor, ' b '),
      tinyApis.sAssertContent('<p>a\u00a0 b\u00a0 c</p>')
    ]),

    Log.stepsAsStep('TINY-5966', ' insertAtCaret - text content at a text node before br', [
      tinyApis.sSetContent('<p>a<br>b</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 1, [ 0, 0 ], 1),
      sInsert(editor, ' c '),
      tinyApis.sAssertContent('<p>a c\u00a0<br />b</p>'),

      tinyApis.sSetContent('<p>a&nbsp;<br>&nbsp;b</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 2, [ 0, 0 ], 2),
      sInsert(editor, 'c'),
      tinyApis.sAssertContent('<p>a c<br />\u00a0b</p>')
    ]),

    Log.stepsAsStep('TINY-5966', ' insertAtCaret - html content at a text node before br', [
      tinyApis.sSetContent('<p>a&nbsp;<br>&nbsp;b</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 2, [ 0, 0 ], 2),
      sInsert(editor, '<em>c</em>'),
      tinyApis.sAssertContent('<p>a <em>c</em><br />\u00a0b</p>')
    ]),

    Log.stepsAsStep('TINY-5966', ' insertAtCaret - text content at a text node after br', [
      tinyApis.sSetContent('<p>a<br>b</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 2 ], 0, [ 0, 2 ], 0),
      sInsert(editor, ' c '),
      tinyApis.sAssertContent('<p>a<br />\u00a0c b</p>'),

      tinyApis.sSetContent('<p>a&nbsp;<br>&nbsp;b</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 2 ], 0, [ 0, 2 ], 0),
      sInsert(editor, 'c'),
      tinyApis.sAssertContent('<p>a\u00a0<br />c b</p>')
    ]),

    Log.stepsAsStep('TINY-5966', ' insertAtCaret - html content at a text node after br', [
      tinyApis.sSetContent('<p>a&nbsp;<br>&nbsp;b</p>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 2 ], 0, [ 0, 2 ], 0),
      sInsert(editor, '<em>c</em>'),
      tinyApis.sAssertContent('<p>a\u00a0<br /><em>c</em> b</p>')
    ]),

    Log.stepsAsStep('TINY-5966', ' insertAtCaret - text content with spaces in pre', [
      tinyApis.sSetContent('<pre></pre>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 0),
      sInsert(editor, '  a  '),
      tinyApis.sAssertContent('<pre>  a  </pre>'),

      tinyApis.sSetContent('<pre>a b c</pre>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 2, [ 0, 0 ], 3),
      sInsert(editor, ' b '),
      tinyApis.sAssertContent('<pre>a  b  c</pre>')
    ]),

    Log.stepsAsStep('TINY-5966', ' insertAtCaret - html content with spaces in pre', [
      tinyApis.sSetContent('<pre></pre>'),
      tinyApis.sFocus(),
      tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 0),
      sInsert(editor, ' <strong> a </strong> '),
      tinyApis.sAssertContent('<pre> <strong> a </strong> </pre>')
    ])
  ];

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApi = TinyApis(editor);
    Pipeline.async({}, getTests(editor, tinyApi), onSuccess, onFailure);
  }, {
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
