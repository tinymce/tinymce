import { ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Logger, Mouse, Pipeline, Step, UiFinder } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import { SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('OxideGridCollectionMenuTest', (success, failure) => {
  Theme();

  const store = TestHelpers.TestStore();

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const doc = SugarElement.fromDom(document);

      Pipeline.async({ }, Logger.ts(
        'Check structure of grid collection menu',
        [
          TestHelpers.GuiSetup.mAddStyles(doc, [
            ':focus { background-color: rgb(222, 224, 226); }'
          ]),
          Mouse.sClickOn(SugarBody.body(), '.tox-split-button__chevron'),
          UiFinder.sWaitForVisible('Waiting for menu', SugarBody.body(), '[role="menu"]'),
          Chain.asStep(SugarBody.body(), [
            UiFinder.cFindIn('[role="menu"]'),
            Assertions.cAssertStructure(
              'Checking structure',
              ApproxStructure.build((s, str, arr) => s.element('div', {
                classes: [ arr.has('tox-menu'), arr.has('tox-collection'), arr.has('tox-collection--grid') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__group') ],
                    children: Arr.map([ '1', '2', '3', '4', '5', '6', '7', '8' ], (num) => s.element('div', {
                      classes: [ arr.has('tox-collection__item') ],
                      attrs: {
                        title: str.is(num)
                      },
                      children: [
                        // NOTE: The oxide demo page has div, but I think that's just a mistake
                        s.element('div', {
                          classes: [ arr.has('tox-collection__item-icon') ],
                          children: [
                            s.element('svg', {})
                          ]
                        })
                      ]
                    }))
                  })
                ]
              }))
            )
          ]),

          // Without layout, the flatgrid cannot be calculated on phantom
          navigator.userAgent.indexOf('PhantomJS') > -1 ? Step.pass : GeneralSteps.sequence([
            FocusTools.sTryOnSelector('Focus should be on 1', doc, '.tox-collection__item[title="1"]'),
            Keyboard.sKeydown(doc, Keys.right(), { }),
            FocusTools.sTryOnSelector('Focus should be on 2', doc, '.tox-collection__item[title="2"]'),
            Keyboard.sKeydown(doc, Keys.right(), { }),
            FocusTools.sTryOnSelector('Focus should be on 3', doc, '.tox-collection__item[title="3"]')
          ]),
          TestHelpers.GuiSetup.mRemoveStyles
        ]
      ), onSuccess, onFailure);
    },
    {
      theme: 'silver',
      menubar: true,
      toolbar: 'grid-button',
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.ui.registry.addSplitButton('grid-button', {
          type: 'splitbutton',
          columns: 'auto',
          fetch: (callback) => {
            callback(
              Arr.map([ '1', '2', '3', '4', '5', '6', '7', '8' ], (num) => ({
                type: 'choiceitem',
                value: num,
                text: num,
                icon: 'fake-icon-name'
              } as Menu.ChoiceMenuItemSpec))
            );
          },
          onAction: store.adder('onAction'),
          onItemAction: store.adder('onItemAction')
        });
      }
    },
    () => {
      success();
    },
    failure
  );
});
