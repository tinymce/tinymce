import { FocusTools, Keyboard, Keys, Mouse, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { before, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Checked, SugarBody, SugarDocument, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { WindowManagerImpl } from 'tinymce/core/api/WindowManager';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import * as TestExtras from '../../module/TestExtras';

const GuiSetup = TestHelpers.GuiSetup;

describe('headless.tinymce.themes.silver.window.CustomDialogTest', () => {
  const store = TestStore();
  const extrasHook = TestExtras.bddSetup();
  let windowManager: WindowManagerImpl;
  before(() => {
    windowManager = WindowManager.setup(extrasHook.access().extras);
  });

  GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    '[role="dialog"] { background: white; }',
    'input:checked + .tox-checkbox__icons .tox-checkbox-icon__unchecked { display: none; }',
    'input:checked + .tox-checkbox__icons .tox-checkbox-icon__indeterminate { display: none; }',

    'input:indeterminate + .tox-checkbox__icons .tox-checkbox-icon__unchecked { display: none; }',
    'input:indeterminate + .tox-checkbox__icons .tox-checkbox-icon__checked { display: none; }',

    'input:not(:checked):not(:indeterminate) + .tox-checkbox__icons .tox-checkbox-icon__indeterminate { display: none; }',
    'input:not(:checked):not(:indeterminate) + .tox-checkbox__icons .tox-checkbox-icon__checked { display: none; }',

    '.tox-checkbox__input { height: 1px; left: -10000px; oveflow: hidden; position: absolute; top: auto; width: 1px; }',

    '[role="dialog"] { border: 1px solid black; padding: 2em; background-color: rgb(131,193,249); top: 40px; position: absolute; }',

    ':focus { outline: 3px solid green; !important; }',

    '.tox-collection__item { display: inline-block; }'
  ]);

  const assertFocusedCheckbox = (label: string, expected: boolean) => {
    const focused = FocusTools.getFocused(SugarDocument.getDocument()).getOrDie() as SugarElement<HTMLInputElement>;
    assert.equal(Checked.get(focused), expected, 'Checking checked status');
  };

  const selectors = {
    field1: 'input', // nothing more useful, because it does not have a label
    field2: 'label:contains("F2") + .tox-textarea-wrap textarea',
    field3: 'label:contains("F3") + .tox-form__controls-h-stack input',
    field4_a: '.tox-collection__item:contains("a")',
    field4_b: '.tox-collection__item:contains("b")',
    field5: 'input[type="checkbox"]',
    field6: 'label:contains("nested1") + input',
    field7: 'label:contains("nested2") + input',
    field8: 'button:contains("Cancel")',
    field9: 'button:contains("Save")',
    browseButton: 'button[title=F3]'
  };

  it('', async () => {
    const doc = SugarDocument.getDocument();
    windowManager.open({
      title: 'Custom Dialog',
      body: {
        type: 'panel',
        items: [
          {
            name: 'f1-input',
            type: 'input'
          },
          {
            name: 'f2-textarea',
            label: 'F2',
            type: 'textarea'
          },
          {
            name: 'f3-urlinput',
            filetype: 'file',
            label: 'F3',
            type: 'urlinput'
          },
          {
            name: 'f4-charmap',
            type: 'collection'
            // columns: 'auto'
          },
          {
            name: 'f5-checkbox',
            label: 'Checkbox',
            type: 'checkbox'
          },
          {
            type: 'grid',
            columns: 2,
            items: [
              {
                type: 'input',
                label: 'nested1',
                name: 'nested-input'
              },
              {
                type: 'grid',
                columns: 2,
                items: [
                  {
                    type: 'input',
                    label: 'nested2',
                    name: 'nested-nested-input'
                  }
                ]
              }
            ]
          }
        ]
      },
      buttons: [
        {
          type: 'custom',
          text: 'go',
          enabled: false,
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
        'f1-input': 'f1',
        'f2-textarea': 'f2',
        'f3-urlinput': {
          value: 'f3',
          text: 'F3',
          meta: {}
        },
        'f4-charmap': [
          { value: 'a', icon: 'a', text: 'a' },
          { value: 'b', icon: 'b', text: 'b' },
          { value: 'c', icon: 'c', text: 'c' },
          { value: 'd', icon: 'd', text: 'd' }
        ],
        'f5-checkbox': true,
        'nested-input': 'nested-input',
        'nested-nested-input': 'nested-nested-input'
      },
      onSubmit: () => {
        store.add('onSubmit');
      }
    }, {}, Fun.noop);

    await FocusTools.pTryOnSelector(
      'Focus should start on first input',
      doc,
      selectors.field1
    );

    Keyboard.activeKeydown(doc, Keys.tab());
    await FocusTools.pTryOnSelector(
      'Focus should move to second input (textarea)',
      doc,
      selectors.field2
    );

    Keyboard.activeKeydown(doc, Keys.tab());
    await FocusTools.pTryOnSelector(
      'Focus should move to urlinput',
      doc,
      selectors.field3
    );

    Keyboard.activeKeydown(doc, Keys.tab());
    await FocusTools.pTryOnSelector(
      'Focus should move to browse button',
      doc,
      selectors.browseButton
    );

    Keyboard.activeKeydown(doc, Keys.tab());
    await FocusTools.pTryOnSelector(
      'Focus should move to charmap character a',
      doc,
      selectors.field4_a
    );

    Keyboard.activeKeydown(doc, Keys.right());
    await FocusTools.pTryOnSelector(
      'Focus should move to charmap character b',
      doc,
      selectors.field4_b
    );

    Keyboard.activeKeydown(doc, Keys.tab());
    await FocusTools.pTryOnSelector(
      'Focus should move to focusable part of checkboxes',
      doc,
      selectors.field5
    );

    Keyboard.activeKeydown(doc, Keys.enter());
    assertFocusedCheckbox('Pressing <enter> on checked checkbox', false);

    Keyboard.activeKeydown(doc, Keys.space());
    assertFocusedCheckbox('Pressing <space> on unchecked checkbox', true);

    Keyboard.activeKeydown(doc, Keys.tab());
    await FocusTools.pTryOnSelector(
      'Focus should move to first nested input',
      doc,
      selectors.field6
    );

    Keyboard.activeKeydown(doc, Keys.tab());
    await FocusTools.pTryOnSelector(
      'Focus should move to second nested input',
      doc,
      selectors.field7
    );

    Keyboard.activeKeydown(doc, Keys.tab());
    await FocusTools.pTryOnSelector(
      'Focus should skip over disabled button',
      doc,
      selectors.field8
    );

    Keyboard.activeKeydown(doc, Keys.tab());
    await FocusTools.pTryOnSelector(
      'Focus should move to ok',
      doc,
      selectors.field9
    );

    // Now, navigate backwards
    await Arr.foldl([
      { label: 'cancel', selector: selectors.field8 },
      { label: 'nested2', selector: selectors.field7 },
      { label: 'nested1', selector: selectors.field6 },
      { label: 'checkbox', selector: selectors.field5 },
      { label: 'charmap', selector: selectors.field4_a },
      { label: 'browse button', selector: selectors.browseButton },
      { label: 'f3', selector: selectors.field3 },
      { label: 'f2', selector: selectors.field2 },
      { label: 'first input', selector: selectors.field1 }
    ], (p, dest) => p.then(async () => {
      Keyboard.activeKeydown(doc, Keys.tab(), { shiftKey: true });
      await FocusTools.pTryOnSelector(
        'Focus should move to ' + dest.label,
        doc,
        dest.selector
      );
    }), Promise.resolve());

    store.assertEq('Checking the testLog is empty', []);

    await FocusTools.pTryOnSelector('Checking on an input field', doc, 'input');
    Keyboard.activeKeydown(doc, Keys.enter());

    store.assertEq('Checking the testLog has a submit after hitting enter in an input field', [ 'onSubmit' ]);

    Mouse.clickOn(SugarBody.body(), '.tox-button--icon[aria-label="Close"]');
    await Waiter.pTryUntil(
      'Wait for the dialog to disappear',
      () => UiFinder.notExists(SugarBody.body(), '.tox-button--icon[aria-label="Close"]')
    );
  });
});
