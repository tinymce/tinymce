import { ApproxStructure, Assertions, Mouse, StructAssert, UiFinder } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody, SugarElement } from '@ephox/sugar';

import { WindowManagerImpl } from 'tinymce/core/api/WindowManager';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import * as TestExtras from '../../module/TestExtras';

describe('phantom.tinymce.themes.silver.window.TabbedDialogTest', () => {
  const helpers = TestExtras.bddSetup();
  let windowManager: WindowManagerImpl;
  before(() => {
    windowManager = WindowManager.setup(helpers.extras());
  });

  const assertFormContents = (label: string, tabview: SugarElement<HTMLElement>, f: ApproxStructure.Builder<StructAssert>) => {
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
  };

  it('Open dialog, click tabs and assert structure', () => {
    const dialogApi = windowManager.open({
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
      onSubmit: Fun.noop
    }, {}, Fun.noop);

    const dialog = UiFinder.findIn(SugarBody.body(), '[role="dialog"]').getOrDie();
    UiFinder.findIn(dialog, '[role="tab"]:contains("Basic")').getOrDie();
    UiFinder.findIn(dialog, '[role="tab"]:contains("Advanced")').getOrDie();
    const tabview = UiFinder.findIn(dialog, '[role="tabpanel"]').getOrDie();

    Mouse.clickOn(dialog, 'button:contains("-> Basic")');
    assertFormContents('Clicking Basic button', tabview, (s, str, _arr) => s.element('input', {
      value: str.is('First tab value')
    }));

    Mouse.clickOn(dialog, 'button:contains("-> Advanced")');
    assertFormContents('Clicking Advanced button (not tab)', tabview, (s, str, _arr) => s.element('textarea', {
      value: str.is('Textarea value')
    }));

    Mouse.clickOn(dialog, 'button:contains("-> Basic")');
    assertFormContents('Clicking Basic button again (not tab)', tabview, (s, str, _arr) => s.element('input', {
      value: str.is('First tab value')
    }));

    dialogApi.close();
  });
});
