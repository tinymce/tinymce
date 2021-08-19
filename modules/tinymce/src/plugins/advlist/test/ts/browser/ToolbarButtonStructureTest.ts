import { ApproxStructure, Assertions, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.advlist.ToolbarButtonStructureTest', () => {
  before(() => {
    AdvListPlugin();
    ListsPlugin();
    Theme();
  });

  Arr.each([
    { label: 'TBA: Test that one list type = toolbar button NOT splitbutton', hasSplitBtn: false, settings: { advlist_number_styles: 'default' }},
    { label: 'TBA: Test that no list type = toolbar button IS splitbutton', hasSplitBtn: true, settings: { }},
  ], (test) => {
    it(test.label, async () => {
      const editor = await McEditor.pFromSettings<Editor>({
        plugins: 'lists advlist',
        toolbar: 'numlist',
        menubar: false,
        statusbar: false,
        base_url: '/project/tinymce/js/tinymce',
        ...test.settings
      });
      const toolbarGroup = UiFinder.findIn(SugarBody.body(), '.tox-editor-header .tox-toolbar .tox-toolbar__group').getOrDie();
      await Waiter.pTryUntil('Wait for toolbar', () => Assertions.assertStructure(
        'Check lists toolbar button structure',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('tox-toolbar__group') ],
          children: [
            s.element(test.hasSplitBtn ? 'div' : 'button', {
              classes: test.hasSplitBtn ?
                [ arr.not('tox-tbtn'), arr.has('tox-split-button') ] :
                [ arr.has('tox-tbtn'), arr.not('tox-split-button') ],
              attrs: {
                title: str.is('Numbered list')
              }
            })
          ]
        })),
        toolbarGroup
      ));
      McEditor.remove(editor);
    });
  });
});
