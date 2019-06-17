import { Logger, Pipeline, Keyboard, Step, Keys, GeneralSteps, RealKeys } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { setTimeout } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { TinyLoader, TinyUi, TinyApis } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import { PlatformDetection } from '@ephox/sand';

import Editor from 'tinymce/core/api/Editor';
import Promise from 'tinymce/core/api/util/Promise';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { AutocompleterStructure, sAssertAutocompleterStructure, sWaitForAutocompleteToClose } from '../../module/AutocompleterUtils';

UnitTest.asynctest('Editor Autocompleter delay response test', (success, failure) => {
  SilverTheme();

  const platform = PlatformDetection.detect();

  // This test is a little too flaky on IE
  if (platform.browser.isIE()) {
    return success();
  }

  const store = TestHelpers.TestStore();

  interface Scenario {
    triggerChar: string;
    structure: AutocompleterStructure;
    choice: Step<any, any>;
    assertion: Step<any, any>;
    initialContent?: string;
    additionalContent?: string;
    cursorPos?: {
      elementPath: number[];
      offset: number;
    };
  }

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyUi = TinyUi(editor);
      const tinyApis = TinyApis(editor);

      const eDoc = Element.fromDom(editor.getDoc());

      const sTestAutocompleter = (scenario: Scenario) => {
        const initialContent = scenario.initialContent || scenario.triggerChar;
        const additionalContent = scenario.additionalContent;
        return GeneralSteps.sequence([
          store.sClear,
          tinyApis.sSetContent(`<p></p>`),
          RealKeys.sSendKeysOn(
            'iframe => body => p',
            [
              RealKeys.text(initialContent)
            ]
          ),
          // Wait 50ms for the keypress handler to run
          Step.wait(50),
          ...additionalContent ? [
            RealKeys.sSendKeysOn(
              'iframe => body => p',
              [
                RealKeys.text(additionalContent)
              ]
            )
          ] : [],
          tinyUi.sWaitForPopup('wait for autocompleter to appear', '.tox-autocompleter div[role="menu"]'),
          sAssertAutocompleterStructure(scenario.structure),
          scenario.choice,
          sWaitForAutocompleteToClose,
          scenario.assertion
        ]);
      };

      const sTestDelayedResponseAutocomplete = sTestAutocompleter({
        triggerChar: '$',
        initialContent: '$a',
        additionalContent: 'aa',
        structure: {
          type: 'grid',
          groups: [
            [
              { title: 'dollar-a', icon: '$' },
              { title: 'dollar-b', icon: '$' },
              { title: 'dollar-c', icon: '$' },
              { title: 'dollar-d', icon: '$' }
            ]
          ]
        },
        choice: GeneralSteps.sequence([
          Keyboard.sKeydown(eDoc, Keys.enter(), { })
        ]),
        assertion: tinyApis.sAssertContent('<p>dollar-a</p>')
      });

      Pipeline.async({ }, Logger.ts('Trigger autocompleter', [
        tinyApis.sFocus,
        Logger.t('Checking delayed autocomplete, (columns = auto), trigger: "$"', sTestDelayedResponseAutocomplete)
      ]), onSuccess, onFailure);
    },
    {
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.ui.registry.addAutocompleter('Dollars', {
          ch: '$',
          minChars: 0,
          columns: 'auto',
          fetch: (pattern, maxResults) => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(
                  Arr.map([ 'a', 'b', 'c', 'd' ], (letter) => ({
                    value: `dollar-${letter}`,
                    text: `dollar-${letter}`,
                    icon: '$'
                  }))
                );
              }, 500);
            });
          },
          onAction: (autocompleteApi, rng, value) => {
            store.adder('dollars:' + value)();
            ed.selection.setRng(rng);
            ed.insertContent(value);
            autocompleteApi.hide();
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
