import { ApproxStructure, Assertions, Chain, Logger, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Cell } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('OxideBlockedDialogTest', (success, failure) => {

  Theme();
  const testDialogApi = Cell({} as any);

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      Pipeline.async({ }, Logger.ts(
        'Check structure of font format',
        [
          Mouse.sClickOn(Body.body(), '.tox-toolbar button'),
          UiFinder.sWaitForVisible('Waiting for dialog', Body.body(), '[role="dialog"]'),
          Mouse.sClickOn(Body.body(), 'button:contains("Make Busy")'),
          Waiter.sTryUntil(
            'Waiting for busy structure to match expected',
            Chain.asStep(Body.body(), [
              UiFinder.cFindIn('[role="dialog"]'),
              Assertions.cAssertStructure(
                'Checking dialog structure to see where "busy" is',
                ApproxStructure.build((s, str, arr) => {
                  return s.element('div', {
                    classes: [ arr.has('tox-dialog') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-dialog__header') ]
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-dialog__content-js') ]
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-dialog__footer') ]
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-dialog__busy-spinner') ],
                        children: [
                          s.element('div', {
                            classes: [ arr.has('tox-spinner') ],
                            children: [
                              // The three loading dots
                              s.element('div', { }),
                              s.element('div', { }),
                              s.element('div', { })
                            ]
                          })
                        ]
                      })
                    ]
                  });
                })
              )
            ]),
            100,
            3000
          ),
          Step.sync(() => {
            testDialogApi.get().unblock();
          }),
          Waiter.sTryUntil(
            'Waiting for busy structure to go away',
            Chain.asStep(Body.body(), [
              UiFinder.cFindIn('[role="dialog"]'),
              Assertions.cAssertStructure(
                'Checking dialog structure to see where "busy" is',
                ApproxStructure.build((s, str, arr) => {
                  return s.element('div', {
                    classes: [ arr.has('tox-dialog') ],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-dialog__header') ]
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-dialog__content-js') ]
                      }),
                      s.element('div', {
                        classes: [ arr.has('tox-dialog__footer') ]
                      })
                    ]
                  });
                })
              )
            ]),
            100,
            3000
          )
        ]
      ), onSuccess, onFailure);
    },
    {
      theme: 'silver',
      menubar: true,
      toolbar: 'dialog-button',
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.ui.registry.addButton('dialog-button', {
          type: 'button',
          text: 'Launch Dialog',
          onAction: () => {
            testDialogApi.set(ed.windowManager.open({
              title: 'Testing Blocking',
              body: {
                type: 'panel',
                items: [
                  {
                    type: 'button',
                    name: 'busy-button',
                    text: 'Make Busy'
                  }
                ]
              },
              buttons: [ ],
              onAction: (dialogApi, actionData) => {
                if (actionData.name === 'busy-button') {
                  dialogApi.block('Dialog is blocked.');
                }
              }
            }));
          }
        });
      }
    },
    () => {
      success();
    },
    failure
  );
});