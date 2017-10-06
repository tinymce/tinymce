asynctest(
  'browser.tinymce.plugins.textpattern.TextPatternPluginTest',
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyActions',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.plugins.textpattern.Plugin',
    'tinymce.plugins.textpattern.test.Utils',
    'tinymce.themes.modern.Theme'
  ],
  function (ApproxStructure, Assertions, GeneralSteps, Keys, Logger, Pipeline, Step, TinyActions, TinyApis, TinyLoader, TextpatternPlugin, Utils, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    TextpatternPlugin();
    Theme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyActions = TinyActions(editor);

      var steps = Utils.withTeardown([
        Logger.t('space on ** without content does nothing', GeneralSteps.sequence([
          Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '**'),
          tinyApis.sAssertContent('<p>**&nbsp;</p>')
        ])),
        Logger.t('Italic format on single word using space', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>*a&nbsp; *\u00a0</p>'),
          tinyApis.sFocus,
          tinyApis.sSetCursor([0, 0], 6),
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
        ])),
        Logger.t('Italic format on single word using space', GeneralSteps.sequence([
          Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '*a*'),
          tinyApis.sAssertContentStructure(Utils.inlineStructHelper('em', 'a'))
        ])),
        Logger.t('Bold format on single word using space', GeneralSteps.sequence([
          Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '**a**'),
          tinyApis.sAssertContentStructure(Utils.inlineStructHelper('strong', 'a'))
        ])),
        Logger.t('Bold/italic format on single word using space', GeneralSteps.sequence([
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
        ])),
        Logger.t('Bold format on multiple words using space', GeneralSteps.sequence([
          Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '**a b**'),
          tinyApis.sAssertContentStructure(Utils.inlineStructHelper('strong', 'a b'))
        ])),
        Logger.t('Bold format on single word using enter', GeneralSteps.sequence([
          Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '**a**'),
          tinyApis.sAssertContentStructure(Utils.inlineBlockStructHelper('strong', 'a'))
        ])),
        Logger.t('Bold/italic format on single word using enter', GeneralSteps.sequence([
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
        ])),
        Logger.t('H1 format on single word node using enter', GeneralSteps.sequence([
          Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '# a'),
          tinyApis.sAssertContentStructure(Utils.blockStructHelper('h1', ' a'))
        ])),
        Logger.t('H2 format on single word node using enter', GeneralSteps.sequence([
          Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '## a'),
          tinyApis.sAssertContentStructure(Utils.blockStructHelper('h2', ' a'))
        ])),
        Logger.t('H3 format on single word node using enter', GeneralSteps.sequence([
          Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '### a'),
          tinyApis.sAssertContentStructure(Utils.blockStructHelper('h3', ' a'))
        ])),
        Logger.t('H4 format on single word node using enter', GeneralSteps.sequence([
          Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '#### a'),
          tinyApis.sAssertContentStructure(Utils.blockStructHelper('h4', ' a'))
        ])),
        Logger.t('H5 format on single word node using enter', GeneralSteps.sequence([
          Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '##### a'),
          tinyApis.sAssertContentStructure(Utils.blockStructHelper('h5', ' a'))
        ])),
        Logger.t('H6 format on single word node using enter', GeneralSteps.sequence([
          Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '###### a'),
          tinyApis.sAssertContentStructure(Utils.blockStructHelper('h6', ' a'))
        ])),
        Logger.t('OL format on single word node using enter', GeneralSteps.sequence([
          Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '1. a'),
          tinyApis.sAssertContentPresence({ 'ol': 1, 'li':2 })
        ])),
        Logger.t('UL format on single word node using enter', GeneralSteps.sequence([
          Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '* a'),
          tinyApis.sAssertContentPresence({ 'ul': 1, 'li':2 })
        ])),
        Logger.t('enter with uncollapsed range does not insert list', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>* ab</p>'),
          tinyApis.sFocus,
          tinyApis.sSetSelection([0, 0], 3, [0, 0], 4),
          tinyActions.sContentKeystroke(Keys.enter(), {}),
          tinyApis.sAssertContentPresence({ 'ul': 0 })
        ])),
        Logger.t('enter with only pattern does not insert list', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>*</p>'),
          tinyApis.sFocus,
          tinyApis.sSetCursor([0, 0], 1),
          tinyActions.sContentKeystroke(Keys.enter(), {}),
          tinyApis.sAssertContentPresence({ 'ul': 0 })
        ])),
        Logger.t('test inline and block at the same time', GeneralSteps.sequence([
          Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '* **important list**'),
          tinyApis.sAssertContentPresence({ 'ul':1, 'strong': 2 })
        ])),
        Logger.t('getPatterns/setPatterns', Step.sync(function () {
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
                "format": "h1",
                "start": "#"
              },
              {
                "format": "h2",
                "start": "##"
              },

              {
                "format": "h3",
                "start": "###"
              }
            ]
            );
        }))
      ], tinyApis.sSetContent(''));

      Pipeline.async({}, steps, onSuccess, onFailure);
    }, {
      plugins: 'textpattern',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);