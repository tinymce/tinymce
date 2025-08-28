import { ApproxStructure, Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.MenuGroupHeadingTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'styles',
    style_formats: [
      { title: 'Bold text', inline: 'b' },
      { title: 'Table styles' },
      { title: 'Table row 1', selector: 'tr', classes: 'tablerow1' }
    ]
  }, []);

  it('TINY-2226: Menu should contain a group heading with the correct classes and text', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, 'button');
    const menu = await TinyUiActions.pWaitForUi(editor, '.tox-menu.tox-collection');
    Assertions.assertStructure(
      'Container structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-menu'), arr.has('tox-collection'), arr.has('tox-collection--list'), arr.has('tox-selected-menu') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-collection__group') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-menu-nav__js'), arr.has('tox-collection__item') ]
              })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-collection__group') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-collection__item'), arr.has('tox-collection__group-heading') ],
                children: [ s.text(str.is('Table styles')) ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-menu-nav__js'), arr.has('tox-collection__item') ]
              })
            ]
          })
        ]
      })),
      menu
    );
  });
});
