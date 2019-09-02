import { ApproxStructure, GeneralSteps, Keys, Logger, Pipeline, StructAssert, Waiter, Mouse, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';
import { TinyActions, TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { Element } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Promise from 'tinymce/core/api/util/Promise';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { sWaitForAutocompleteToClose } from '../../../module/AutocompleterUtils';

UnitTest.asynctest('Editor Autocompleter Cancel test', (success, failure) => {
  const platform = PlatformDetection.detect();

  SilverTheme();

  interface Scenario {
    setup?: Step<any, any>;
    action: Step<any, any>;
    postAction?: Step<any, any>;
    assertion: (s, str, arr) => StructAssert[];
  }

  const expectedSimplePara = (content: string) => (s, str): StructAssert => {
    return s.element('p', {
      children: [ s.text(str.is(content), true) ]
    });
  };

  const expectedAutocompletePara = (content: string) => (s, str): StructAssert => {
    return s.element('p', {
      children: [
        s.element('span', {
          attrs: {
            'data-mce-autocompleter': str.is('1'),
            'data-mce-bogus': str.is('1')
          },
          children: [ s.text(str.is(content), true) ]
        })
      ]
    });
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyActions = TinyActions(editor);
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    const sWaitForMenuToOpen = tinyUi.sWaitForPopup('wait for autocompleter to appear', '.tox-autocompleter div[role="menu"]');

    const sSetContentAndTrigger = (content: string, triggerCharCode: number, template?: string, elementPath?: number[]) => {
      const htmlTemplate = template || '<p>CONTENT</p>';
      return GeneralSteps.sequence([
        tinyApis.sSetContent(htmlTemplate.replace('CONTENT', content)),
        sSetCursor(elementPath || [ 0, 0 ], content.length),
        tinyActions.sContentKeypress(triggerCharCode, { })
      ]);
    };

    const sInsertContentAndTrigger = (content: string) => {
      return GeneralSteps.sequence([
        tinyApis.sExecCommand('mceInsertContent', content),
        tinyActions.sContentKeypress(content.charCodeAt(content.length - 1), { })
      ]);
    };

    const sSetCursor = (elementPath: number[], offset: number) => GeneralSteps.sequence([
      tinyApis.sSetCursor(elementPath, offset),
      tinyApis.sNodeChanged
    ]);

    const sAssertContent = (label: string, expected: (s, str, arr) => StructAssert[]) => {
      return Waiter.sTryUntil(label, tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => {
        return s.element('body', {
          children: expected(s, str, arr)
        });
      })));
    };

    const sTriggerAndAssertInitialContent = (template?: string, elementPath?: number[], expected?: (s, str, arr) => StructAssert[]) => {
      return GeneralSteps.sequence([
        sSetContentAndTrigger(':a', ':'.charCodeAt(0), template, elementPath),
        sWaitForMenuToOpen,
        sAssertContent('Check initial content with autocompleter active', (s, str, arr) => {
          return expected ? expected(s, str, arr) : [ expectedAutocompletePara(':a')(s, str) ];
        })
      ]);
    };

    const sTestAutocompleter = (scenario: Scenario) => GeneralSteps.sequence([
      scenario.setup ? scenario.setup : sTriggerAndAssertInitialContent(),
      scenario.action,
      sWaitForAutocompleteToClose,
      ...scenario.postAction ? [ scenario.postAction ] : [],
      sAssertContent('Check autocompleter was cancelled', scenario.assertion)
    ]);

    const sTestEscapeMenu = sTestAutocompleter({
      action: tinyActions.sContentKeydown(Keys.escape(), {}),
      assertion: (s, str) => [ expectedSimplePara(':a')(s, str) ]
    });

    const sTestNewline = sTestAutocompleter({
      action: sInsertContentAndTrigger('aa'),
      postAction: tinyActions.sContentKeystroke(Keys.enter(), {}),
      assertion: (s, str) => [
        expectedSimplePara(':aaa')(s, str),
        s.element('p', {})
      ]
    });

    const sTestBackspace = sTestAutocompleter({
      action: GeneralSteps.sequence([
        tinyApis.sExecCommand('delete'),
        tinyApis.sExecCommand('delete'),
        tinyActions.sContentKeystroke(Keys.backspace())
      ]),
      assertion: (s) => [
        s.element('p', {
          children: [
            s.element('br', { })
          ]
        })
      ]
    });

    const sTestKeyNavigation = (key: number) => sTestAutocompleter({
      setup: sTriggerAndAssertInitialContent('<p></p></p><p>CONTENT</p><p></p>', [ 1, 0 ], (s, str) => [
        s.element('p', {}),
        expectedAutocompletePara(':a')(s, str),
        s.element('p', {}),
      ]),
      action: sInsertContentAndTrigger('aa'),
      postAction: tinyActions.sContentKeystroke(key, {}),
      assertion: (s, str) => [
        s.element('p', {}),
        expectedSimplePara(':aaa')(s, str),
        s.element('p', {})
      ]
    });

    const sTestContinueTypingWithNoMatch = sTestAutocompleter({
      action: sInsertContentAndTrigger('aaaaaaaaaa'),
      assertion: (s, str) => [ expectedSimplePara(':aaaaaaaaaaa')(s, str) ]
    });

    const sTestNodeChange = GeneralSteps.sequence([
      sTriggerAndAssertInitialContent('<p>CONTENT</p><p>new node</p>', [ 0, 0 ], (s, str) => [
        expectedAutocompletePara(':a')(s, str),
        s.element('p', {}),
      ]),
      sInsertContentAndTrigger('aa'),
      sSetCursor([0, 0, 0], 2),
      sWaitForAutocompleteToClose,
      sAssertContent('Check autocompleter was not cancelled', (s, str) => [
        expectedAutocompletePara(':aaa')(s, str),
        s.element('p', { }),
      ]),
      sSetCursor([1, 0], 0),
      sAssertContent('Check autocompleter was cancelled', (s, str) => [
        expectedSimplePara(':aaa')(s, str),
        s.element('p', { })
      ]),
    ]);

    const sTestClickOutsideMenu = sTestAutocompleter({
      setup: sTriggerAndAssertInitialContent('<p>CONTENT</p><p>new node</p>', [ 0, 0 ], (s, str) => [
        expectedAutocompletePara(':a')(s, str),
        s.element('p', {}),
      ]),
      action: Mouse.sTrueClickOn(Element.fromDom(editor.getBody()), 'p:contains(new node)'),
      assertion: (s, str) => [
        expectedSimplePara(':a')(s, str),
        s.element('p', { })
      ],
    });

    Pipeline.async({ }, Logger.ts(
      'Trigger autocompleter',
      [
        tinyApis.sFocus,
        Logger.t('Checking escape in menu cancels the autocompleter', sTestEscapeMenu),
        Logger.t('Checking inserting a new line cancels the autocompleter', sTestNewline),
        Logger.t('Checking inserting at least 10 chars after no matches cancels the autocompleter', sTestContinueTypingWithNoMatch),
        Logger.t('Checking changing to different node cancels the autocompleter', sTestNodeChange),
        Logger.t('Checking pressing down cancels the autocompleter', sTestKeyNavigation(Keys.down())),
        Logger.t('Checking pressing up cancels the autocompleter', sTestKeyNavigation(Keys.up())),
        Logger.t('Checking clicking outside cancels the autocompleter', sTestClickOutsideMenu)
      // TODO: IE 11 doesn't send the keydown event for these tests (works outside tests), so investigate why that's happening
      ].concat(platform.browser.isIE() ? [] : [
        Logger.t('Checking escape in menu cancels the autocompleter', sTestEscapeMenu),
        Logger.t('Checking deleting trigger char cancels the autocompleter', sTestBackspace)
      ])
    ), onSuccess, onFailure);
  }, {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addAutocompleter('Colon', {
        ch: ':',
        minChars: 1,
        columns: 'auto',
        fetch: (pattern, maxResults) => {
          const filteredItems = Arr.filter([ 'a', 'b', 'c', 'd' ], (item) => item.indexOf(pattern) !== -1);
          return new Promise((resolve) => {
            resolve(
              Arr.map(filteredItems, (item) => ({
                value: `colon-${item}`,
                text: `${item}`,
                icon: ':'
              }))
            );
          });
        },
        onAction: (autocompleteApi, rng, value) => {
          autocompleteApi.hide();
        }
      });
    }
  }, success, failure);
});
