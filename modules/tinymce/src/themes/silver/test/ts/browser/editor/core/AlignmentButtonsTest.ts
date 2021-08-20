import { ApproxStructure, Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

import { extractOnlyOne } from '../../../module/UiUtils';

describe('browser.tinymce.themes.silver.editor.core.AlignmentButtonsTest', () => {
  TinyHooks.bddSetupLight<Editor>({
    toolbar: 'alignleft aligncenter alignright alignjustify alignnone',
    toolbar_mode: 'wrap',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  it('TBA: Toolbar alignment buttons structure', () => {
    const toolbar = extractOnlyOne(SugarBody.body(), '.tox-toolbar');
    Assertions.assertStructure(
      'Checking toolbar should have just alignment buttons',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-toolbar') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-toolbar__group') ],
            children: [
              s.element('button', {
                attrs: { title: str.is('Align left') }
              }),
              s.element('button', {
                attrs: { title: str.is('Align center') }
              }),
              s.element('button', {
                attrs: { title: str.is('Align right') }
              }),
              s.element('button', {
                attrs: { title: str.is('Justify') }
              }),
              s.element('button', {
                attrs: { title: str.is('No alignment') }
              })
            ]
          })
        ]
      })),
      toolbar
    );
  });
});
