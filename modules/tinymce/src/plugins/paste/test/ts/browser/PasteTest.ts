import { Log, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import * as Utils from 'tinymce/plugins/paste/core/Utils';
import Plugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Strings from '../module/test/Strings';

UnitTest.asynctest('browser.tinymce.plugins.paste.PasteTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Plugin();
  Theme();

  /* eslint-disable max-len */

  const sTeardown = (editor: Editor) => {
    return Logger.t('Delete settings', Step.sync(() => {
      delete editor.settings.paste_remove_styles_if_webkit;
      delete editor.settings.paste_retain_style_properties;
      delete editor.settings.paste_enable_default_filters;
      delete editor.settings.paste_data_images;
      delete editor.settings.paste_webkit_styles;
    }));
  };

  const appendTeardown = (editor: Editor, steps: Step<any, any>[]) => {
    return Arr.bind(steps, (step) => {
      return [ step, sTeardown(editor) ];
    });
  };

  const trimContent = (content: string) => {
    return content.replace(/^<p>&nbsp;<\/p>\n?/, '').replace(/\n?<p>&nbsp;<\/p>$/, '');
  };

  suite.test('TestCase-TBA: Paste: Plain text toggle event', (editor) => {
    const events = [];

    editor.on('PastePlainTextToggle', (e) => {
      events.push({ state: e.state });
    });

    editor.execCommand('mceTogglePlainTextPaste');
    LegacyUnit.deepEqual(events, [
      { state: true }
    ], 'Should be enabled');

    editor.execCommand('mceTogglePlainTextPaste');
    LegacyUnit.deepEqual(events, [
      { state: true },
      { state: false }
    ], 'Should be disabled');

    editor.execCommand('mceTogglePlainTextPaste');
    LegacyUnit.deepEqual(events, [
      { state: true },
      { state: false },
      { state: true }
    ], 'Should be enabled again');
  });

  suite.test('TestCase-TBA: Paste: Paste simple text content', (editor) => {
    const rng = editor.dom.createRng();

    editor.setContent('<p>1234</p>');
    editor.focus();
    rng.setStart(editor.getBody().firstChild.firstChild, 1);
    rng.setEnd(editor.getBody().firstChild.firstChild, 3);
    editor.selection.setRng(rng);

    editor.execCommand('mceInsertClipboardContent', false, { content: 'TEST' });
    LegacyUnit.equal(editor.getContent(), '<p>1TEST4</p>');
  });

  suite.test('TestCase-TBA: Paste: Paste text with meta and nbsp', (editor) => {
    const rng = editor.dom.createRng();

    editor.setContent('<p>1&nbsp;</p>');
    editor.focus();
    rng.setStart(editor.getBody().firstChild.firstChild, 2);
    rng.setEnd(editor.getBody().firstChild.firstChild, 2);
    editor.selection.setRng(rng);

    editor.execCommand('mceInsertClipboardContent', false, { content: '<meta charset="utf-8">TEST' });
    LegacyUnit.equal(editor.getContent(), '<p>1 TEST</p>');
  });

  suite.test('TestCase-TBA: Paste: Paste styled text content', (editor) => {
    const rng = editor.dom.createRng();

    editor.settings.paste_remove_styles_if_webkit = false;

    editor.setContent('<p>1234</p>');
    rng.setStart(editor.getBody().firstChild.firstChild, 1);
    rng.setEnd(editor.getBody().firstChild.firstChild, 3);
    editor.selection.setRng(rng);

    editor.execCommand('mceInsertClipboardContent', false, { content: '<strong><em><span style="color: red;">TEST</span></em></strong>' });
    LegacyUnit.equal(editor.getContent(), '<p>1<strong><em><span style="color: red;">TEST</span></em></strong>4</p>');
  });

  suite.test('TestCase-TBA: Paste: Paste paragraph in paragraph', (editor) => {
    const rng = editor.dom.createRng();

    editor.setContent('<p>1234</p>');
    rng.setStart(editor.getBody().firstChild.firstChild, 1);
    rng.setEnd(editor.getBody().firstChild.firstChild, 3);
    editor.selection.setRng(rng);

    editor.execCommand('mceInsertClipboardContent', false, { content: '<p>TEST</p>' });
    LegacyUnit.equal(editor.getContent(), '<p>1</p><p>TEST</p><p>4</p>');
  });

  suite.test('TestCase-TBA: Paste: Paste paragraphs in complex paragraph', (editor) => {
    const rng = editor.dom.createRng();

    editor.setContent('<p><strong><em>1234</em></strong></p>');
    rng.setStart(editor.dom.select('em,i')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('em,i')[0].firstChild, 3);
    editor.selection.setRng(rng);

    editor.execCommand('mceInsertClipboardContent', false, { content: '<p>TEST 1</p><p>TEST 2</p>' });
    LegacyUnit.equal(editor.getContent(), '<p><strong><em>1</em></strong></p><p>TEST 1</p><p>TEST 2</p><p><strong><em>4</em></strong></p>');
  });

  suite.test('TestCase-TBA: Paste: Paste Word fake list', (editor) => {
    let rng = editor.dom.createRng();

    editor.setContent('<p>1234</p>');
    rng.setStart(editor.getBody().firstChild.firstChild, 0);
    rng.setEnd(editor.getBody().firstChild.firstChild, 4);
    editor.selection.setRng(rng);

    editor.execCommand('mceInsertClipboardContent', false, { content: Strings.wordList2 });
    LegacyUnit.equal(editor.getContent(), '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li><li>Item 6</li></ul>');

    editor.settings.paste_retain_style_properties = 'border';

    rng = editor.dom.createRng();
    editor.setContent('<p>1234</p>');
    rng.setStart(editor.getBody().firstChild.firstChild, 0);
    rng.setEnd(editor.getBody().firstChild.firstChild, 4);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertClipboardContent', false, { content: '<p class="ListStyle" style="margin-top:0cm;margin-right:0cm;margin-bottom:3.0pt;margin-left:18.0pt;mso-add-space:auto;text-align:justify;text-indent:-18.0pt;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><span lang="DE" style="font-family:Verdana;mso-fareast-font-family:Verdana;mso-bidi-font-family:Verdana;color:black"><span style="mso-list:Ignore">\u25CF<span style="font:7.0pt &quot;Times New Roman&quot;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><span lang="DE" style="font-family:Arial;mso-fareast-font-family:Arial;mso-bidi-font-family:Arial;color:black">Item&nbsp; Spaces.<o:p></o:p></span></p>' });
    LegacyUnit.equal(editor.getContent(), '<ul><li>Item&nbsp; Spaces.</li></ul>');

    rng = editor.dom.createRng();
    editor.setContent('<p>1234</p>');
    rng.setStart(editor.getBody().firstChild.firstChild, 0);
    rng.setEnd(editor.getBody().firstChild.firstChild, 4);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertClipboardContent', false, { content: '<p class="ListStyle" style="margin-left:36.0pt;mso-add-space:auto;text-indent:-18.0pt;mso-list:l0 level1 lfo1;tab-stops:list 36.0pt"><span lang="EN-US" style="color:black;mso-ansi-language:EN-US"><span style="mso-list:Ignore">1.<span style="font:7.0pt &quot;Times New Roman&quot;">&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><span lang="EN-US" style="font-family:Arial;mso-fareast-font-family:Arial;mso-bidi-font-family:Arial;color:black;mso-ansi-language:EN-US">Version 7.0</span><span lang="EN-US" style="font-family:Arial;mso-fareast-font-family:Arial;mso-bidi-font-family:Arial;color:black;mso-ansi-language:EN-US">:<o:p></o:p></span></p>' });
    LegacyUnit.equal(editor.getContent(), '<ol><li>Version 7.0:</li></ol>');
  });

  suite.test('TestCase-TBA: Paste: Paste Word fake list of ten items with roman numerals', (editor) => {
    editor.setContent('');

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

    LegacyUnit.equal(editor.getContent(), '<ol><li>One</li><li>Two</li><li>Three</li><li>Four</li><li>Five</li><li>Six</li><li>Seven</li><li>Eight</li><li>Nine</li><li>Ten</li></ol>');
  });

  suite.test('TestCase-TBA: Paste: Paste Word fake list before BR', (editor) => {
    let rng = editor.dom.createRng();

    editor.setContent('<p>1234</p>');
    rng.setStart(editor.getBody().firstChild.firstChild, 0);
    rng.setEnd(editor.getBody().firstChild.firstChild, 4);
    editor.selection.setRng(rng);

    editor.execCommand('mceInsertContent', false, '<br>a');

    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 0);
    rng.setEnd(editor.getBody().firstChild, 0);
    editor.selection.setRng(rng);

    editor.execCommand('mceInsertClipboardContent', false, { content: Strings.wordList1 });

    LegacyUnit.equal(editor.getContent(), '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li><li>Item 6</li></ul><p><br />a</p>');
  });

  suite.test('TestCase-TBA: Paste: Paste Word fake lists interrupted by header', (editor) => {
    const rng = editor.dom.createRng();

    editor.setContent('<p>1234</p>');
    rng.setStart(editor.getBody().firstChild.firstChild, 0);
    rng.setEnd(editor.getBody().firstChild.firstChild, 4);
    editor.selection.setRng(rng);

    editor.execCommand('mceInsertClipboardContent', false, { content: `<p class=MsoListParagraphCxSpFirst style='text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family: Symbol'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>List before heading A<o:p></o:p></p>  <p class=MsoListParagraphCxSpLast style='text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family: Symbol'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>List before heading B<o:p></o:p></p>  <h1>heading<o:p></o:p></h1>  <p class=MsoListParagraphCxSpFirst style='text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family: Symbol'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>List after heading A<o:p></o:p></p>  <p class=MsoListParagraphCxSpLast style='text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family: Symbol'><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]>List after heading B<o:p></o:p></p>` });
    LegacyUnit.equal(editor.getContent(), '<ul><li>List before heading A</li><li>List before heading B</li></ul><h1>heading</h1><ul><li>List after heading A</li><li>List after heading B</li></ul>');
  });

  suite.test('TestCase-TBA: Paste: Paste list like paragraph and list', (editor) => {
    editor.setContent('');

    editor.execCommand('mceInsertClipboardContent', false, {
      content: `<p class=MsoNormal><span style='font-size:10.0pt;line-height:115%;font-family:"Trebuchet MS","sans-serif";color:#666666'>ABC. X<o:p></o:p></span></p><p class=MsoListParagraph style='text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='mso-fareast-font-family:Calibri;mso-fareast-theme-font:minor-latin;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><![endif]>Y</p>`
    });

    LegacyUnit.equal(editor.getContent(), '<p>ABC. X</p><ol><li>Y</li></ol>');
  });

  suite.test('TestCase-TBA: Paste: Paste list like paragraph and list (disabled)', (editor) => {
    editor.setContent('');

    editor.settings.paste_convert_word_fake_lists = false;

    editor.execCommand('mceInsertClipboardContent', false, {
      content: `<p class=MsoNormal><span style='font-size:10.0pt;line-height:115%;font-family:"Trebuchet MS","sans-serif";color:#666666'>ABC. X<o:p></o:p></span></p><p class=MsoListParagraph style='text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='mso-fareast-font-family:Calibri;mso-fareast-theme-font:minor-latin;mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin'><span style='mso-list:Ignore'>1.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></span><![endif]>Y</p>`
    });

    delete editor.settings.paste_convert_word_fake_lists;

    LegacyUnit.equal(editor.getContent(), '<p>ABC. X</p><p>1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Y</p>');
  });

  suite.test('TestCase-TBA: Paste: Paste Word table', (editor) => {
    const rng = editor.dom.createRng();

    editor.setContent('<p>1234</p>');
    rng.setStart(editor.getBody().firstChild.firstChild, 0);
    rng.setEnd(editor.getBody().firstChild.firstChild, 4);
    editor.selection.setRng(rng);

    editor.execCommand('mceInsertClipboardContent', false, { content: Strings.table });
    LegacyUnit.equal(editor.getContent(), '<table><tbody><tr><td width="307"><p>Cell 1</p></td><td width="307"><p>Cell 2</p></td></tr><tr><td width="307"><p>Cell 3</p></td><td width="307"><p>Cell 4</p></td></tr></tbody></table><p>&nbsp;</p>');
  });

  suite.test('TestCase-TBA: Paste: Paste Office 365', (editor) => {
    const rng = editor.dom.createRng();

    editor.setContent('<p>1234</p>');
    rng.setStart(editor.getBody().firstChild.firstChild, 0);
    rng.setEnd(editor.getBody().firstChild.firstChild, 4);
    editor.selection.setRng(rng);

    editor.execCommand('mceInsertClipboardContent', false, { content: '<div class="OutlineElement Ltr SCX195156559">Test</div>' });
    LegacyUnit.equal(editor.getContent(), '<p>Test</p>');
  });

  suite.test('TestCase-TBA: Paste: Paste Google Docs 1', (editor) => {
    const rng = editor.dom.createRng();

    editor.setContent('<p>1234</p>');
    rng.setStart(editor.getBody().firstChild.firstChild, 0);
    rng.setEnd(editor.getBody().firstChild.firstChild, 4);
    editor.selection.setRng(rng);

    editor.execCommand('mceInsertClipboardContent', false, { content: '<span id="docs-internal-guid-94e46f1a-1c88-b42b-d502-1d19da30dde7"></span><p dir="ltr>Test</p>' });
    LegacyUnit.equal(editor.getContent(), '<p>Test</p>');
  });

  suite.test('TestCase-TBA: Paste: Paste Google Docs 2', (editor) => {
    const rng = editor.dom.createRng();

    editor.setContent('<p>1234</p>');
    rng.setStart(editor.getBody().firstChild.firstChild, 0);
    rng.setEnd(editor.getBody().firstChild.firstChild, 4);
    editor.selection.setRng(rng);

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
    LegacyUnit.equal(editor.getContent(), '<p>a</p><p>b</p><p>c</p>');
  });

  suite.test('TestCase-TBA: Paste: Paste Word without mso markings', (editor) => {
    editor.setContent('');
    editor.execCommand('mceInsertClipboardContent', false, {
      content: (
        '<font face="Times New Roman" size="3"></font>' +
        '<p style="margin: 0in 0in 10pt;">' +
        `<span style='line-height: 115%; font-family: "Comic Sans MS"; font-size: 22pt;'>Comic Sans MS</span>` +
        '</p>' +
        '<font face="Times New Roman" size="3"></font>'
      )
    });

    LegacyUnit.equal(editor.getContent(), (
      '<p>Comic Sans MS</p>'
    ));
  });

  suite.test('TestCase-TBA: Paste: Paste Word links', (editor) => {
    editor.setContent('');
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

    LegacyUnit.equal(editor.getContent(), (
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

  suite.test('TestCase-TBA: Paste: Paste Word retain styles', (editor) => {
    editor.settings.paste_retain_style_properties = 'color,background-color,font-family';

    // Test color
    editor.setContent('');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertClipboardContent', false, { content: '<p class="MsoNormal" style="color: #ff0000">Test</p>' });
    LegacyUnit.equal(editor.getContent(), '<p style="color: #ff0000;">Test</p>');

    // Test background-color
    editor.setContent('');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertClipboardContent', false, { content: '<p class="MsoNormal" style="background-color: #ff0000">Test</p>' });
    LegacyUnit.equal(editor.getContent(), '<p style="background-color: #ff0000;">Test</p>');
  });

  suite.test('TestCase-TBA: Paste: Paste Word retain bold/italic styles to elements', (editor) => {
    editor.settings.paste_retain_style_properties = 'color';

    editor.setContent('');

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

    LegacyUnit.equal(editor.getContent(), '<p><strong>bold</strong><em>italic</em><strong><em>bold + italic</em></strong><strong><span style="color: red;">bold + color</span></strong></p>');
  });

  suite.test('TestCase-TBA: Paste: paste track changes comment', (editor) => {
    editor.setContent('');

    editor.execCommand('mceInsertClipboardContent', false, {
      content: (
        '<p class="MsoNormal">1</p>' +
        '<div style="mso-element: comment;">2</div>' +
        '<span class="msoDel">3</span>' +
        '<del>4</del>'
      )
    });

    LegacyUnit.equal(editor.getContent(), '<p>1</p>');
  });

  suite.test('TestCase-TBA: Paste: paste nested (UL) word list', (editor) => {
    editor.setContent('');

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

    LegacyUnit.equal(
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

  suite.test('TestCase-TBA: Paste: paste nested (OL) word list', (editor) => {
    editor.setContent('');

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

    LegacyUnit.equal(
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

  suite.test('TestCase-TBA: Paste: Paste list start index', (editor) => {
    editor.settings.paste_merge_formats = true;

    editor.setContent('');

    editor.execCommand('mceInsertClipboardContent', false, {
      content: (
        '<p class=MsoListParagraphCxSpMiddle style="text-indent:-18.0pt;mso-list:l0 level1 lfo1">' +
        '<![if !supportLists]><span style="mso-fareast-font-family:Calibri;mso-fareast-theme-font:minor-latin;' +
        'mso-bidi-font-family:Calibri;mso-bidi-theme-font:minor-latin"><span style="mso-list:Ignore">10.' +
        '<span style="font:7.0pt Times>&nbsp;&nbsp;</span></span></span><![endif]>J<o:p></o:p></p>'
      )
    });
    LegacyUnit.equal(editor.getContent(), '<ol start="10"><li>J</li></ol>');
  });

  suite.test('TestCase-TBA: Paste: Paste paste_merge_formats: true', (editor) => {
    editor.settings.paste_merge_formats = true;

    editor.setContent('<p><strong>a</strong></p>');
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('mceInsertClipboardContent', false, { content: '<em><strong>b</strong></em>' });
    LegacyUnit.equal(editor.getContent(), '<p><strong>a<em>b</em></strong></p>');
  });

  suite.test('TestCase-TBA: Paste: Paste paste_merge_formats: false', (editor) => {
    editor.settings.paste_merge_formats = false;

    editor.setContent('<p><strong>a</strong></p>');
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('mceInsertClipboardContent', false, { content: '<em><strong>b</strong></em>' });
    LegacyUnit.equal(editor.getContent(), '<p><strong>a<em><strong>b</strong></em></strong></p>');
  });

  suite.test('TestCase-TBA: Paste: Paste word DIV as P', (editor) => {
    editor.setContent('');
    editor.execCommand('SelectAll');
    editor.execCommand('mceInsertClipboardContent', false, { content: '<p class="MsoNormal">1</p><div>2</div>' });
    LegacyUnit.equal(editor.getContent(), '<p>1</p><p>2</p>');
  });

  if (Env.ie) {
    suite.test('TestCase-TBA: Paste: Paste part of list from IE', (editor) => {
      editor.setContent('');
      editor.execCommand('SelectAll');
      editor.execCommand('mceInsertClipboardContent', false, { content: '<li>item2</li><li>item3</li>' });
      LegacyUnit.equal(trimContent(editor.getContent()), '<ul><li>item2</li><li>item3</li></ul>', 'List tags are inferred when pasting LI');
    });
  }

  suite.test('TestCase-TBA: Paste: Disable default filters', (editor) => {
    editor.settings.paste_enable_default_filters = false;

    // Test color
    editor.setContent('');
    editor.execCommand('SelectAll');

    editor.execCommand('mceInsertClipboardContent', false, { content: '<p class="MsoNormal" style="color: #ff0000;">Test</p>' });
    LegacyUnit.equal(editor.getContent(), '<p class="MsoNormal" style="color: #ff0000;">Test</p>');
  });

  suite.test('TestCase-TBA: Paste: paste invalid content with spans on page', (editor) => {
    const startingContent = '<p>123 testing <span id="x">span later in document</span></p>',
      insertedContent = '<ul><li>u</li><li>l</li></ul>';
    editor.setContent(startingContent);
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 0);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertClipboardContent', false, { content: insertedContent });

    LegacyUnit.equal(editor.getContent(), insertedContent + startingContent);
  });

  suite.test('TestCase-TBA: Paste: paste plain text with space', (editor) => {
    editor.setContent('<p>text</p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertClipboardContent', false, { text: ' a ' });

    LegacyUnit.equal(editor.getContent(), '<p>t&nbsp;a&nbsp;xt</p>');
  });

  suite.test('TestCase-TBA: Paste: paste plain text with linefeeds', (editor) => {
    editor.setContent('<p>text</p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertClipboardContent', false, { text: 'a\nb\nc ' });

    LegacyUnit.equal(editor.getContent(), '<p>ta<br />b<br />c&nbsp;xt</p>');
  });

  suite.test('TestCase-TBA: Paste: paste plain text with double linefeeds', (editor) => {
    editor.setContent('<p>text</p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertClipboardContent', false, { text: 'a\n\nb\n\nc' });

    LegacyUnit.equal(editor.getContent(), '<p>t</p><p>a</p><p>b</p><p>c</p><p>xt</p>');
  });

  suite.test('TestCase-TBA: Paste: paste plain text with entities', (editor) => {
    editor.setContent('<p>text</p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertClipboardContent', false, { text: '< & >' });

    LegacyUnit.equal(editor.getContent(), '<p>t&lt; &amp; &gt;xt</p>');
  });

  suite.test('TestCase-TBA: Paste: paste plain text with paragraphs', (editor) => {
    editor.setContent('<p>text</p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertClipboardContent', false, { text: 'a\n<b>b</b>\n\nc' });

    LegacyUnit.equal(editor.getContent(), '<p>t</p><p>a<br />&lt;b&gt;b&lt;/b&gt;</p><p>c</p><p>xt</p>');
  });

  suite.test('TestCase-TBA: Paste: paste data image with paste_data_images: false', (editor) => {
    editor.setContent('');

    editor.execCommand('mceInsertClipboardContent', false, { content: '<img src="data:image/gif;base64,R0lGODlhAQABAPAAAP8REf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==">' });
    LegacyUnit.equal(editor.getContent(), '');

    editor.execCommand('mceInsertClipboardContent', false, { content: '<img alt="alt" src="data:image/gif;base64,R0lGODlhAQABAPAAAP8REf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==">' });
    LegacyUnit.equal(editor.getContent(), '');
  });

  suite.test('TestCase-TBA: Paste: paste data image with paste_data_images: true', (editor) => {
    editor.settings.paste_data_images = true;

    editor.setContent('');
    editor.execCommand('mceInsertClipboardContent', false, { content: '<img src="data:image/gif;base64,R0lGODlhAQABAPAAAP8REf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==">' });

    LegacyUnit.equal(editor.getContent(), '<p><img src="data:image/gif;base64,R0lGODlhAQABAPAAAP8REf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" /></p>');
  });

  suite.test('TestCase-TBA: Paste: paste data with script', (editor) => {
    editor.setContent('');
    editor.execCommand('mceInsertClipboardContent', false, { content: `<p><img src="non-existent.png" onerror="alert('!')" /></p>` });

    LegacyUnit.equal(editor.getContent(), '<p><img src="non-existent.png" /></p>');
  });

  suite.test('TestCase-TBA: Paste: paste pre process text (event)', (editor) => {
    const callback = (e) => {
      e.content = 'PRE:' + e.content;
    };

    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    editor.on('PastePreProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { text: 'b\n2' });
    LegacyUnit.equal(editor.getContent(), '<p>PRE:b<br />2</p>');

    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    editor.off('PastePreProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { text: 'c' });
    LegacyUnit.equal(editor.getContent(), '<p>c</p>');
  });

  suite.test('TestCase-TBA: Paste: paste pre process html (event)', (editor) => {
    const callback = (e) => {
      e.content = 'PRE:' + e.content;
    };

    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    editor.on('PastePreProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { content: '<em>b</em>' });
    LegacyUnit.equal(editor.getContent(), '<p>PRE:<em>b</em></p>');

    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    editor.off('PastePreProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { content: '<em>c</em>' });
    LegacyUnit.equal(editor.getContent(), '<p><em>c</em></p>');
  });

  suite.test('TestCase-TBA: Paste: paste post process (event)', (editor) => {
    const callback = (e) => {
      e.node.innerHTML += ':POST';
    };

    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    editor.on('PastePostProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { content: '<em>b</em>' });
    LegacyUnit.equal(editor.getContent(), '<p><em>b</em>:POST</p>');

    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    editor.off('PastePostProcess', callback);
    editor.execCommand('mceInsertClipboardContent', false, { content: '<em>c</em>' });
    LegacyUnit.equal(editor.getContent(), '<p><em>c</em></p>');
  });

  suite.test('TestCase-TBA: Paste: paste innerText of conditional comments', () => {
    LegacyUnit.equal(Utils.innerText('<![if !supportLists]>X<![endif]>'), 'X');
  });

  suite.test('TestCase-TBA: Paste: paste innerText of single P', (editor) => {
    editor.setContent('<p>a</p>');
    LegacyUnit.equal(Utils.innerText(editor.getBody().innerHTML), 'a');
  });

  suite.test('TestCase-TBA: Paste: paste innerText of single P with whitespace wrapped content', (editor) => {
    editor.setContent('<p>   a   </p>');
    LegacyUnit.equal(Utils.innerText(editor.getBody().innerHTML), 'a');
  });

  suite.test('TestCase-TBA: Paste: paste innerText of two P', (editor) => {
    editor.setContent('<p>a</p><p>b</p>');
    LegacyUnit.equal(Utils.innerText(editor.getBody().innerHTML), 'a\n\nb');
  });

  suite.test('TestCase-TBA: Paste: paste innerText of H1 and P', (editor) => {
    editor.setContent('<h1>a</h1><p>b</p>');
    LegacyUnit.equal(Utils.innerText(editor.getBody().innerHTML), 'a\nb');
  });

  suite.test('TestCase-TBA: Paste: paste innerText of P with BR', (editor) => {
    editor.setContent('<p>a<br>b</p>');
    LegacyUnit.equal(Utils.innerText(editor.getBody().innerHTML), 'a\nb');
  });

  suite.test('TestCase-TBA: Paste: paste innerText of P with WBR', (editor) => {
    editor.setContent('<p>a<wbr>b</p>');
    LegacyUnit.equal(Utils.innerText(editor.getBody().innerHTML), 'ab');
  });

  suite.test('TestCase-TBA: Paste: paste innerText of P with VIDEO', (editor) => {
    editor.setContent('<p>a<video>b<br>c</video>d</p>');
    LegacyUnit.equal(Utils.innerText(editor.getBody().innerHTML), 'a d');
  });

  suite.test('TestCase-TBA: Paste: paste innerText of PRE', (editor) => {
    editor.getBody().innerHTML = '<pre>a\nb\n</pre>';
    LegacyUnit.equal(Utils.innerText(editor.getBody().innerHTML).replace(/\r\n/g, '\n'), 'a\nb\n');
  });

  suite.test('TestCase-TBA: Paste: paste innerText of textnode with whitespace', (editor) => {
    editor.getBody().innerHTML = '<pre> a </pre>';
    LegacyUnit.equal(Utils.innerText((editor.getBody().firstChild as HTMLElement).innerHTML), ' a ');
  });

  suite.test('TestCase-TBA: Paste: trim html from clipboard fragments', () => {
    LegacyUnit.equal(Utils.trimHtml('<!--StartFragment-->a<!--EndFragment-->'), 'a');
    LegacyUnit.equal(Utils.trimHtml('a\n<body>\n<!--StartFragment-->\nb\n<!--EndFragment-->\n</body>\nc'), '\nb\n');
    LegacyUnit.equal(Utils.trimHtml('a<!--StartFragment-->b<!--EndFragment-->c'), 'abc');
    LegacyUnit.equal(Utils.trimHtml('a<body>b</body>c'), 'b');
    LegacyUnit.equal(Utils.trimHtml('<HTML><HEAD><TITLE>a</TITLE></HEAD><BODY>b</BODY></HTML>'), 'b');
    LegacyUnit.equal(Utils.trimHtml('a<span class="Apple-converted-space">\u00a0<\/span>b'), 'a b');
    LegacyUnit.equal(Utils.trimHtml('<span class="Apple-converted-space">\u00a0<\/span>b'), ' b');
    LegacyUnit.equal(Utils.trimHtml('a<span class="Apple-converted-space">\u00a0<\/span>'), 'a ');
    LegacyUnit.equal(Utils.trimHtml('<span class="Apple-converted-space">\u00a0<\/span>'), ' ');
  });

  if (Env.ie) {
    suite.test('TestCase-TBA: Paste: paste font and u in anchor', (editor) => {
      editor.setContent('<p>a</p>');
      LegacyUnit.setSelection(editor, 'p', 1);

      editor.execCommand('mceInsertClipboardContent', false, {
        content: '<p><a href="#"><font size="3"><u>b</u></font></a></p>'
      });

      LegacyUnit.equal(editor.getContent(), '<p>a</p><p><a href="#">b</a></p>');
    });
  }

  if (Env.webkit) {
    suite.test('TestCase-TBA: Paste: paste webkit retains text styles runtime styles internal', (editor) => {
      editor.settings.paste_webkit_styles = 'color';
      editor.setContent('');
      editor.execCommand('mceInsertClipboardContent', false, { content: '&lt;span style="color:red"&gt;&lt;span data-mce-style="color:red"&gt;' });
      LegacyUnit.equal(editor.getContent(), '<p>&lt;span style="color:red"&gt;&lt;span data-mce-style="color:red"&gt;</p>');
    });

    suite.test('TestCase-TBA: Paste: paste webkit remove runtime styles internal', (editor) => {
      editor.settings.paste_webkit_styles = 'color';
      editor.setContent('');
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="color:red; font-size: 42px" data-mce-style="color: red;">Test</span>' });
      LegacyUnit.equal(editor.getContent(), '<p><span style="color: red;">Test</span></p>');
    });

    suite.test('TestCase-TBA: Paste: paste webkit remove runtime styles (color)', (editor) => {
      editor.settings.paste_webkit_styles = 'color';
      editor.setContent('');
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="color:red; text-indent: 10px">Test</span>' });
      LegacyUnit.equal(editor.getContent(), '<p><span style="color: red;">Test</span></p>');
    });

    suite.test('TestCase-TBA: Paste: paste webkit remove runtime styles keep before attr', (editor) => {
      editor.setContent('');
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span class="c" style="color:red; text-indent: 10px">Test</span>' });
      LegacyUnit.equal(editor.getContent(), '<p><span class="c">Test</span></p>');
    });

    suite.test('TestCase-TBA: Paste: paste webkit remove runtime styles keep after attr', (editor) => {
      editor.setContent('');
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="color:red; text-indent: 10px" title="t">Test</span>' });
      LegacyUnit.equal(editor.getContent(), '<p><span title="t">Test</span></p>');
    });

    suite.test('TestCase-TBA: Paste: paste webkit remove runtime styles keep before/after attr', (editor) => {
      editor.setContent('');
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span class="c" style="color:red; text-indent: 10px" title="t">Test</span>' });
      LegacyUnit.equal(editor.getContent(), '<p><span class="c" title="t">Test</span></p>');
    });

    suite.test('TestCase-TBA: Paste: paste webkit remove runtime styles (background-color)', (editor) => {
      editor.settings.paste_webkit_styles = 'background-color';
      editor.setContent('');
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="background-color:red; text-indent: 10px">Test</span>' });
      LegacyUnit.equal(editor.getContent(), '<p><span style="background-color: red;">Test</span></p>');
    });

    suite.test('TestCase-TBA: Paste: paste webkit remove runtime styles (font-size)', (editor) => {
      editor.settings.paste_webkit_styles = 'font-size';
      editor.setContent('');
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="font-size:42px; text-indent: 10px">Test</span>' });
      LegacyUnit.equal(editor.getContent(), '<p><span style="font-size: 42px;">Test</span></p>');
    });

    suite.test('TestCase-TBA: Paste: paste webkit remove runtime styles (font-family)', (editor) => {
      editor.settings.paste_webkit_styles = 'font-family';
      editor.setContent('');
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="font-family:Arial; text-indent: 10px">Test</span>' });
      LegacyUnit.equal(editor.getContent(), '<p><span style="font-family: Arial;">Test</span></p>');
    });

    suite.test('TestCase-TBA: Paste: paste webkit remove runtime styles font-family allowed but not specified', (editor) => {
      editor.settings.paste_webkit_styles = 'font-family';
      editor.setContent('');
      editor.execCommand('mceInsertClipboardContent', false, { content: '<p title="x" style="text-indent: 10px">Test</p>' });
      LegacyUnit.equal(editor.getContent(), '<p title="x">Test</p>');
    });

    suite.test('TestCase-TBA: Paste: paste webkit remove runtime styles (custom styles)', (editor) => {
      editor.settings.paste_webkit_styles = 'color font-style';
      editor.setContent('');
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="color: red; font-style: italic; text-indent: 10px">Test</span>' });
      LegacyUnit.equal(editor.getContent(), '<p><span style="color: red; font-style: italic;">Test</span></p>');
    });

    suite.test('TestCase-TBA: Paste: paste webkit remove runtime styles (all)', (editor) => {
      editor.settings.paste_webkit_styles = 'all';
      editor.setContent('');
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="color: red; font-style: italic; text-indent: 10px">Test</span>' });
      LegacyUnit.equal(editor.getContent(), '<p><span style=\"color: red; font-style: italic; text-indent: 10px;\">Test</span></p>');
    });

    suite.test('TestCase-TBA: Paste: paste webkit remove runtime styles (none)', (editor) => {
      editor.settings.paste_webkit_styles = 'none';
      editor.setContent('');
      editor.execCommand('mceInsertClipboardContent', false, { content: '<span style="color: red; font-style: italic; text-indent: 10px">Test</span>' });
      LegacyUnit.equal(editor.getContent(), '<p>Test</p>');
    });

    suite.test('TestCase-TBA: Paste: paste webkit remove runtime styles (color) in the same (color) (named)', (editor) => {
      editor.settings.paste_webkit_styles = 'color';

      editor.setContent('<p style="color:red">Test</span>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);

      editor.execCommand('mceInsertClipboardContent', false, {
        content: (
          '<span style="color:#ff0000; text-indent: 10px">a</span>' +
          '<span style="color:rgb(255, 0, 0); text-indent: 10px">b</span>'
        )
      });

      LegacyUnit.equal(editor.getContent(), '<p style="color: red;">ab</p>');
    });

    suite.test('TestCase-TBA: Paste: paste webkit remove runtime styles (color) in the same (color) (hex)', (editor) => {
      editor.setContent('<p style="color:#ff0000">Test</span>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);

      editor.execCommand('mceInsertClipboardContent', false, {
        content: (
          '<span style="color:red; text-indent: 10px">a</span>' +
          '<span style="color:#ff0000; text-indent: 10px">b</span>' +
          '<span style="color:rgb(255, 0, 0); text-indent: 10px">c</span>'
        )
      });

      LegacyUnit.equal(editor.getContent(), '<p style="color: #ff0000;">abc</p>');
    });

    suite.test('TestCase-TBA: Paste: paste webkit remove runtime styles (color) in the same (color) (rgb)', (editor) => {
      editor.setContent('<p style="color:rgb(255, 0, 0)">Test</span>');
      LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);

      editor.execCommand('mceInsertClipboardContent', false, {
        content: (
          '<span style="color:red; text-indent: 10px">a</span>' +
          '<span style="color:#ff0000; text-indent: 10px">b</span>' +
          '<span style="color:rgb(255, 0, 0); text-indent: 10px">c</span>'
        )
      });

      LegacyUnit.equal(editor.getContent(), '<p style="color: #ff0000;">abc</p>');
    });
  }

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    Pipeline.async({}, appendTeardown(editor, Log.steps('TBA', 'Paste: Paste sanity tests', suite.toSteps(editor))), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    indent: false,
    plugins: 'paste',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
