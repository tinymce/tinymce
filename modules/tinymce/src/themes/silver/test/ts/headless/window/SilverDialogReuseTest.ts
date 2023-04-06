import { ApproxStructure, Assertions, FocusTools, StructAssert, TestStore, UiFinder } from '@ephox/agar';
import { afterEach, before, describe, it } from '@ephox/bedrock-client';
import { Dialog as BridgeSpec } from '@ephox/bridge';
import { Optional } from '@ephox/katamari';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { assert } from 'chai';

import { Dialog } from 'tinymce/core/api/ui/Ui';
import { WindowManagerImpl } from 'tinymce/core/api/WindowManager';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import * as TestExtras from '../../module/TestExtras';

describe('headless.tinymce.themes.silver.window.SilverDialogReuseTest', () => {
  const store = TestStore();
  const extrasHook = TestExtras.bddSetup();
  let windowManager: WindowManagerImpl;
  let dialogApi: Dialog.DialogInstanceApi<any>;
  before(() => {
    windowManager = WindowManager.setup(extrasHook.access().extras);
  });

  afterEach(() => {
    Optional.from(dialogApi).each((api) => api.close());
  });

  const baseDialogActions = {
    onSubmit: store.adder('onSubmit'),
    onClose: store.adder('onClose'),
    onChange: store.adder('onChange'),
    onAction: store.adder('onAction')
  };

  const baseDialogButtons: BridgeSpec.DialogFooterButtonSpec[] = [
    {
      type: 'custom',
      name: 'barny',
      text: 'Barny Text',
      align: 'start',
      primary: true
    }
  ];

  const assertRedialStructure = (build: ApproxStructure.Builder<StructAssert[]>) => {
    const dialog = UiFinder.findIn(SugarBody.body(), '[role="dialog"]').getOrDie();
    Assertions.assertStructure(
      'Redial should have worked',
      ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          classes: [
            arr.has('tox-dialog')
          ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-dialog__header') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-dialog__title') ],
                  html: str.is('Silver Test Modal Dialog')
                }),
                s.element('button', {
                  attrs: {
                    'aria-label': str.is('Close')
                  }
                })
              ]
            }),
            s.element('div', {
              classes: [ arr.has('tox-dialog__content-js') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-dialog__body') ],
                  children: [
                    s.element('div', {
                      classes: [ arr.has('tox-dialog__body-content') ],
                      children: [
                        s.element('div', {
                          classes: [ arr.has('tox-form') ],
                          children: build(s, str, arr)
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            s.element('div', {
              classes: [ arr.has('tox-dialog__footer') ]
            })
          ]
        });
      }),
      dialog
    );
  };

  const openDialogAndAssertInitialData = () => {
    dialogApi = windowManager.open({
      title: 'Silver Test Modal Dialog',
      body: {
        type: 'panel',
        items: [{
          type: 'input',
          name: 'fred',
          label: 'Freds Input'
        }]
      },
      buttons: baseDialogButtons,
      ...baseDialogActions,
      initialData: {
        fred: 'said hello pebbles'
      }
    }, {}, () => store.adder('closeWindow')());

    assert.deepEqual(dialogApi.getData(), {
      fred: 'said hello pebbles'
    }, 'Initial data');
  };

  const openNestedDialogAndAssertInitialData = () => {
    dialogApi = windowManager.open({
      title: 'Silver Test Modal Dialog',
      body: {
        type: 'panel',
        items: [
          {
            type: 'bar',
            items: [{
              name: 'hello',
              type: 'button',
              text: 'Hello!'
            }]
          },
          {
            type: 'checkbox',
            name: 'check',
            label: 'Check!'
          }
        ]
      },
      buttons: baseDialogButtons,
      ...baseDialogActions,
      initialData: {
        check: true
      }
    }, {}, () => store.adder('closeWindow')());
    dialogApi.focus('check');

    assert.deepEqual(dialogApi.getData(), {
      check: true,
      hello: ''
    }, 'Initial data');
  };

  it('TINY-8334: Open a dialog, assert initial focus, redial with similar data, check focus maintained', async () => {
    openDialogAndAssertInitialData();
    const beforeInput = await FocusTools.pTryOnSelector('Focus should start on the input', SugarDocument.getDocument(), 'input');

    // Tag the element
    (beforeInput.dom as any).GOOSE = 'goose';

    dialogApi.redial({
      title: 'Silver Test Modal Dialog',
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            name: 'fred',
            label: 'Freds Input'
          },
          {
            type: 'input',
            name: 'wilma',
            label: 'Wilmas input'
          }
        ]
      },
      buttons: baseDialogButtons,
      ...baseDialogActions,
      initialData: {
        fred: 'said hello pebbles',
        wilma: 'new things'
      }
    });

    assertRedialStructure((s, str, arr) => [
      s.element('div', {
        classes: [ arr.has('tox-form__group') ],
        children: [
          s.element('label', { children: [ s.text(str.is('Freds Input')) ] }),
          s.element('input', { attrs: { type: str.is('text') }})
        ]
      }),
      s.element('div', {
        classes: [ arr.has('tox-form__group') ],
        children: [
          s.element('label', { children: [ s.text(str.is('Wilmas input')) ] }),
          s.element('input', { attrs: { type: str.is('text') }})
        ]
      }),
    ]);

    const afterInput = await FocusTools.pTryOnSelector('Focus should stay on the input after redial', SugarDocument.getDocument(), 'input');
    assert.equal((afterInput.dom as any).GOOSE, 'goose', 'The fred input should not have been recreated');

    assert.deepEqual(dialogApi.getData(), {
      fred: 'said hello pebbles',
      wilma: 'new things'
    }, 'Initial data');
  });

  it('TINY-8334: Open a dialog with nested spec, redial with a different child spec, check top level items are not re-rendered', async () => {
    openNestedDialogAndAssertInitialData();
    const beforeCheckbox = await FocusTools.pTryOnSelector('Focus should start on the checkbox', SugarDocument.getDocument(), 'input');

    // Tag the element
    (beforeCheckbox.dom as any).GOOSE = 'goose';

    dialogApi.redial({
      title: 'Silver Test Modal Dialog',
      body: {
        type: 'panel',
        items: [
          {
            type: 'bar',
            items: [{
              name: 'slippery',
              type: 'slider',
              label: 'Move me!'
            }]
          },
          {
            type: 'checkbox',
            name: 'check',
            label: 'Check!'
          }
        ]
      },
      buttons: baseDialogButtons,
      ...baseDialogActions,
      initialData: {
        check: false
      }
    });

    assertRedialStructure((s, str, arr) => [
      s.element('div', {
        classes: [ arr.has('tox-bar'), arr.has('tox-form__controls-h-stack') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-slider') ],
            children: [
              s.element('label', { children: [ s.text(str.is('Move me!')) ] }),
              s.element('div', { classes: [ arr.has('tox-slider__rail') ] }),
              s.element('div', { classes: [ arr.has('tox-slider__handle') ] })
            ]
          })
        ]
      }),
      s.element('label', {
        classes: [ arr.has('tox-checkbox') ],
        children: [
          s.element('input', { attrs: { type: str.is('checkbox') }}),
          s.element('div', { classes: [ arr.has('tox-checkbox__icons') ] }),
          s.element('span', { children: [ s.text(str.is('Check!')) ] })
        ]
      }),
    ]);

    const afterCheckbox = await FocusTools.pTryOnSelector('Focus should stay on the checkbox', SugarDocument.getDocument(), 'input');
    assert.equal((afterCheckbox.dom as any).GOOSE, 'goose', 'The checkbox input should not have been recreated');

    assert.deepEqual(dialogApi.getData(), {
      check: false,
      slippery: 0
    }, 'Initial data');
  });

  it('TINY-9679: Open a dialog with a select, which maintain its values through a redial', () => {
    const spec: Dialog.DialogSpec<Dialog.DialogData> = {
      title: 'Silver Test Modal Dialog',
      body: {
        type: 'panel',
        items: [
          {
            type: 'selectbox',
            label: 'label',
            name: 'somename',
            items: [
              {
                text: 'val1',
                value: 'val1'
              },
              {
                text: 'val2',
                value: 'val2'
              },
              {
                text: 'val3',
                value: 'val3'
              }
            ]
          },
        ]
      },
      buttons: baseDialogButtons,
    };

    dialogApi = windowManager.open(spec, {}, () => store.adder('closeWindow')());

    assert.deepEqual(dialogApi.getData(), {
      somename: 'val1',
    }, 'Initial data');

    dialogApi.redial(spec);

    assert.deepEqual(dialogApi.getData(), {
      somename: 'val1',
    }, 'Initial data');
  });
});
