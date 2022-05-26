import { RealClipboard, RealMouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyApis, TinyAssertions, TinyHooks, TinyUi } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';

const hook = TinyHooks.bddSetup<Editor>({
  base_url: '/project/tinymce/js/tinymce',
  toolbar: false,
  statusbar: false
}, []);

interface Selection {
  startPath: number[];
  soffset: number;
  finishPath: number[];
  foffset: number;
}

const copyAndPast = async (api: TinyApis, ui: TinyUi, source: Selection, target: Selection): Promise<void> => {
  api.setSelection(source.startPath, source.soffset, source.finishPath, source.foffset);
  ui.clickOnMenu('button:contains("Edit")');
  await ui.pWaitForUi('*[role="menu"]');
  await RealMouse.pClickOn('div[title="Copy"]');
  api.setSelection(target.startPath, target.soffset, target.finishPath, target.foffset);
  await RealClipboard.pPaste('iframe => body => h1');
};

describe('webdriver.tinymce.core.paste.CopyAndPaste', () => {
  it('TINY-7719: Test wrapped elements are preserved in copy and paste', async () => {
    const editor = hook.editor();
    const ui = TinyUi(editor);
    const api = TinyApis(editor);

    const testBlockTags = async (tagName) => {
      editor.setContent(
        `<${tagName}>abc</${tagName}>` +
        '<h1>something</h1>' +
        '<p>abc def</p>'
      );
      await copyAndPast(
        api, ui,
        {
          startPath: [ 0, 0 ],
          soffset: 0,
          finishPath: [ 0, 0 ],
          foffset: 3
        },
        {
          startPath: [ 1, 0 ],
          soffset: 0,
          finishPath: [ 1, 0 ],
          foffset: 3
        }
      );
      TinyAssertions.assertContent(editor,
        `<${tagName}>abc</${tagName}>\n` +
        `<${tagName}>abc</${tagName}>\n` +
        '<h1>ething</h1>\n' +
        '<p>abc def</p>'
      );
    };

    const testInlineTags = async (tagName) => {
      editor.setContent(
        `<p><${tagName} class="someclass">abc</${tagName}></p>` +
        '<h1>something</h1>' +
        '<p>abc def</p>'
      );
      await copyAndPast(
        api, ui,
        {
          startPath: [ 0, 0, 0 ],
          soffset: 0,
          finishPath: [ 0, 0, 0 ],
          foffset: 3
        },
        {
          startPath: [ 1, 0 ],
          soffset: 0,
          finishPath: [ 1, 0 ],
          foffset: 3
        }
      );
      TinyAssertions.assertContent(editor,
        `<p><${tagName} class="someclass">abc</${tagName}></p>\n` +
        `<h1><${tagName} class="someclass">abc</${tagName}>ething</h1>\n` +
        '<p>abc def</p>'
      );
    };

    for (const tagName of [ 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ]) {
      await testBlockTags(tagName);
    }

    const inlineElements = [
      'big',
      'small',
      'tt',
      'abbr',
      'acronym',
      'cite',
      'code',
      'dfn',
      'em',
      'kbd',
      'strong',
      'samp',
      'var',
      'a',
      'bdo',
      'map',
      'q',
      'span',
      'sub',
      'sup',
      'button',
      'label'
    ];

    for (const tagName of inlineElements) {
      await testInlineTags(tagName);
    }
  });

});
