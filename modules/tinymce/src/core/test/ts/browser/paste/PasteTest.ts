import { afterEach, before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Singleton } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { PastePostProcessEvent, PastePreProcessEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as PasteUtils from 'tinymce/core/paste/PasteUtils';

import * as PasteEventUtils from '../../module/test/PasteEventUtils';

describe('browser.tinymce.core.paste.PasteTest', () => {
  const browser = PlatformDetection.detect().browser;
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const testPasteHtml = (hook: TinyHooks.Hook<Editor>, html: string, expected: string) => () => {
    const editor = hook.editor();
    editor.setContent('');
    editor.execCommand('mceInsertClipboardContent', false, { html });
    TinyAssertions.assertContent(editor, expected);
  };

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  afterEach(() => {
    const editor = hook.editor();
    editor.options.unset('paste_remove_styles_if_webkit');
    editor.options.unset('paste_data_images');
    editor.options.unset('paste_webkit_styles');
  });

  it('TBA: Plain text toggle event', () => {
    const editor = hook.editor();
    const events: Array<{ state: boolean }> = [];

    editor.on('PastePlainTextToggle', (e) => {
      events.push({ state: e.state });
    });

    editor.execCommand('mceTogglePlainTextPaste');
    assert.deepEqual(events, [
      { state: true }
    ], 'Should be enabled');

    editor.execCommand('mceTogglePlainTextPaste');
    assert.deepEqual(events, [
      { state: true },
      { state: false }
    ], 'Should be disabled');

    editor.execCommand('mceTogglePlainTextPaste');
    assert.deepEqual(events, [
      { state: true },
      { state: false },
      { state: true }
    ], 'Should be enabled again');
  });

  it('TBA: Paste simple text content', () => {
    const editor = hook.editor();
    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 3);

    editor.execCommand('mceInsertClipboardContent', false, { html: 'TEST' });
    TinyAssertions.assertContent(editor, '<p>1TEST4</p>');
  });

  it('TBA: Paste text with meta and nbsp', () => {
    const editor = hook.editor();
    editor.setContent('<p>1&nbsp;</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 2);

    editor.execCommand('mceInsertClipboardContent', false, { html: '<meta charset="utf-8">TEST' });
    TinyAssertions.assertContent(editor, '<p>1 TEST</p>');
  });

  it('TBA: Paste styled text content', () => {
    const editor = hook.editor();
    editor.options.set('paste_remove_styles_if_webkit', false);

    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 3);

    editor.execCommand('mceInsertClipboardContent', false, { html: '<strong><em><span style="color: red;">TEST</span></em></strong>' });
    TinyAssertions.assertContent(editor, '<p>1<strong><em><span style="color: red;">TEST</span></em></strong>4</p>');
  });

  it('TBA: Paste paragraph in paragraph', () => {
    const editor = hook.editor();
    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 3);

    editor.execCommand('mceInsertClipboardContent', false, { html: '<p>TEST</p>' });
    TinyAssertions.assertContent(editor, '<p>1</p><p>TEST</p><p>4</p>');
  });

  it('TBA: Paste paragraphs in complex paragraph', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong><em>1234</em></strong></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 1, [ 0, 0, 0, 0 ], 3);

    editor.execCommand('mceInsertClipboardContent', false, { html: '<p>TEST 1</p><p>TEST 2</p>' });
    TinyAssertions.assertContent(editor, '<p><strong><em>1</em></strong></p><p>TEST 1</p><p>TEST 2</p><p><strong><em>4</em></strong></p>');
  });

  it('TBA: Paste Google Docs sanity test', () => {
    const editor = hook.editor();
    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('mceInsertClipboardContent', false, { html: '<span id="docs-internal-guid-94e46f1a-1c88-b42b-d502-1d19da30dde7"></span><p dir="ltr">Test</p>' });
    TinyAssertions.assertContent(editor, '<p><span id="docs-internal-guid-94e46f1a-1c88-b42b-d502-1d19da30dde7"></span></p><p dir="ltr">Test</p>');
  });

  it('TBA: Paste paste_merge_formats: true', () => {
    const editor = hook.editor();
    editor.options.set('paste_merge_formats', true);
    editor.setContent('<p><strong>a</strong></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);

    editor.execCommand('mceInsertClipboardContent', false, { html: '<em><strong>b</strong></em>' });
    TinyAssertions.assertContent(editor, '<p><strong>a<em>b</em></strong></p>');
  });

  it('TBA: Paste paste_merge_formats: false', () => {
    const editor = hook.editor();
    editor.options.set('paste_merge_formats', false);
    editor.setContent('<p><strong>a</strong></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);

    editor.execCommand('mceInsertClipboardContent', false, { html: '<em><strong>b</strong></em>' });
    TinyAssertions.assertContent(editor, '<p><strong>a<em><strong>b</strong></em></strong></p>');
  });

  it('TBA: paste invalid content with spans on page', () => {
    const editor = hook.editor();
    const startingContent = '<p>123 testing <span id="x">span later in document</span></p>';
    const insertedContent = '<ul><li>u</li><li>l</li></ul>';
    editor.setContent(startingContent);
    TinySelections.setCursor(editor, [ 0, 0 ], 0);

    editor.execCommand('mceInsertClipboardContent', false, { html: insertedContent });
    TinyAssertions.assertContent(editor, insertedContent + startingContent);
  });

  it('TBA: paste plain text with space', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    editor.execCommand('mceInsertClipboardContent', false, { text: ' a ' });
    TinyAssertions.assertContent(editor, '<p>t&nbsp;a&nbsp;xt</p>');
  });

  it('TBA: paste plain text with linefeeds', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    editor.execCommand('mceInsertClipboardContent', false, { text: 'a\nb\nc ' });
    TinyAssertions.assertContent(editor, '<p>ta<br>b<br>c&nbsp;xt</p>');
  });

  it('TBA: paste plain text with double linefeeds', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    editor.execCommand('mceInsertClipboardContent', false, { text: 'a\n\nb\n\nc' });
    TinyAssertions.assertContent(editor, '<p>t</p><p>a</p><p>b</p><p>c</p><p>xt</p>');
  });

  it('TBA: paste plain text with entities', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    editor.execCommand('mceInsertClipboardContent', false, { text: '< & >' });
    TinyAssertions.assertContent(editor, '<p>t&lt; &amp; &gt;xt</p>');
  });

  it('TBA: paste plain text with paragraphs', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);

    editor.execCommand('mceInsertClipboardContent', false, { text: 'a\n<b>b</b>\n\nc' });
    TinyAssertions.assertContent(editor, '<p>t</p><p>a<br>&lt;b&gt;b&lt;/b&gt;</p><p>c</p><p>xt</p>');
  });

  it('TBA: paste data image with paste_data_images: false', () => {
    const editor = hook.editor();
    editor.options.set('paste_data_images', false);

    editor.execCommand('mceInsertClipboardContent', false, { html: '<img src="data:image/gif;base64,R0lGODlhAQABAPAAAP8REf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==">' });
    TinyAssertions.assertContent(editor, '');

    editor.execCommand('mceInsertClipboardContent', false, { html: '<img alt="alt" src="data:image/gif;base64,R0lGODlhAQABAPAAAP8REf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==">' });
    TinyAssertions.assertContent(editor, '');
  });

  it('TBA: paste data image with paste_data_images: true', () => {
    const editor = hook.editor();
    editor.options.set('paste_data_images', true);

    editor.execCommand('mceInsertClipboardContent', false, { html: '<img src="data:image/gif;base64,R0lGODlhAQABAPAAAP8REf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==">' });
    TinyAssertions.assertContent(editor, '<p><img src="data:image/gif;base64,R0lGODlhAQABAPAAAP8REf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="></p>');
  });

  it('TBA: paste data with script', () => {
    const editor = hook.editor();

    editor.execCommand('mceInsertClipboardContent', false, { html: `<p><img src="non-existent.png" onerror="alert('!')" /></p>` });
    TinyAssertions.assertContent(editor, '<p><img src="non-existent.png"></p>');
  });

  it('TBA: paste pre process text (event)', () => {
    const editor = hook.editor();
    const callback = (e: EditorEvent<PastePreProcessEvent>) => {
      e.content = 'PRE:' + e.content;
    };

    editor.setContent('<p>a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    editor.on('PastePreProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { text: 'b\n2' });
    TinyAssertions.assertContent(editor, '<p>PRE:b<br>2</p>');

    editor.setContent('<p>a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    editor.off('PastePreProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { text: 'c' });
    TinyAssertions.assertContent(editor, '<p>c</p>');
  });

  it('TBA: paste pre process html (event)', () => {
    const editor = hook.editor();
    const callback = (e: EditorEvent<PastePreProcessEvent>) => {
      e.content = 'PRE:' + e.content;
    };

    editor.setContent('<p>a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    editor.on('PastePreProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { html: '<em>b</em>' });
    TinyAssertions.assertContent(editor, '<p>PRE:<em>b</em></p>');

    editor.setContent('<p>a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    editor.off('PastePreProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { html: '<em>c</em>' });
    TinyAssertions.assertContent(editor, '<p><em>c</em></p>');
  });

  it('TBA: paste post process (event)', () => {
    const editor = hook.editor();
    const callback = (e: EditorEvent<PastePostProcessEvent>) => {
      e.node.innerHTML += ':POST';
    };

    editor.setContent('<p>a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    editor.on('PastePostProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { html: '<em>b</em>' });
    TinyAssertions.assertContent(editor, '<p><em>b</em>:POST</p>');

    editor.setContent('<p>a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    editor.off('PastePostProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { html: '<em>c</em>' });
    TinyAssertions.assertContent(editor, '<p><em>c</em></p>');
  });

  it('TBA: paste innerText of conditional comments', () => {
    assert.equal(PasteUtils.innerText('<![if !supportLists]>X<![endif]>'), 'X');
  });

  it('TBA: paste innerText of single P', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    assert.equal(PasteUtils.innerText(editor.getBody().innerHTML), 'a');
  });

  it('TBA: paste innerText of single P with whitespace wrapped content', () => {
    const editor = hook.editor();
    editor.setContent('<p>   a   </p>');
    assert.equal(PasteUtils.innerText(editor.getBody().innerHTML), 'a');
  });

  it('TBA: paste innerText of two P', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    assert.equal(PasteUtils.innerText(editor.getBody().innerHTML), 'a\n\nb');
  });

  it('TBA: paste innerText of H1 and P', () => {
    const editor = hook.editor();
    editor.setContent('<h1>a</h1><p>b</p>');
    assert.equal(PasteUtils.innerText(editor.getBody().innerHTML), 'a\nb');
  });

  it('TBA: paste innerText of P with BR', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<br>b</p>');
    assert.equal(PasteUtils.innerText(editor.getBody().innerHTML), 'a\nb');
  });

  it('TBA: paste innerText of P with WBR', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<wbr>b</p>');
    assert.equal(PasteUtils.innerText(editor.getBody().innerHTML), 'ab');
  });

  it('TBA: paste innerText of P with VIDEO', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<video>b<br>c</video>d</p>');
    assert.equal(PasteUtils.innerText(editor.getBody().innerHTML), 'a d');
  });

  it('TBA: paste innerText of PRE', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre>a\nb\n</pre>';
    assert.equal(PasteUtils.innerText(editor.getBody().innerHTML).replace(/\r\n/g, '\n'), 'a\nb\n');
  });

  it('TBA: paste innerText of textnode with whitespace', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre> a </pre>';
    assert.equal(PasteUtils.innerText((editor.getBody().firstChild as HTMLElement).innerHTML), ' a ');
  });

  it('TBA: trim html from clipboard fragments', () => {
    assert.equal(PasteUtils.trimHtml('<!--StartFragment-->a<!--EndFragment-->'), 'a');
    assert.equal(PasteUtils.trimHtml('a\n<body>\n<!--StartFragment-->\nb\n<!--EndFragment-->\n</body>\nc'), '\nb\n');
    assert.equal(PasteUtils.trimHtml('a<!--StartFragment-->b<!--EndFragment-->c'), 'abc');
    assert.equal(PasteUtils.trimHtml('a<body>b</body>c'), 'b');
    assert.equal(PasteUtils.trimHtml('<HTML><HEAD><TITLE>a</TITLE></HEAD><BODY>b</BODY></HTML>'), 'b');
    assert.equal(PasteUtils.trimHtml('a<span class="Apple-converted-space">\u00a0<\/span>b'), 'a b');
    assert.equal(PasteUtils.trimHtml('<span class="Apple-converted-space">\u00a0<\/span>b'), ' b');
    assert.equal(PasteUtils.trimHtml('a<span class="Apple-converted-space">\u00a0<\/span>'), 'a ');
    assert.equal(PasteUtils.trimHtml('<span class="Apple-converted-space">\u00a0<\/span>'), ' ');
  });

  context('paste_webkit_styles', () => {
    before(function () {
      if (!browser.isChromium() && !browser.isSafari()) {
        this.skip();
      }
    });

    it('TBA: paste webkit retains text styles runtime styles internal', () => {
      const editor = hook.editor();
      editor.options.set('paste_webkit_styles', 'color');
      editor.execCommand('mceInsertClipboardContent', false, { html: '&lt;span style="color:red"&gt;&lt;span data-mce-style="color:red"&gt;' });
      TinyAssertions.assertContent(editor, '<p>&lt;span style="color:red"&gt;&lt;span data-mce-style="color:red"&gt;</p>');
    });

    it('TBA: paste webkit remove runtime styles internal', () => {
      const editor = hook.editor();
      editor.options.set('paste_webkit_styles', 'color');
      editor.execCommand('mceInsertClipboardContent', false, { html: '<span style="color:red; font-size: 42px" data-mce-style="color: red;">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span style="color: red;">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles (color)', () => {
      const editor = hook.editor();
      editor.options.set('paste_webkit_styles', 'color');
      editor.execCommand('mceInsertClipboardContent', false, { html: '<span style="color:red; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span style="color: red;">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles keep before attr', () => {
      const editor = hook.editor();
      editor.execCommand('mceInsertClipboardContent', false, { html: '<span class="c" style="color:red; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span class="c">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles keep after attr', () => {
      const editor = hook.editor();
      editor.execCommand('mceInsertClipboardContent', false, { html: '<span style="color:red; text-indent: 10px" title="t">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span title="t">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles keep before/after attr', () => {
      const editor = hook.editor();
      editor.execCommand('mceInsertClipboardContent', false, { html: '<span class="c" style="color:red; text-indent: 10px" title="t">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span class="c" title="t">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles (background-color)', () => {
      const editor = hook.editor();
      editor.options.set('paste_webkit_styles', 'background-color');
      editor.execCommand('mceInsertClipboardContent', false, { html: '<span style="background-color:red; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span style="background-color: red;">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles (font-size)', () => {
      const editor = hook.editor();
      editor.options.set('paste_webkit_styles', 'font-size');
      editor.execCommand('mceInsertClipboardContent', false, { html: '<span style="font-size:42px; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span style="font-size: 42px;">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles (font-family)', () => {
      const editor = hook.editor();
      editor.options.set('paste_webkit_styles', 'font-family');
      editor.execCommand('mceInsertClipboardContent', false, { html: '<span style="font-family:Arial; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span style="font-family: Arial;">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles font-family allowed but not specified', () => {
      const editor = hook.editor();
      editor.options.set('paste_webkit_styles', 'font-family');
      editor.execCommand('mceInsertClipboardContent', false, { html: '<p title="x" style="text-indent: 10px">Test</p>' });
      TinyAssertions.assertContent(editor, '<p title="x">Test</p>');
    });

    it('TBA: paste webkit remove runtime styles (custom styles)', () => {
      const editor = hook.editor();
      editor.options.set('paste_webkit_styles', 'color font-style');
      editor.execCommand('mceInsertClipboardContent', false, { html: '<span style="color: red; font-style: italic; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span style="color: red; font-style: italic;">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles (all)', () => {
      const editor = hook.editor();
      editor.options.set('paste_webkit_styles', 'all');
      editor.execCommand('mceInsertClipboardContent', false, { html: '<span style="color: red; font-style: italic; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span style=\"color: red; font-style: italic; text-indent: 10px;\">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles (none)', () => {
      const editor = hook.editor();
      editor.options.set('paste_webkit_styles', 'none');
      editor.execCommand('mceInsertClipboardContent', false, { html: '<span style="color: red; font-style: italic; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p>Test</p>');
    });

    it('TBA: paste webkit remove runtime styles (color) in the same (color) (named)', () => {
      const editor = hook.editor();
      editor.options.set('paste_webkit_styles', 'color');

      editor.setContent('<p style="color:red">Test</span>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);

      editor.execCommand('mceInsertClipboardContent', false, {
        html: (
          '<span style="color:#ff0000; text-indent: 10px">a</span>' +
          '<span style="color:rgb(255, 0, 0); text-indent: 10px">b</span>'
        )
      });

      TinyAssertions.assertContent(editor, '<p style="color: red;">ab</p>');
    });

    it('TBA: paste webkit remove runtime styles (color) in the same (color) (hex)', () => {
      const editor = hook.editor();
      editor.setContent('<p style="color:#ff0000">Test</span>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);

      editor.execCommand('mceInsertClipboardContent', false, {
        html: (
          '<span style="color:red; text-indent: 10px">a</span>' +
          '<span style="color:#ff0000; text-indent: 10px">b</span>' +
          '<span style="color:rgb(255, 0, 0); text-indent: 10px">c</span>'
        )
      });

      TinyAssertions.assertContent(editor, '<p style="color: #ff0000;">abc</p>');
    });

    it('TBA: paste webkit remove runtime styles (color) in the same (color) (rgb)', () => {
      const editor = hook.editor();
      editor.setContent('<p style="color:rgb(255, 0, 0)">Test</span>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);

      editor.execCommand('mceInsertClipboardContent', false, {
        html: (
          '<span style="color:red; text-indent: 10px">a</span>' +
          '<span style="color:#ff0000; text-indent: 10px">b</span>' +
          '<span style="color:rgb(255, 0, 0); text-indent: 10px">c</span>'
        )
      });

      TinyAssertions.assertContent(editor, '<p style="color: rgb(255, 0, 0);">abc</p>');
    });

    it('TINY-9997: Paste command does not dispatch input events', async () => {
      const editor = hook.editor();
      const beforeinputEvent = Singleton.value<EditorEvent<InputEvent>>();
      const inputEvent = Singleton.value<EditorEvent<InputEvent>>();
      const setBeforeInputEvent = (e: EditorEvent<InputEvent>) => beforeinputEvent.set(e);
      const setInputEvent = (e: EditorEvent<InputEvent>) => inputEvent.set(e);

      editor.on('beforeinput', setBeforeInputEvent);
      editor.on('input', setInputEvent);

      const html = '<p>Test</p>';
      editor.execCommand('mceInsertClipboardContent', false, { html });
      await PasteEventUtils.pWaitForAndAssertEventsDoNotFire([ beforeinputEvent, inputEvent ]);
      TinyAssertions.assertContent(editor, html);

      editor.off('beforeinput', setBeforeInputEvent);
      editor.off('input', setInputEvent);
    });

    context('iframe sandboxing', () => {
      context('sandbox_iframes: false', () => {
        const hook = TinyHooks.bddSetupLight<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          sandbox_iframes: false
        });

        it('TINY-10348: Pasted iframe should not be sandboxed',
          testPasteHtml(hook, '<iframe src="about:blank"></iframe>', '<p><iframe src="about:blank"></iframe></p>'));
      });

      context('sandbox_iframes: true', () => {
        const hook = TinyHooks.bddSetupLight<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          sandbox_iframes: true
        });

        it('TINY-10348: Pasted iframe should be sandboxed',
          testPasteHtml(hook, '<iframe src="about:blank"></iframe>', '<p><iframe src="about:blank" sandbox=""></iframe></p>'));
      });
    });

    context('Convert unsafe embeds', () => {
      context('convert_unsafe_embeds: false', () => {
        const hook = TinyHooks.bddSetupLight<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          convert_unsafe_embeds: false
        });

        it('TINY-10349: Pasted object element should not be converted',
          testPasteHtml(hook, '<object data="about:blank"></object>', '<p><object data="about:blank"></object></p>'));

        it('TINY-10349: Pasted embed element should not be converted',
          testPasteHtml(hook, '<embed src="about:blank">', '<p><embed src="about:blank"></p>'));
      });

      context('convert_unsafe_embeds: true', () => {
        const hook = TinyHooks.bddSetupLight<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          convert_unsafe_embeds: true
        });

        it('TINY-10349: Pasted object element should be converted to iframe',
          testPasteHtml(hook, '<object data="about:blank">', '<p><iframe src="about:blank"></iframe></p>'));

        it('TINY-10349: Pasted embed element should be converted to iframe',
          testPasteHtml(hook, '<embed src="about:blank">', '<p><iframe src="about:blank"></iframe></p>'));
      });

      context('convert_unsafe_embeds: true, sandbox_iframes: true', () => {
        const hook = TinyHooks.bddSetupLight<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          convert_unsafe_embeds: true,
          sandbox_iframes: true
        });

        it('TINY-10349: Pasted object element should be converted to sandboxed iframe',
          testPasteHtml(hook, '<object data="about:blank"></object>', '<p><iframe src="about:blank" sandbox=""></iframe></p>'));

        it('TINY-10349: Pasted embed element should be converted to sandboxed iframe',
          testPasteHtml(hook, '<embed src="about:blank">', '<p><iframe src="about:blank" sandbox=""></iframe></p>'));
      });
    });
  });
});
