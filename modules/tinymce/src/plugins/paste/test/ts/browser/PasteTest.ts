import { afterEach, before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import * as Utils from 'tinymce/plugins/paste/core/Utils';
import Plugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Strings from '../module/test/Strings';

describe('browser.tinymce.plugins.paste.PasteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    indent: false,
    plugins: 'paste',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  afterEach(() => {
    const editor = hook.editor();
    delete editor.settings.paste_remove_styles_if_webkit;
    delete editor.settings.paste_retain_style_properties;
    delete editor.settings.paste_enable_default_filters;
    delete editor.settings.paste_data_images;
    delete editor.settings.paste_webkit_styles;
  });

  /* eslint-disable max-len */

  const trimContent = (content: string) =>
    content.replace(/^<p>&nbsp;<\/p>\n?/, '').replace(/\n?<p>&nbsp;<\/p>$/, '');

  it('TBA: Plain text toggle event', () => {
    const editor = hook.editor();
    const events = [];

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

    editor.execCommand('mceInsertClipboardContent', false, { content: 'TEST' });
    TinyAssertions.assertContent(editor, '<p>1TEST4</p>');
  });

  it('TBA: Paste text with meta and nbsp', () => {
    const editor = hook.editor();
    editor.setContent('<p>1&nbsp;</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 2);

    editor.execCommand('mceInsertClipboardContent', false, { content: '<meta charset="utf-8">TEST' });
    TinyAssertions.assertContent(editor, '<p>1 TEST</p>');
  });

  it('TBA: Paste styled text content', () => {
    const editor = hook.editor();
    editor.settings.paste_remove_styles_if_webkit = false;

    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 3);

    editor.execCommand('mceInsertClipboardContent', false, { content: '<strong><em><span style="color: red;">TEST</span></em></strong>' });
    TinyAssertions.assertContent(editor, '<p>1<strong><em><span style="color: red;">TEST</span></em></strong>4</p>');
  });

  it('TBA: Paste paragraph in paragraph', () => {
    const editor = hook.editor();
    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 3);

    editor.execCommand('mceInsertClipboardContent', false, { content: '<p>TEST</p>' });
    TinyAssertions.assertContent(editor, '<p>1</p><p>TEST</p><p>4</p>');
  });

  it('TBA: Paste paragraphs in complex paragraph', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong><em>1234</em></strong></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 1, [ 0, 0, 0, 0 ], 3);

    editor.execCommand('mceInsertClipboardContent', false, { content: '<p>TEST 1</p><p>TEST 2</p>' });
    TinyAssertions.assertContent(editor, '<p><strong><em>1</em></strong></p><p>TEST 1</p><p>TEST 2</p><p><strong><em>4</em></strong></p>');
  });

  it('TBA: Paste Word fake list', () => {
    const editor = hook.editor();
    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('mceInsertClipboardContent', false, { content: Strings.wordList2 });
    TinyAssertions.assertContent(editor, '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li><li>Item 6</li></ul>');

    editor.settings.paste_retain_style_properties = 'border';

    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    editor.execCommand('mceInsertClipboardContent', false, { content: '<p class="ListStyle" style="margin-top:0cm;margin-right:0cm;margin-bottom:3.0pt;margin-left:18.0pt;mso-add-space:auto;text-align:justify;text-indent:-18.0pt;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><span lang="DE" style="font-family:Verdana;mso-fareast-font-family:Verdana;mso-bidi-font-family:Verdana;color:black"><span style="mso-list:Ignore">\u25CF<span style="font:7.0pt &quot;Times New Roman&quot;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><span lang="DE" style="font-family:Arial;mso-fareast-font-family:Arial;mso-bidi-font-family:Arial;color:black">Item&nbsp; Spaces.<o:p></o:p></span></p>' });
    TinyAssertions.assertContent(editor, '<ul><li>Item&nbsp; Spaces.</li></ul>');

    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    editor.execCommand('mceInsertClipboardContent', false, { content: '<p class="ListStyle" style="margin-left:36.0pt;mso-add-space:auto;text-indent:-18.0pt;mso-list:l0 level1 lfo1;tab-stops:list 36.0pt"><span lang="EN-US" style="color:black;mso-ansi-language:EN-US"><span style="mso-list:Ignore">1.<span style="font:7.0pt &quot;Times New Roman&quot;">&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><span lang="EN-US" style="font-family:Arial;mso-fareast-font-family:Arial;mso-bidi-font-family:Arial;color:black;mso-ansi-language:EN-US">Version 7.0</span><span lang="EN-US" style="font-family:Arial;mso-fareast-font-family:Arial;mso-bidi-font-family:Arial;color:black;mso-ansi-language:EN-US">:<o:p></o:p></span></p>' });
    TinyAssertions.assertContent(editor, '<ol><li>Version 7.0:</li></ol>');
  });

  it('TBA: Paste Word fake list of ten items with roman numerals', () => {
    const editor = hook.editor();
    editor.execCommand('mceInsertClipboardContent', false, {
      content:
        `<p class=MsoListParagraphCxSpFirst style='text-indent:-36.0pt;mso-text-indent-alt:
        -18.0pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span lang=en-FI
        style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span
        style='mso-list:Ignore'><span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span>i.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span></span></span><![endif]><span lang=EN-US style='mso-ansi-language:EN-US'>One</span><span
        lang=en-FI><o:p></o:p></span></p>

        <p class=MsoListParagraphCxSpMiddle style='text-indent:-36.0pt;mso-text-indent-alt:
        -18.0pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span lang=en-FI
        style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span
        style='mso-list:Ignore'><span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span>ii.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span></span></span><![endif]><span lang=EN-US style='mso-ansi-language:EN-US'>Two</span><span
        lang=en-FI><o:p></o:p></span></p>

        <p class=MsoListParagraphCxSpMiddle style='text-indent:-36.0pt;mso-text-indent-alt:
        -18.0pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span lang=en-FI
        style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span
        style='mso-list:Ignore'><span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;
        </span>iii.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span></span></span><![endif]><span lang=EN-US style='mso-ansi-language:EN-US'>Three</span><span
        lang=en-FI><o:p></o:p></span></p>

        <p class=MsoListParagraphCxSpMiddle style='text-indent:-36.0pt;mso-text-indent-alt:
        -18.0pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span lang=en-FI
        style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span
        style='mso-list:Ignore'><span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;
        </span>iv.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span></span></span><![endif]><span lang=EN-US style='mso-ansi-language:EN-US'>Four</span><span
        lang=en-FI><o:p></o:p></span></p>

        <p class=MsoListParagraphCxSpMiddle style='text-indent:-36.0pt;mso-text-indent-alt:
        -18.0pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span lang=en-FI
        style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span
        style='mso-list:Ignore'><span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span>v.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span></span></span><![endif]><span lang=EN-US style='mso-ansi-language:EN-US'>Five</span><span
        lang=en-FI><o:p></o:p></span></p>

        <p class=MsoListParagraphCxSpMiddle style='text-indent:-36.0pt;mso-text-indent-alt:
        -18.0pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span lang=en-FI
        style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span
        style='mso-list:Ignore'><span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;
        </span>vi.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span></span></span><![endif]><span lang=EN-US style='mso-ansi-language:EN-US'>Six</span><span
        lang=en-FI><o:p></o:p></span></p>

        <p class=MsoListParagraphCxSpMiddle style='text-indent:-36.0pt;mso-text-indent-alt:
        -18.0pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span lang=en-FI
        style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span
        style='mso-list:Ignore'><span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;
        </span>vii.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span></span></span><![endif]><span lang=EN-US style='mso-ansi-language:EN-US'>Seven</span><span
        lang=en-FI><o:p></o:p></span></p>

        <p class=MsoListParagraphCxSpMiddle style='text-indent:-36.0pt;mso-text-indent-alt:
        -18.0pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span lang=en-FI
        style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span
        style='mso-list:Ignore'><span style='font:7.0pt "Times New Roman"'>&nbsp; </span>viii.<span
        style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span></span></span><![endif]><span lang=EN-US style='mso-ansi-language:EN-US'>Eight</span><span
        lang=en-FI><o:p></o:p></span></p>

        <p class=MsoListParagraphCxSpMiddle style='text-indent:-36.0pt;mso-text-indent-alt:
        -18.0pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span lang=en-FI
        style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span
        style='mso-list:Ignore'><span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span>ix.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span></span></span><![endif]><span lang=EN-US style='mso-ansi-language:EN-US'>Nine</span><span
        lang=en-FI><o:p></o:p></span></p>

        <p class=MsoListParagraphCxSpLast style='text-indent:-36.0pt;mso-text-indent-alt:
        -18.0pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span lang=en-FI
        style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span
        style='mso-list:Ignore'><span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span>x.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span></span></span><![endif]><span lang=EN-US style='mso-ansi-language:EN-US'>Ten</span><span
        lang=en-FI><o:p></o:p></span></p>`
    });

    TinyAssertions.assertContent(editor, '<ol><li>One</li><li>Two</li><li>Three</li><li>Four</li><li>Five</li><li>Six</li><li>Seven</li><li>Eight</li><li>Nine</li><li>Ten</li></ol>');
  });

  it('TBA: Paste Word fake list before BR', () => {
    const editor = hook.editor();
    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    editor.execCommand('mceInsertContent', false, '<br>a');

    TinySelections.setCursor(editor, [ 0 ], 0);
    editor.execCommand('mceInsertClipboardContent', false, { content: Strings.wordList1 });

    TinyAssertions.assertContent(editor, '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li><li>Item 6</li></ul><p><br />a</p>');
  });

  it('TBA: Paste Word fake lists interrupted by header', () => {
    const editor = hook.editor();
    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('mceInsertClipboardContent', false, { content: `<p class=MsoListParagraphCxSpFirst style='text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family: Symbol'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>List before heading A<o:p></o:p></p>  <p class=MsoListParagraphCxSpLast style='text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family: Symbol'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>List before heading B<o:p></o:p></p>  <h1>heading<o:p></o:p></h1>  <p class=MsoListParagraphCxSpFirst style='text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family: Symbol'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>List after heading A<o:p></o:p></p>  <p class=MsoListParagraphCxSpLast style='text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family: Symbol'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>List after heading B<o:p></o:p></p>` });
    TinyAssertions.assertContent(editor, '<ul><li>List before heading A</li><li>List before heading B</li></ul><h1>heading</h1><ul><li>List after heading A</li><li>List after heading B</li></ul>');
  });

  it('TBA: Paste list like paragraph and list', () => {
    const editor = hook.editor();
    editor.execCommand('mceInsertClipboardContent', false, {
      content: `<p class=MsoNormal><span style='font-size:10.0pt;line-height:115%;font-family:"Trebuchet MS","sans-serif";color:#666666'>ABC. X<o:p></o:p></span></p><p class=MsoListParagraph style='text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='mso-fareast-font-family:Calibri;mso-fareast-theme-font:minor-latin;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><![endif]>Y</p>`
    });

    TinyAssertions.assertContent(editor, '<p>ABC. X</p><ol><li>Y</li></ol>');
  });

  it('TBA: Paste list like paragraph and list (disabled)', () => {
    const editor = hook.editor();
    editor.settings.paste_convert_word_fake_lists = false;

    editor.execCommand('mceInsertClipboardContent', false, {
      content: `<p class=MsoNormal><span style='font-size:10.0pt;line-height:115%;font-family:"Trebuchet MS","sans-serif";color:#666666'>ABC. X<o:p></o:p></span></p><p class=MsoListParagraph style='text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='mso-fareast-font-family:Calibri;mso-fareast-theme-font:minor-latin;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><![endif]>Y</p>`
    });

    delete editor.settings.paste_convert_word_fake_lists;

    TinyAssertions.assertContent(editor, '<p>ABC. X</p><p>1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Y</p>');
  });

  it('TBA: Paste Word table', () => {
    const editor = hook.editor();
    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('mceInsertClipboardContent', false, { content: Strings.table });
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td width="307"><p>Cell 1</p></td><td width="307"><p>Cell 2</p></td></tr><tr><td width="307"><p>Cell 3</p></td><td width="307"><p>Cell 4</p></td></tr></tbody></table><p>&nbsp;</p>');
  });

  it('TBA: Paste Office 365', () => {
    const editor = hook.editor();
    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('mceInsertClipboardContent', false, { content: '<div class="OutlineElement Ltr SCX195156559">Test</div>' });
    TinyAssertions.assertContent(editor, '<p>Test</p>');
  });

  it('TBA: Paste Google Docs 1', () => {
    const editor = hook.editor();
    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('mceInsertClipboardContent', false, { content: '<span id="docs-internal-guid-94e46f1a-1c88-b42b-d502-1d19da30dde7"></span><p dir="ltr>Test</p>' });
    TinyAssertions.assertContent(editor, '<p>Test</p>');
  });

  it('TBA: Paste Google Docs 2', () => {
    const editor = hook.editor();
    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);

    editor.execCommand('mceInsertClipboardContent', false, {
      content: (
        '<meta charset="utf-8">' +
        '<b style="font-weight:normal;" id="docs-internal-guid-adeb6845-fec6-72e6-6831-5e3ce002727c">' +
        '<p dir="ltr">a</p>' +
        '<p dir="ltr">b</p>' +
        '<p dir="ltr">c</p>' +
        '</b>' +
        '<br class="Apple-interchange-newline">'
      )
    });
    TinyAssertions.assertContent(editor, '<p>a</p><p>b</p><p>c</p>');
  });

  it('TBA: Paste Word without mso markings', () => {
    const editor = hook.editor();
    editor.execCommand('mceInsertClipboardContent', false, {
      content: (
        '<font face="Times New Roman" size="3"></font>' +
        '<p style="margin: 0in 0in 10pt;">' +
        `<span style='line-height: 115%; font-family: "Comic Sans MS"; font-size: 22pt;'>Comic Sans MS</span>` +
        '</p>' +
        '<font face="Times New Roman" size="3"></font>'
      )
    });

    TinyAssertions.assertContent(editor, (
      '<p>Comic Sans MS</p>'
    ));
  });

  it('TBA: Paste Word links', () => {
    const editor = hook.editor();
    editor.execCommand('mceInsertClipboardContent', false, {
      content: (
        '<p class="MsoNormal">' +
        '<a href="file:///C:/somelocation/filename.doc#_Toc238571849">1</a>' +
        '<a href="#_Toc238571849">2</a>' +
        '<a name="Toc238571849">3</a>' +
        '<a name="_Toc238571849">4</a>' +
        '<a href="#_ftn238571849" name="_ftnref238571849">[5]</a>' +
        '<a href="#_ftnref238571849" name="_ftn238571849">[5]</a>' +
        '<a href="#_edn238571849" name="_ednref238571849">[6]</a>' +
        '<a href="#_ednref238571849" name="_edn238571849">[7]</a>' +
        '<a href="http://domain.tinymce.com/someurl">8</a>' +
        '<a name="#unknown">9</a>' +
        '<a href="http://domain.tinymce.com/someurl" name="named_link">named_link</a>' +
        '<a>5</a>' +
        '</p>'
      )
    });

    TinyAssertions.assertContent(editor, (
      '<p>' +
      '<a href="#_Toc238571849">1</a>' +
      '<a href="#_Toc238571849">2</a>' +
      '<a name="Toc238571849"></a>3' +
      '<a name="_Toc238571849"></a>4' +
      '<a href="#_ftn238571849" name="_ftnref238571849">[5]</a>' +
      '<a href="#_ftnref238571849" name="_ftn238571849">[5]</a>' +
      '<a href="#_edn238571849" name="_ednref238571849">[6]</a>' +
      '<a href="#_ednref238571849" name="_edn238571849">[7]</a>' +
      '<a href="http://domain.tinymce.com/someurl">8</a>' +
      '9' +
      'named_link' +
      '5' +
      '</p>'
    ));
  });

  it('TBA: Paste Word retain styles', () => {
    const editor = hook.editor();
    editor.settings.paste_retain_style_properties = 'color,background-color,font-family';

    // Test color
    editor.setContent('');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertClipboardContent', false, { content: '<p class="MsoNormal" style="color: #ff0000">Test</p>' });
    TinyAssertions.assertContent(editor, '<p style="color: #ff0000;">Test</p>');

    // Test background-color
    editor.setContent('');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertClipboardContent', false, { content: '<p class="MsoNormal" style="background-color: #ff0000">Test</p>' });
    TinyAssertions.assertContent(editor, '<p style="background-color: #ff0000;">Test</p>');
  });

  it('TBA: Paste Word retain bold/italic styles to elements', () => {
    const editor = hook.editor();
    editor.settings.paste_retain_style_properties = 'color';

    editor.execCommand('mceInsertClipboardContent', false, {
      content: (
        '<p class="MsoNormal">' +
        '<span style="font-weight: bold">bold</span>' +
        '<span style="font-style: italic">italic</span>' +
        '<span style="font-weight: bold; font-style: italic">bold + italic</span>' +
        '<span style="font-weight: bold; color: red">bold + color</span>' +
        '</p>'
      )
    });

    TinyAssertions.assertContent(editor, '<p><strong>bold</strong><em>italic</em><strong><em>bold + italic</em></strong><strong><span style="color: red;">bold + color</span></strong></p>');
  });

  it('TBA: paste track changes comment', () => {
    const editor = hook.editor();
    editor.execCommand('mceInsertClipboardContent', false, {
      content: (
        '<p class="MsoNormal">1</p>' +
        '<div style="mso-element: comment;">2</div>' +
        '<span class="msoDel">3</span>' +
        '<del>4</del>'
      )
    });

    TinyAssertions.assertContent(editor, '<p>1</p>');
  });

  it('TBA: paste nested (UL) word list', () => {
    const editor = hook.editor();
    editor.execCommand('mceInsertClipboardContent', false, {
      content: (
        `<p class=MsoListParagraphCxSpFirst style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'>` +
        `<![if !supportLists]><span style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol'>` +
        `<span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;` +
        `</span></span></span><![endif]>a</p>` +

        `<p class=MsoListParagraphCxSpMiddle style='margin-left:72.0pt;mso-add-space:auto;text-indent:-18.0pt;mso-list:l0 level2 lfo1'>` +
        `<![if !supportLists]><span style='font-family:"Courier New";mso-fareast-font-family:"Courier New"'>` +
        `<span style='mso-list:Ignore'>o<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;</span></span></span><![endif]>b</p>` +

        `<p class=MsoListParagraphCxSpLast style='margin-left:108.0pt;mso-add-space:auto;text-indent:-18.0pt;mso-list:l0 level3 lfo1'>` +
        `<![if !supportLists]><span style='font-family:Wingdings;mso-fareast-font-family:Wingdings;mso-bidi-font-family:Wingdings'>` +
        `<span style='mso-list:Ignore'>§<span style='font:7.0pt "Times New Roman"'>&nbsp;</span></span></span><![endif]>c 1. x</p>`
      )
    });

    assert.equal(
      editor.getContent(),
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b' +
      '<ul>' +
      '<li>c 1. x</li>' +
      '</ul>' +
      '</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );
  });

  it('TBA: paste nested (OL) word list', () => {
    const editor = hook.editor();
    editor.execCommand('mceInsertClipboardContent', false, {
      content: (
        `<p class=MsoListParagraphCxSpFirst style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'>` +
        `<![if !supportLists]><span style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'>` +
        `<span style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>` +
        `</span></span><![endif]>a</p>` +

        `<p class=MsoListParagraphCxSpMiddle style='margin-left:72.0pt;mso-add-space:auto;text-indent:-18.0pt;mso-list:l0 level2 lfo1'>` +
        `<![if !supportLists]><span style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>a.` +
        `<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><![endif]>b</p>` +

        `<p class=MsoListParagraphCxSpLast style='margin-left:108.0pt;mso-add-space:auto;text-indent:-108.0pt;mso-text-indent-alt:-9.0pt;mso-list:l0 level3 lfo1'>` +
        `<![if !supportLists]><span style='mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>` +
        `<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;` +
        `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;` +
        `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;` +
        `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>i.<span style='font:7.0pt "Times New Roman"'>` +
        `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><![endif]>c</p>`
      )
    });

    assert.equal(
      editor.getContent(),
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b' +
      '<ol>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );
  });

  it('TBA: Paste list start index', () => {
    const editor = hook.editor();
    editor.settings.paste_merge_formats = true;

    editor.execCommand('mceInsertClipboardContent', false, {
      content: (
        '<p class=MsoListParagraphCxSpMiddle style="text-indent:-18.0pt;mso-list:l0 level1 lfo1">' +
        '<![if !supportLists]><span style="mso-fareast-font-family:Calibri;mso-fareast-theme-font:minor-latin;' +
        'mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin"><span style="mso-list:Ignore">10.' +
        '<span style="font:7.0pt Times>&nbsp;&nbsp;</span></span></span><![endif]>J<o:p></o:p></p>'
      )
    });
    TinyAssertions.assertContent(editor, '<ol start="10"><li>J</li></ol>');
  });

  it('TBA: Paste paste_merge_formats: true', () => {
    const editor = hook.editor();
    editor.settings.paste_merge_formats = true;
    editor.setContent('<p><strong>a</strong></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);

    editor.execCommand('mceInsertClipboardContent', false, { content: '<em><strong>b</strong></em>' });
    TinyAssertions.assertContent(editor, '<p><strong>a<em>b</em></strong></p>');
  });

  it('TBA: Paste paste_merge_formats: false', () => {
    const editor = hook.editor();
    editor.settings.paste_merge_formats = false;
    editor.setContent('<p><strong>a</strong></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);

    editor.execCommand('mceInsertClipboardContent', false, { content: '<em><strong>b</strong></em>' });
    TinyAssertions.assertContent(editor, '<p><strong>a<em><strong>b</strong></em></strong></p>');
  });

  it('TBA: Paste word DIV as P', () => {
    const editor = hook.editor();
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertClipboardContent', false, { content: '<p class="MsoNormal">1</p><div>2</div>' });
    TinyAssertions.assertContent(editor, '<p>1</p><p>2</p>');
  });

  it('TBA: Disable default filters', () => {
    const editor = hook.editor();
    editor.settings.paste_enable_default_filters = false;

    // Test color
    editor.execCommand('SelectAll');

    editor.execCommand('mceInsertClipboardContent', false, { content: '<p class="MsoNormal" style="color: #ff0000;">Test</p>' });
    TinyAssertions.assertContent(editor, '<p class="MsoNormal" style="color: #ff0000;">Test</p>');
  });

  it('TBA: paste invalid content with spans on page', () => {
    const editor = hook.editor();
    const startingContent = '<p>123 testing <span id="x">span later in document</span></p>';
    const insertedContent = '<ul><li>u</li><li>l</li></ul>';
    editor.setContent(startingContent);
    TinySelections.setCursor(editor, [ 0, 0 ], 0);

    editor.execCommand('mceInsertClipboardContent', false, { content: insertedContent });
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
    TinyAssertions.assertContent(editor, '<p>ta<br />b<br />c&nbsp;xt</p>');
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
    TinyAssertions.assertContent(editor, '<p>t</p><p>a<br />&lt;b&gt;b&lt;/b&gt;</p><p>c</p><p>xt</p>');
  });

  it('TBA: paste data image with paste_data_images: false', () => {
    const editor = hook.editor();
    editor.execCommand('mceInsertClipboardContent', false, { content: '<img src="data:image/gif;base64,R0lGODlhAQABAPAAAP8REf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==">' });
    TinyAssertions.assertContent(editor, '');

    editor.execCommand('mceInsertClipboardContent', false, { content: '<img alt="alt" src="data:image/gif;base64,R0lGODlhAQABAPAAAP8REf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==">' });
    TinyAssertions.assertContent(editor, '');
  });

  it('TBA: paste data image with paste_data_images: true', () => {
    const editor = hook.editor();
    editor.settings.paste_data_images = true;

    editor.execCommand('mceInsertClipboardContent', false, { content: '<img src="data:image/gif;base64,R0lGODlhAQABAPAAAP8REf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==">' });
    TinyAssertions.assertContent(editor, '<p><img src="data:image/gif;base64,R0lGODlhAQABAPAAAP8REf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" /></p>');
  });

  it('TBA: paste data with script', () => {
    const editor = hook.editor();

    editor.execCommand('mceInsertClipboardContent', false, { content: `<p><img src="non-existent.png" onerror="alert('!')" /></p>` });
    TinyAssertions.assertContent(editor, '<p><img src="non-existent.png" /></p>');
  });

  it('TBA: paste pre process text (event)', () => {
    const editor = hook.editor();
    const callback = (e) => {
      e.content = 'PRE:' + e.content;
    };

    editor.setContent('<p>a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    editor.on('PastePreProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { text: 'b\n2' });
    TinyAssertions.assertContent(editor, '<p>PRE:b<br />2</p>');

    editor.setContent('<p>a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    editor.off('PastePreProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { text: 'c' });
    TinyAssertions.assertContent(editor, '<p>c</p>');
  });

  it('TBA: paste pre process html (event)', () => {
    const editor = hook.editor();
    const callback = (e) => {
      e.content = 'PRE:' + e.content;
    };

    editor.setContent('<p>a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    editor.on('PastePreProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { content: '<em>b</em>' });
    TinyAssertions.assertContent(editor, '<p>PRE:<em>b</em></p>');

    editor.setContent('<p>a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    editor.off('PastePreProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { content: '<em>c</em>' });
    TinyAssertions.assertContent(editor, '<p><em>c</em></p>');
  });

  it('TBA: paste post process (event)', () => {
    const editor = hook.editor();
    const callback = (e) => {
      e.node.innerHTML += ':POST';
    };

    editor.setContent('<p>a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    editor.on('PastePostProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { content: '<em>b</em>' });
    TinyAssertions.assertContent(editor, '<p><em>b</em>:POST</p>');

    editor.setContent('<p>a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    editor.off('PastePostProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { content: '<em>c</em>' });
    TinyAssertions.assertContent(editor, '<p><em>c</em></p>');
  });

  it('TBA: paste innerText of conditional comments', () => {
    assert.equal(Utils.innerText('<![if !supportLists]>X<![endif]>'), 'X');
  });

  it('TBA: paste innerText of single P', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    assert.equal(Utils.innerText(editor.getBody().innerHTML), 'a');
  });

  it('TBA: paste innerText of single P with whitespace wrapped content', () => {
    const editor = hook.editor();
    editor.setContent('<p>   a   </p>');
    assert.equal(Utils.innerText(editor.getBody().innerHTML), 'a');
  });

  it('TBA: paste innerText of two P', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    assert.equal(Utils.innerText(editor.getBody().innerHTML), 'a\n\nb');
  });

  it('TBA: paste innerText of H1 and P', () => {
    const editor = hook.editor();
    editor.setContent('<h1>a</h1><p>b</p>');
    assert.equal(Utils.innerText(editor.getBody().innerHTML), 'a\nb');
  });

  it('TBA: paste innerText of P with BR', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<br>b</p>');
    assert.equal(Utils.innerText(editor.getBody().innerHTML), 'a\nb');
  });

  it('TBA: paste innerText of P with WBR', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<wbr>b</p>');
    assert.equal(Utils.innerText(editor.getBody().innerHTML), 'ab');
  });

  it('TBA: paste innerText of P with VIDEO', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<video>b<br>c</video>d</p>');
    assert.equal(Utils.innerText(editor.getBody().innerHTML), 'a d');
  });

  it('TBA: paste innerText of PRE', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre>a\nb\n</pre>';
    assert.equal(Utils.innerText(editor.getBody().innerHTML).replace(/\r\n/g, '\n'), 'a\nb\n');
  });

  it('TBA: paste innerText of textnode with whitespace', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre> a </pre>';
    assert.equal(Utils.innerText((editor.getBody().firstChild as HTMLElement).innerHTML), ' a ');
  });

  it('TBA: trim html from clipboard fragments', () => {
    assert.equal(Utils.trimHtml('<!--StartFragment-->a<!--EndFragment-->'), 'a');
    assert.equal(Utils.trimHtml('a\n<body>\n<!--StartFragment-->\nb\n<!--EndFragment-->\n</body>\nc'), '\nb\n');
    assert.equal(Utils.trimHtml('a<!--StartFragment-->b<!--EndFragment-->c'), 'abc');
    assert.equal(Utils.trimHtml('a<body>b</body>c'), 'b');
    assert.equal(Utils.trimHtml('<HTML><HEAD><TITLE>a</TITLE></HEAD><BODY>b</BODY></HTML>'), 'b');
    assert.equal(Utils.trimHtml('a<span class="Apple-converted-space">\u00a0<\/span>b'), 'a b');
    assert.equal(Utils.trimHtml('<span class="Apple-converted-space">\u00a0<\/span>b'), ' b');
    assert.equal(Utils.trimHtml('a<span class="Apple-converted-space">\u00a0<\/span>'), 'a ');
    assert.equal(Utils.trimHtml('<span class="Apple-converted-space">\u00a0<\/span>'), ' ');
  });

  context('IE only', () => {
    before(function () {
      if (!Env.ie) {
        this.skip();
      }
    });

    it('TBA: Paste part of list from IE', () => {
      const editor = hook.editor();
      editor.execCommand('SelectAll');
      editor.execCommand('mceInsertClipboardContent', false, { content: '<li>item2</li><li>item3</li>' });
      assert.equal(trimContent(editor.getContent()), '<ul><li>item2</li><li>item3</li></ul>', 'List tags are inferred when pasting LI');
    });

    it('TBA: paste font and u in anchor', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);

      editor.execCommand('mceInsertClipboardContent', false, {
        content: '<p><a href="#"><font size="3"><u>b</u></font></a></p>'
      });
      TinyAssertions.assertContent(editor, '<p>a</p><p><a href="#">b</a></p>');
    });
  });

  context('paste_webkit_styles', () => {
    before(function () {
      if (!Env.webkit) {
        this.skip();
      }
    });

    it('TBA: paste webkit retains text styles runtime styles internal', () => {
      const editor = hook.editor();
      editor.settings.paste_webkit_styles = 'color';
      editor.execCommand('mceInsertClipboardContent', false, { content: '&lt;span style="color:red"&gt;&lt;span data-mce-style="color:red"&gt;' });
      TinyAssertions.assertContent(editor, '<p>&lt;span style="color:red"&gt;&lt;span data-mce-style="color:red"&gt;</p>');
    });

    it('TBA: paste webkit remove runtime styles internal', () => {
      const editor = hook.editor();
      editor.settings.paste_webkit_styles = 'color';
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="color:red; font-size: 42px" data-mce-style="color: red;">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span style="color: red;">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles (color)', () => {
      const editor = hook.editor();
      editor.settings.paste_webkit_styles = 'color';
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="color:red; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span style="color: red;">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles keep before attr', () => {
      const editor = hook.editor();
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span class="c" style="color:red; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span class="c">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles keep after attr', () => {
      const editor = hook.editor();
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="color:red; text-indent: 10px" title="t">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span title="t">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles keep before/after attr', () => {
      const editor = hook.editor();
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span class="c" style="color:red; text-indent: 10px" title="t">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span class="c" title="t">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles (background-color)', () => {
      const editor = hook.editor();
      editor.settings.paste_webkit_styles = 'background-color';
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="background-color:red; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span style="background-color: red;">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles (font-size)', () => {
      const editor = hook.editor();
      editor.settings.paste_webkit_styles = 'font-size';
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="font-size:42px; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span style="font-size: 42px;">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles (font-family)', () => {
      const editor = hook.editor();
      editor.settings.paste_webkit_styles = 'font-family';
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="font-family:Arial; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span style="font-family: Arial;">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles font-family allowed but not specified', () => {
      const editor = hook.editor();
      editor.settings.paste_webkit_styles = 'font-family';
      editor.execCommand('mceInsertClipboardContent', false, { content: '<p title="x" style="text-indent: 10px">Test</p>' });
      TinyAssertions.assertContent(editor, '<p title="x">Test</p>');
    });

    it('TBA: paste webkit remove runtime styles (custom styles)', () => {
      const editor = hook.editor();
      editor.settings.paste_webkit_styles = 'color font-style';
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="color: red; font-style: italic; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span style="color: red; font-style: italic;">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles (all)', () => {
      const editor = hook.editor();
      editor.settings.paste_webkit_styles = 'all';
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="color: red; font-style: italic; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p><span style=\"color: red; font-style: italic; text-indent: 10px;\">Test</span></p>');
    });

    it('TBA: paste webkit remove runtime styles (none)', () => {
      const editor = hook.editor();
      editor.settings.paste_webkit_styles = 'none';
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="color: red; font-style: italic; text-indent: 10px">Test</span>' });
      TinyAssertions.assertContent(editor, '<p>Test</p>');
    });

    it('TBA: paste webkit remove runtime styles (color) in the same (color) (named)', () => {
      const editor = hook.editor();
      editor.settings.paste_webkit_styles = 'color';

      editor.setContent('<p style="color:red">Test</span>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);

      editor.execCommand('mceInsertClipboardContent', false, {
        content: (
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
        content: (
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
        content: (
          '<span style="color:red; text-indent: 10px">a</span>' +
          '<span style="color:#ff0000; text-indent: 10px">b</span>' +
          '<span style="color:rgb(255, 0, 0); text-indent: 10px">c</span>'
        )
      });

      TinyAssertions.assertContent(editor, '<p style="color: #ff0000;">abc</p>');
    });
  });
});
