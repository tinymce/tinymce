import { ApproxStructure, Assertions, Keys, Pipeline, Step, GeneralSteps } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';

import TextpatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.textpattern.TextPatternPluginTest', (success, failure) => {
  const detection = PlatformDetection.detect();

  TextpatternPlugin();
  Theme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    // TODO TINY-3258 renable this test when issues with Chrome 72-75 are sorted out
    const browserSpecificTests = !detection.browser.isChrome() ? [
      Step.label('test inline and block at the same time', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '* **important list**'),
        tinyApis.sAssertContentPresence({ ul: 1, li: 2, strong: 1 })
      ]))
    ] : [];

    const steps = Utils.withTeardown([
      Step.label('Space on ** without content does nothing', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '**'),
        Step.label('Check ** was left unchanged', tinyApis.sAssertContent('<p>**&nbsp;</p>'))
      ])),
      Step.label('Italic format on single word using space 1', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '*a&nbsp; *', 5),
        Step.label('Check italic format was applied around the "a" and nbsp but excluded the trailing space',
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return Utils.bodyStruct([
            s.element('p', {
              children: [
                s.element('em', {
                  children: [
                    s.text(str.is('a\u00A0'), true)
                  ]
                }),
                s.text(str.is(' \u00A0'), true),
              ]
            })
          ]);
        })))
      ])),
      Step.label('Italic format on single word using space 2', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '*a*'),
        Step.label('Check italic format was applied', tinyApis.sAssertContentStructure(Utils.inlineStructHelper('em', 'a')))
      ])),
      Step.label('Bold format on single word using space', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '**a**'),
        Step.label('Check bold format was applied', tinyApis.sAssertContentStructure(Utils.inlineStructHelper('strong', 'a'))),
      ])),
      Step.label('Bold/italic format on single word using space', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '***a***'),
        Step.label('Check bold and italic formats were applied', tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return Utils.bodyStruct([
            s.element('p', {
              children: [
                s.element('em', {
                  children: [
                    s.element('strong', {
                      children: [
                        s.text(str.is('a'), true)
                      ]
                    })
                  ]
                }),
                s.text(str.is('\u00A0'), true)
              ]
            })
          ]);
        })))
      ])),
      Step.label('Bold format on multiple words using space', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '**a b**'),
        Step.label('Check bold and italic formats were applied', tinyApis.sAssertContentStructure(Utils.inlineStructHelper('strong', 'a b')))
      ])),
      Step.label('Bold format on single word using enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '**a**'),
        Step.label('Check bold format was applied', tinyApis.sAssertContentStructure(Utils.inlineBlockStructHelper('strong', 'a')))
      ])),
      Step.label('Bold/italic format on single word using enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '***a***'),
        Step.label('Check bold and italic formats were applied', tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return Utils.bodyStruct([
            s.element('p', {
              children: [
                s.element('em', {
                  children: [
                    s.element('strong', {
                      children: [
                        s.text(str.is('a'), true),
                      ]
                    })
                  ]
                }),
                s.zeroOrOne(s.text(str.is(''), true))
              ]
            }),
            s.element('p', {})
          ]);
        })))
      ])),
      Step.label('H1 format on single word node using enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '# a'),
        Step.label('Check h1 format was applied', tinyApis.sAssertContentStructure(Utils.blockStructHelper('h1', ' a')))
      ])),
      Step.label('H2 format on single word node using enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '## a'),
        Step.label('Check h2 format was applied', tinyApis.sAssertContentStructure(Utils.blockStructHelper('h2', ' a')))
      ])),
      Step.label('H3 format on single word node using enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '### a'),
        Step.label('Check h3 format was applied', tinyApis.sAssertContentStructure(Utils.blockStructHelper('h3', ' a')))
      ])),
      Step.label('H4 format on single word node using enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '#### a'),
        Step.label('Check h4 format was applied', tinyApis.sAssertContentStructure(Utils.blockStructHelper('h4', ' a')))
      ])),
      Step.label('H5 format on single word node using enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '##### a'),
        Step.label('Check h5 format was applied', tinyApis.sAssertContentStructure(Utils.blockStructHelper('h5', ' a')))
      ])),
      Step.label('H6 format on single word node using enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '###### a'),
        Step.label('Check h6 format was applied', tinyApis.sAssertContentStructure(Utils.blockStructHelper('h6', ' a')))
      ])),
      Step.label('OL format on single word node using enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '1. a'),
        tinyApis.sAssertContentPresence({ ol: 1, li: 2 })
      ])),
      Step.label('UL format on single word node using enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '* a'),
        tinyApis.sAssertContentPresence({ ul: 1, li: 2 })
      ])),
      Step.label('enter with uncollapsed range does not insert list', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>* ab</p>'),
        tinyApis.sFocus,
        tinyApis.sSetSelection([0, 0], 3, [0, 0], 4),
        tinyActions.sContentKeystroke(Keys.enter(), {}),
        tinyApis.sAssertContentPresence({ ul: 0 })
      ])),
      Step.label('enter with only pattern does not insert list', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>*</p>'),
        tinyApis.sFocus,
        tinyApis.sSetCursor([0, 0], 1),
        tinyActions.sContentKeystroke(Keys.enter(), {}),
        tinyApis.sAssertContentPresence({ ul: 0 })
      ])),
      Step.label('inline format with fragmented start sequence', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '<span data-mce-spellcheck="invalid">*</span>*a**', 4, [0, 1]),
        Step.label('Check bold format was applied', tinyApis.sAssertContentStructure(Utils.inlineBlockStructHelper('strong', 'a')))
      ])),
      Step.label('inline format with fragmented end sequence', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '**a*<span data-mce-spellcheck="invalid">*</span>', 1, [0, 1]),
        Step.label('Check bold format was applied', tinyApis.sAssertContentStructure(Utils.inlineBlockStructHelper('strong', 'a')))
      ])),
      Step.label('block format with fragmented start sequence', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '<span data-mce-spellcheck="invalid">1</span>. a', 3, [0, 1]),
        tinyApis.sAssertContentPresence({ ol: 1, li: 2 })
      ])),
      Step.label('getPatterns/setPatterns', Step.sync(function () {
        // Store the original patterns
        const origPatterns = editor.plugins.textpattern.getPatterns();

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

        // Restore the original patterns
        editor.plugins.textpattern.setPatterns(origPatterns);
      }))
    ].concat(browserSpecificTests), tinyApis.sSetContent(''));

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    plugins: 'textpattern lists',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
