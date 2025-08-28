import { ApproxStructure, Assertions, UiFinder } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';

import { WindowManagerImpl } from 'tinymce/core/api/WindowManager';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import * as TestExtras from '../../module/TestExtras';

describe('headless.tinymce.themes.silver.window.SilverDialogForLabelTest', () => {
  const extrasHook = TestExtras.bddSetup();
  let windowManager: WindowManagerImpl;
  before(() => {
    windowManager = WindowManager.setup(extrasHook.access().extras);
  });

  const openDialog = () => {
    windowManager.open({
      title: 'Silver Dialog Label For Test',
      body: {
        type: 'panel',
        items: [
          {
            type: 'label',
            label: 'This is a label',
            for: 'input-name',
            items: [
              {
                type: 'input',
                name: 'input-name',
              }
            ]
          }
        ]
      }
    }, {}, Fun.noop);
  };

  it('TINY-10971: Label for property should be rendered with the id of provided element.', async () => {
    openDialog();
    Assertions.assertStructure('Check label for and input id attributes',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-form') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-form__group') ],
            children: [
              s.element('label', {
                attrs: {
                  for: str.startsWith('form-field'),
                },
                children: [
                  s.text(str.is('This is a label'))
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-form__group') ],
                children: [
                  s.element('input', {
                    classes: [ arr.has('tox-textfield') ],
                    attrs: {
                      id: str.startsWith('form-field')
                    }
                  })
                ]
              })
            ]
          })
        ]
      })),
      UiFinder.findIn(SugarBody.body(), '.tox-form').getOrDie()
    );
  });
});
