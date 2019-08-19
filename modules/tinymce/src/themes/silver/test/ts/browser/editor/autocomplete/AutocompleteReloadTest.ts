import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { InlineContent } from '@ephox/bridge';
import { Arr, Obj } from '@ephox/katamari';
import { TinyActions, TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Promise from 'tinymce/core/api/util/Promise';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { sAssertAutocompleterStructure, sWaitForAutocompleteToOpen } from '../../../module/AutocompleterUtils';

UnitTest.asynctest('Editor Autocompleter Reload test', (success, failure) => {
  SilverTheme();

  interface Scenario {
    action: Step<any, any>;
    postAction?: Step<any, any>;
    assertion: Step<any, any>;
    postAssertion?: Step<any, any>;
  }

  const sAssertInitialMenu = sAssertAutocompleterStructure({
    type: 'list',
    hasIcons: false,
    groups: [
      [
        { title: 'a', text: 'a' },
        { title: 'b', text: 'b' },
        { title: 'c', text: 'c' },
        { title: 'd', text: 'd' }
      ],
      [
        { title: 'Load more...', text: 'Load more...' }
      ]
    ]
  });

  const sAssertReloadedMenu = sAssertAutocompleterStructure({
    type: 'list',
    hasIcons: false,
    groups: [
      [
        { title: 'ra', text: 'ra' },
        { title: 'rb', text: 'rb' },
        { title: 'rc', text: 'rc' },
        { title: 'rd', text: 'rd' }
      ]
    ]
  });

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyActions = TinyActions(editor);
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    const sSetContentAndTrigger = (content: string, triggerCharCode: number) => {
      return GeneralSteps.sequence([
        tinyApis.sSetContent(`<p>${content}</p>`),
        tinyApis.sSetCursor([ 0, 0 ], content.length),
        tinyApis.sNodeChanged,
        tinyActions.sContentKeypress(triggerCharCode, { }),
        sWaitForAutocompleteToOpen
      ]);
    };

    const sTestAutocompleter = (scenario: Scenario) => GeneralSteps.sequence([
      sSetContentAndTrigger(':aa', ':'.charCodeAt(0)),
      scenario.action,
      scenario.assertion,
      ...scenario.postAction ? [
        scenario.postAction,
        scenario.postAssertion
      ] : []
    ]);

    Pipeline.async({ }, Logger.ts(
      'Trigger autocompleter and reload items',
      [
        tinyApis.sFocus,
        sTestAutocompleter({
          action: Step.pass,
          assertion: sAssertInitialMenu,
          postAction: GeneralSteps.sequence([
            tinyUi.sClickOnUi('Click extra item', '.tox-collection__item:contains("Load more...")'),
            tinyUi.sWaitForUi('Wait for menu to reload', '.tox-collection__item:contains("ra")')
          ]),
          postAssertion: sAssertReloadedMenu
        })
      ]
    ), onSuccess, onFailure);
  }, {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addAutocompleter('Colon', {
        ch: ':',
        minChars: 1,
        columns: 1,
        fetch: (pattern, maxResults, meta) => {
          const prefix = Obj.get(meta, 'prefix').getOr('');
          return new Promise((resolve) => {
            const items: InlineContent.AutocompleterContents[] = Arr.map([ 'a', 'b', 'c', 'd' ], (item) => ({
              value: `item-${item}`,
              text: `${prefix}${item}`
            }));

            const extras: InlineContent.AutocompleterContents[] = Obj.keys(meta).length === 0 ? [
              { type: 'separator' },
              { value: '', text: 'Load more...', meta: { reload: true }}
            ] : [ ];

            resolve([
              ...items,
              ...extras
            ]);
          });
        },
        onAction: (autocompleteApi, rng, value, meta) => {
          if (meta.reload === true) {
            autocompleteApi.reload({ prefix: 'r' });
          } else {
            autocompleteApi.hide();
          }
        }
      });
    }
  }, success, failure);
});
