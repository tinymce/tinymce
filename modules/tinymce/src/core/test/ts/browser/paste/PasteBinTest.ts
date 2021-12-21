import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
import { PasteBin } from 'tinymce/core/paste/PasteBin';

interface TestCase {
  readonly label: string;
  readonly content: string;
  readonly result: string;
}

describe('browser.tinymce.core.paste.PasteBin', () => {
  const cases: TestCase[] = [
    {
      label: 'TINY-1162: testing nested paste bins',
      content:
      '<div id="mcepastebin" contenteditable="true" data-mce-bogus="all" ' +
      'data-mce-style="position: absolute; top: 0.40000057220458984px;' +
      'width: 10px; height: 10px; overflow: hidden; opacity: 0" ' +
      'style="position: absolute; top: 0.40000057220458984px;' +
      'width: 10px; height: 10px; overflow: hidden; opacity: 0">' +
      '<div id="mcepastebin" data-mce-bogus="all" ' +
      'data-mce-style="position: absolute; top: 0.40000057220458984px;' +
      'width: 10px; height: 10px; overflow: hidden; opacity: 0" ' +
      'style="position: absolute; top: 0.40000057220458984px;' +
      'width: 10px; height: 10px; overflow: hidden; opacity: 0">a</div>' +
      '<div id="mcepastebin" data-mce-bogus="all" ' +
      'data-mce-style="position: absolute; top: 0.40000057220458984px;' +
      'width: 10px; height: 10px; overflow: hidden; opacity: 0" ' +
      'style="position: absolute; top: 0.40000057220458984px;' +
      'width: 10px; height: 10px; overflow: hidden; opacity: 0">b</div>' +
      '</div>',
      result: '<div>a</div><div>b</div>'
    },
    {
      label: 'TINY-1162: testing adjacent paste bins',
      content:
      '<div id="mcepastebin" contenteditable="true" data-mce-bogus="all" ' +
      'data-mce-style="position: absolute; top: 0.40000057220458984px;' +
      'width: 10px; height: 10px; overflow: hidden; opacity: 0" ' +
      'style="position: absolute; top: 0.40000057220458984px;' +
      'width: 10px; height: 10px; overflow: hidden; opacity: 0">' +
      '<p>a</p><p>b</p></div>' +
      '<div id="mcepastebin" contenteditable="true" data-mce-bogus="all" ' +
      'data-mce-style="position: absolute; top: 0.40000057220458984px;' +
      'width: 10px; height: 10px; overflow: hidden; opacity: 0" ' +
      'style="position: absolute; top: 0.40000057220458984px;' +
      'width: 10px; height: 10px; overflow: hidden; opacity: 0">' +
      '<p>c</p>' +
      '</div>',
      result: '<p>a</p><p>b</p><p>c</p>'
    }
  ];

  const pCreateEditorFromSettings = (settings: RawEditorOptions = {}, html?: string) =>
    McEditor.pFromHtml<Editor>(html, {
      ...settings,
      add_unload_trigger: false,
      indent: false,
      base_url: '/project/tinymce/js/tinymce'
    });

  const pCreateEditorFromHtml = (html: string, settings: RawEditorOptions) =>
    pCreateEditorFromSettings(settings, html);

  const assertCases = (editor: Editor, cases: TestCase[]) => {
    const pasteBin = PasteBin(editor);
    Arr.each(cases, (c) => {
      editor.getBody().appendChild(editor.dom.createFragment(c.content));
      assert.equal(pasteBin.getHtml(), c.result, c.label);
      pasteBin.remove();
    });
  };

  it('TBA: Create editor from settings and test nested and adjacent paste bins', async () => {
    const editor = await pCreateEditorFromSettings();
    assertCases(editor, cases);
    McEditor.remove(editor);
  });

  // TINY-1208/TINY-1209: same cases, but for inline editor
  it('TBA: Create editor from html and test nested and adjacent paste bins', async () => {
    const editor = await pCreateEditorFromHtml('<div>some text</div>', { inline: true });
    assertCases(editor, cases);
    McEditor.remove(editor);
  });
});
