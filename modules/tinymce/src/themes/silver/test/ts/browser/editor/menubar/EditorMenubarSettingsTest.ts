import { ApproxStructure, Assertions } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { McEditor } from '@ephox/mcagar';
import { SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

import { countNumber, extractOnlyOne } from '../../../module/UiUtils';

describe('browser.tinymce.themes.silver.editor.menubar.EditorMenubarSettingsTest', () => {
  before(() => {
    Theme();
  });

  const pCreateEditorWithMenubar = (menubar: boolean | string | undefined) => McEditor.pFromSettings<Editor>({
    menubar,
    toolbar: false,
    statusbar: false,
    base_url: '/project/tinymce/js/tinymce'
  });

  const assertIsDefaultMenubar = (menubar: SugarElement<HTMLElement>) => Assertions.assertStructure(
    'Checking structure of tox-menubar is "default"',
    ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('tox-menubar') ],
      children: Arr.map([ 'File', 'Edit', 'View', 'Format' ], (x) =>
        s.element('button', {
          children: [
            s.element('span', {
              html: str.is(x)
            }),
            // chevron
            s.element('div', {})
          ]
        })
      )
    })),
    menubar
  );

  it('TBA: false should not create a menubar at all', async () => {
    const editor = await pCreateEditorWithMenubar(false);
    const numMenubars = countNumber(SugarBody.body(), '.tox-menubar');
    assert.equal(numMenubars, 0, 'Should be no menubars');
    McEditor.remove(editor);
  });

  it('TBA: true should create default menubar', async () => {
    const editor = await pCreateEditorWithMenubar(true);
    const menubar = extractOnlyOne(SugarBody.body(), '.tox-menubar');
    assertIsDefaultMenubar(menubar);
    McEditor.remove(editor);
  });

  it('TBA: undefined should create default menubar', async () => {
    const editor = await pCreateEditorWithMenubar(undefined);
    const menubar = extractOnlyOne(SugarBody.body(), '.tox-menubar');
    assertIsDefaultMenubar(menubar);
    McEditor.remove(editor);
  });

  it('TBA: "file edit" should create "file edit" menubar', async () => {
    const editor = await pCreateEditorWithMenubar('file edit');
    const menubar = extractOnlyOne(SugarBody.body(), '.tox-menubar');
    Assertions.assertStructure(
      'Checking menubar should have just file and edit',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-menubar') ],
        children: [
          s.element('button', { }),
          s.element('button', { })
        ]
      })),
      menubar
    );
    McEditor.remove(editor);
  });
});
