import { RealClipboard, RealMouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyApis, TinyAssertions, TinyHooks, TinyUi } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

const hook = TinyHooks.bddSetup<Editor>({
  base_url: '/project/tinymce/js/tinymce',
  toolbar: false,
  statusbar: false
}, []);

type Selection = [ number[], number, number[], number ];

const copyAndPast = async (editor: Editor, source: Selection, target: Selection): Promise<void> => {
  const ui = TinyUi(editor);
  const api = TinyApis(editor);

  api.setSelection(...source);
  ui.clickOnMenu('button:contains("Edit")');
  await ui.pWaitForUi('*[role="menu"]');
  await RealMouse.pClickOn('div[title="Copy"]');
  api.setSelection(...target);
  await RealClipboard.pPaste('iframe => body');
};

describe('webdriver.tinymce.core.paste.CopyAndPasteTest', () => {
  it('TINY-7719: Wrapped elements are preserved in copy and paste (pre + headings)', async () => {
    const editor = hook.editor();

    const testBlockTags = async (tagName) => {
      editor.setContent(
        `<${tagName}>abc</${tagName}>` +
        '<p>other kind of tag</p>' +
        `<${tagName}>same tag</${tagName}>`
      );
      await copyAndPast(
        editor,
        [[ 0, 0 ], 0, [ 0, 0 ], 3 ],
        [[ 2, 0 ], 1, [ 2, 0 ], 3 ]
      );
      await copyAndPast(
        editor,
        [[ 0, 0 ], 0, [ 0, 0 ], 3 ],
        [[ 1, 0 ], 1, [ 1, 0 ], 4 ]
      );
      TinyAssertions.assertContent(editor,
        `<${tagName}>abc</${tagName}>\n` +
        '<p>o</p>\n' +
        `<${tagName}>abc</${tagName}>\n` +
        '<p>r kind of tag</p>\n' +
        `<${tagName}>s</${tagName}>\n` +
        `<${tagName}>abc</${tagName}>\n` +
        `<${tagName}>e tag</${tagName}>`
      );
    };

    for (const tagName of [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ]) {
      await testBlockTags(tagName);
    }

    const testPreTag = async (tagName) => {
      editor.setContent(
        `<${tagName}>abc</${tagName}>` +
        '<p>other kind of tag</p>' +
        `<${tagName}>same tag</${tagName}>`
      );
      await copyAndPast(
        editor,
        [[ 0, 0 ], 0, [ 0, 0 ], 3 ],
        [[ 2, 0 ], 1, [ 2, 0 ], 3 ]
      );
      await copyAndPast(
        editor,
        [[ 0, 0 ], 0, [ 0, 0 ], 3 ],
        [[ 1, 0 ], 1, [ 1, 0 ], 4 ]
      );
      TinyAssertions.assertContent(editor,
        `<${tagName}>abc</${tagName}>\n` +
        '<p>o</p>\n' +
        `<${tagName}>abc</${tagName}>\n` +
        '<p>r kind of tag</p>\n' +
        `<${tagName}>sabce tag</${tagName}>`
      );
    };

    for (const tagName of [ 'pre' ]) {
      await testPreTag(tagName);
    }
  });

  it('TINY-7719: Wrapped elements are preserved in copy and paste (inline elements)', async () => {
    const editor = hook.editor();

    const testInlineTags = async (tagName) => {
      editor.setContent(
        `<p><${tagName} class="someclass">abc</${tagName}></p>` +
        '<h1>something</h1>' +
        '<p>abc def</p>'
      );
      await copyAndPast(
        editor,
        [[ 0, 0, 0 ], 0, [ 0, 0, 0 ], 3 ],
        [[ 1, 0 ], 1, [ 1, 0 ], 4 ]
      );
      TinyAssertions.assertContent(editor,
        `<p><${tagName} class="someclass">abc</${tagName}></p>\n` +
        `<h1>s<${tagName} class="someclass">abc</${tagName}>thing</h1>\n` +
        '<p>abc def</p>'
      );
    };

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
