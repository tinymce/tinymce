import {
    ApproxStructure, Assertions, Keys, Pipeline, Step, Log
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';

import TextpatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.textpattern.TextPatternPluginTest', (success, failure) => {

  TextpatternPlugin();
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    const steps = Utils.withTeardown([
      Log.stepsAsStep('TBA', 'TextPattern: space on ** without content does nothing', [
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '**'),
        tinyApis.sAssertContent('<p>**&nbsp;</p>')
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: Italic format on single word using space', [
        tinyApis.sSetContent('<p>*a&nbsp; *</p>'),
        tinyApis.sFocus,
        tinyApis.sSetCursor([0, 0], 5),
        tinyActions.sContentKeystroke(Keys.space(), {}),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return Utils.bodyStruct([
            s.element('p', {
              children: [
                s.element('em', {
                  children: [
                    s.text(str.is('a'))
                  ]
                }),
                s.text(str.is('\u00A0')),
                s.text(str.is(' ')),
                s.text(str.is('\u00A0'))
              ]
            })
          ]);
        }))
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: Italic format on single word using space', [
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '*a*'),
        tinyApis.sAssertContentStructure(Utils.inlineStructHelper('em', 'a'))
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: Bold format on single word using space', [
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '**a**'),
        tinyApis.sAssertContentStructure(Utils.inlineStructHelper('strong', 'a'))
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: Bold/italic format on single word using space', [
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '***a***'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return Utils.bodyStruct([
            s.element('p', {
              children: [
                s.element('em', {
                  children: [
                    s.element('strong', {
                      children: [
                        s.text(str.is('a'))
                      ]
                    })
                  ]
                }),
                s.text(str.is('\u00A0'))
              ]
            })
          ]);
        }))
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: Bold format on multiple words using space', [
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '**a b**'),
        tinyApis.sAssertContentStructure(Utils.inlineStructHelper('strong', 'a b'))
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: Bold format on single word using enter', [
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '**a**'),
        tinyApis.sAssertContentStructure(Utils.inlineBlockStructHelper('strong', 'a'))
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: Bold/italic format on single word using enter', [
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '***a***'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return Utils.bodyStruct([
            s.element('p', {
              children: [
                s.element('em', {
                  children: [
                    s.element('strong', {
                      children: [
                        s.text(str.is('a')),
                        s.anything()
                      ]
                    })
                  ]
                })
              ]
            }),
            s.anything()
          ]);
        }))
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: H1 format on single word node using enter', [
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '# a'),
        tinyApis.sAssertContentStructure(Utils.blockStructHelper('h1', ' a'))
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: H2 format on single word node using enter', [
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '## a'),
        tinyApis.sAssertContentStructure(Utils.blockStructHelper('h2', ' a'))
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: H3 format on single word node using enter', [
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '### a'),
        tinyApis.sAssertContentStructure(Utils.blockStructHelper('h3', ' a'))
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: H4 format on single word node using enter', [
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '#### a'),
        tinyApis.sAssertContentStructure(Utils.blockStructHelper('h4', ' a'))
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: H5 format on single word node using enter', [
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '##### a'),
        tinyApis.sAssertContentStructure(Utils.blockStructHelper('h5', ' a'))
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: H6 format on single word node using enter', [
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '###### a'),
        tinyApis.sAssertContentStructure(Utils.blockStructHelper('h6', ' a'))
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: OL format on single word node using enter', [
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '1. a'),
        tinyApis.sAssertContentPresence({ ol: 1, li: 2 })
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: UL format on single word node using enter', [
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '* a'),
        tinyApis.sAssertContentPresence({ ul: 1, li: 2 })
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: enter with uncollapsed range does not insert list', [
        tinyApis.sSetContent('<p>* ab</p>'),
        tinyApis.sFocus,
        tinyApis.sSetSelection([0, 0], 3, [0, 0], 4),
        tinyActions.sContentKeystroke(Keys.enter(), {}),
        tinyApis.sAssertContentPresence({ ul: 0 })
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: enter with only pattern does not insert list', [
        tinyApis.sSetContent('<p>*</p>'),
        tinyApis.sFocus,
        tinyApis.sSetCursor([0, 0], 1),
        tinyActions.sContentKeystroke(Keys.enter(), {}),
        tinyApis.sAssertContentPresence({ ul: 0 })
      ]),
      Log.stepsAsStep('TBA', 'TextPattern: test inline and block at the same time', [
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '* **important list**'),
        tinyApis.sAssertContentPresence({ ul: 1, strong: 2 })
      ]),
      Log.step('TBA', 'TextPattern: getPatterns/setPatterns', Step.sync(function () {
        editor.plugins.textpattern.setPatterns([
            { start: '#', format: 'h1' },
            { start: '##', format: 'h2' },
            { start: '###', format: 'h3' }
        ]);

        Assertions.assertEq(
            'should be the same',
            editor.plugins.textpattern.getPatterns(),
          [
            {
              format: 'h3',
              start: '###'
            },
            {
              format: 'h2',
              start: '##'
            },

            {
              format: 'h1',
              start: '#'
            }
          ]
          );
      }))
    ], tinyApis.sSetContent(''));

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    plugins: 'textpattern',
    base_url: '/project/js/tinymce'
  }, success, failure);
});
