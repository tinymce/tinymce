import { ApproxStructure, Assertions, Chain, Mouse, NamedChain, Pipeline, Step, StructAssert, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Body, Element } from '@ephox/sugar';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';
import TestExtras from '../../module/TestExtras';

UnitTest.asynctest('WindowManager:tabbed-dialog Test', (success, failure) => {
  const helpers = TestExtras();
  const windowManager = WindowManager.setup(helpers.extras);

  const cAssertFormContents = (label: string, f: (s, str, arr) => StructAssert) => Chain.op((tabview: Element) => {
    Assertions.assertStructure(
      'Checking tabview: ' + label,
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-dialog__body-content') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-form') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-form__group') ],
                children: [
                  f(s, str, arr)
                ]
              })
            ]
          })
        ]
      })),
      tabview
    );
  });

  NamedChain.direct('tabview', Chain.op((_tabview) => {

  }), '_'),

  Pipeline.async({ }, [
    Step.sync(() => {
      windowManager.open({
        title: 'Custom Dialog',
        body: {
          type: 'tabpanel',
          tabs: [
            {
              title: 'Basic',
              name: 'basic',
              items: [
                {
                  name: 'basic1',
                  type: 'input'
                }
              ]
            },
            {
              title: 'Advanced',
              name: 'advanced',
              items: [
                {
                  name: 'advanced1',
                  type: 'textarea'
                }
              ]
            }
          ]
        },
        buttons: [
          {
            type: 'custom',
            name: 'gotoBasic',
            text: '-> Basic',
            disabled: false
          },
          {
            type: 'custom',
            name: 'gotoAdvanced',
            text: '-> Advanced',
            disabled: false
          },
          {
            type: 'cancel',
            text: 'Cancel'
          },
          {
            type: 'submit',
            text: 'Save'
          }
        ],
        initialData: {
          basic1: 'First tab value',
          advanced1: 'Textarea value'
        },
        onAction: (api, a) => {
          const target = a.name === 'gotoBasic' ? 'basic' : 'advanced';
          api.showTab(target);
        },
        onSubmit: () => {

        }
      }, {}, () => {});
    }),

    Chain.asStep({ }, [
      NamedChain.asChain([
        NamedChain.writeValue('page', Body.body()),
        NamedChain.direct('page', UiFinder.cFindIn('[role="dialog"]'), 'dialog'),
        NamedChain.direct('dialog', UiFinder.cFindIn('[role="tab"]:contains("Basic")'), 'basicTab'),
        NamedChain.direct('dialog', UiFinder.cFindIn('[role="tab"]:contains("Advanced")'), 'advancedTab'),
        NamedChain.direct('dialog', UiFinder.cFindIn('[role="tabpanel"]'), 'tabview'),
        NamedChain.direct('dialog', Mouse.cClickOn('button:contains("-> Basic")'), '_'),
        NamedChain.direct('tabview', cAssertFormContents('Clicking Basic button', (s, str, _arr) => s.element('input', {
          value: str.is('First tab value')
        })), '_'),

        NamedChain.direct('dialog', Mouse.cClickOn('button:contains("-> Advanced")'), '_'),
        NamedChain.direct('tabview', cAssertFormContents('Clicking Advanced button (not tab)', (s, str, _arr) => s.element('textarea', {
          value: str.is('Textarea value')
        })), '_'),

        NamedChain.direct('dialog', Mouse.cClickOn('button:contains("-> Basic")'), '_'),
        NamedChain.direct('tabview', cAssertFormContents('Clicking Basic button again (not tab)', (s, str, _arr) => s.element('input', {
          value: str.is('First tab value')
        })), '_')
      ])
    ])
  ], () => {
    helpers.destroy();
    success();
  }, failure);
});
