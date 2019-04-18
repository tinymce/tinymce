import {
  Assertions,
  Chain,
  FocusTools,
  GeneralSteps,
  Keyboard,
  Keys,
  Logger,
  Mouse,
  Pipeline,
  Step,
  UiFinder,
  Waiter,
} from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { Arr, Cell } from '@ephox/katamari';
import { Body, Element } from '@ephox/sugar';
import WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';
import TestExtras from '../../module/TestExtras';

const GuiSetup = TestHelpers.GuiSetup;

UnitTest.asynctest('WindowManager:custom-dialog Test', (success, failure) => {
  const helpers = TestExtras();
  const windowManager = WindowManager.setup(helpers.extras);

  const doc = Element.fromDom(document);

  const testLog = Cell([ ]);

  const sAssertFocusedCheckbox = (label: string, expected: boolean) => {
    return Logger.t(
      label,
      Chain.asStep(doc, [
        FocusTools.cGetFocused,
        Chain.op((checkbox) => {
          Assertions.assertEq('Checking checked status', expected, checkbox.dom().checked);
        })
      ])
    );
  };

  const selectors = {
    field1: 'input', // nothing more useful, because it does not have a label
    field2: 'label:contains("F2") + textarea',
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

  Pipeline.async({ }, [
    GuiSetup.mAddStyles(doc, [
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
    ]),

    Step.sync(() => {
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
              type: 'collection',
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
            disabled: true
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
            meta: { }
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
          testLog.set(
            testLog.get().concat([ 'onSubmit' ])
          );
        }
      }, {}, () => {});
    }),

    FocusTools.sTryOnSelector(
      'Focus should start on first input',
      doc,
      selectors.field1
    ),

    Keyboard.sKeydown(doc, Keys.tab(), { }),
    FocusTools.sTryOnSelector(
      'Focus should move to second input (textarea)',
      doc,
      selectors.field2
    ),

    Keyboard.sKeydown(doc, Keys.tab(), { }),
    FocusTools.sTryOnSelector(
      'Focus should move to urlinput',
      doc,
      selectors.field3
    ),

    Keyboard.sKeydown(doc, Keys.tab(), { }),
    FocusTools.sTryOnSelector(
      'Focus should move to browse button',
      doc,
      selectors.browseButton
    ),

    Keyboard.sKeydown(doc, Keys.tab(), { }),
    FocusTools.sTryOnSelector(
      'Focus should move to charmap character a',
      doc,
      selectors.field4_a
    ),

    Keyboard.sKeydown(doc, Keys.right(), { }),
    FocusTools.sTryOnSelector(
      'Focus should move to charmap character b',
      doc,
      selectors.field4_b
    ),

    Keyboard.sKeydown(doc, Keys.tab(), { }),
    FocusTools.sTryOnSelector(
      'Focus should move to focusable part of checkboxes',
      doc,
      selectors.field5
    ),

    Keyboard.sKeydown(doc, Keys.enter(), { }),
    sAssertFocusedCheckbox('Pressing <enter> on checked checkbox', false),

    Keyboard.sKeydown(doc, Keys.space(), { }),
    sAssertFocusedCheckbox('Pressing <space> on unchecked checkbox', true),

    Keyboard.sKeydown(doc, Keys.tab(), { }),
    FocusTools.sTryOnSelector(
      'Focus should move to first nested input',
      doc,
      selectors.field6

    ),

    Keyboard.sKeydown(doc, Keys.tab(), { }),
    FocusTools.sTryOnSelector(
      'Focus should move to second nested input',
      doc,
      selectors.field7
    ),

    Keyboard.sKeydown(doc, Keys.tab(), { }),
    FocusTools.sTryOnSelector(
      'Focus should skip over disabled button',
      doc,
      selectors.field8
    ),

    Keyboard.sKeydown(doc, Keys.tab(), { }),
    FocusTools.sTryOnSelector(
      'Focus should move to ok',
      doc,
      selectors.field9
    ),

    Logger.t(
      'Now, navigate backwards',
      GeneralSteps.sequence(
        Arr.bind([
          { label: 'cancel', selector: selectors.field8 },
          { label: 'nested2', selector: selectors.field7 },
          { label: 'nested1', selector: selectors.field6 },
          { label: 'checkbox', selector: selectors.field5 },
          { label: 'charmap', selector: selectors.field4_a },
          { label: 'browse button', selector: selectors.browseButton },
          { label: 'f3', selector: selectors.field3 },
          { label: 'f2', selector: selectors.field2 },
          { label: 'first input', selector: selectors.field1 }
        ], (dest) => {
          return [
            Keyboard.sKeydown(doc, Keys.tab(), { shiftKey: true }),
            FocusTools.sTryOnSelector(
              'Focus should move to ' + dest.label,
              doc,
              dest.selector
            )
          ];
        })
      )
    ),

    Logger.t(
      'Checking the testLog is empty',
      Step.sync(() => {
        Assertions.assertEq('testLog contents', [ ], testLog.get());
      })
    ),

    FocusTools.sTryOnSelector('Checking on an input field', doc, 'input'),
    Keyboard.sKeydown(doc, Keys.enter(), { }),

    Logger.t(
      'Checking the testLog has a submit after hitting enter in an input field',
      Step.sync(() => {
        Assertions.assertEq('testLog contents', [ 'onSubmit' ], testLog.get());
      })
    ),

    GeneralSteps.sequence([
      Mouse.sClickOn(Body.body(), '.tox-button--icon[aria-label="Close"]'),
      Waiter.sTryUntil(
        'Wait for the dialog to disappear',
        UiFinder.sNotExists(Body.body(), '.tox-button--icon[aria-label="Close"]'),
        100,
        1000
      ),
    ])
  ], () => {
    helpers.destroy();
    success();
  }, failure);
});