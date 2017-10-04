asynctest(
  'browser.tinymce.core.delete.CefDeleteTest',
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyActions',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'tinymce.themes.modern.Theme'
  ],
  function (ApproxStructure, GeneralSteps, Keyboard, Keys, Logger, Pipeline, Step, TinyActions, TinyApis, TinyLoader, Element, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sKeyUp = function (editor, key) {
      var iDoc = Element.fromDom(editor.getDoc());
      return Keyboard.sKeyup(iDoc, key, {});
    };

    var sFakeBackspaceKeyOnRange = function (editor) {
      return GeneralSteps.sequence([
        Step.sync(function () {
          editor.getDoc().execCommand('Delete', false, null);
        }),
        sKeyUp(editor, Keys.backspace())
      ]);
    };

    var sTestDeletePadd = function (editor, tinyApis, tinyActions) {
      return GeneralSteps.sequence([
        tinyApis.sFocus,
        Logger.t('Should padd empty ce=true inside ce=false when everything is deleted', GeneralSteps.sequence([
          tinyApis.sSetContent('<div contenteditable="false">a<p contenteditable="true">a</p>b</div>'),
          tinyApis.sSetSelection([0, 1, 0], 0, [0, 1, 0], 1),
          sFakeBackspaceKeyOnRange(editor),
          tinyApis.sAssertContentStructure(
            ApproxStructure.build(function (s, str, arr) {
              return s.element('body', {
                children: [
                  s.element('div', {
                    children: [
                      s.text(str.is('a')),
                      s.element('p', {
                        children: [
                          s.element('br', {
                            attrs: {
                              'data-mce-bogus': str.is('1')
                            }
                          })
                        ]
                      }),
                      s.text(str.is('b'))
                    ]
                  })
                ]
              });
            })
          )
        ])),

        Logger.t('Should not padd an non empty ce=true inside ce=false', GeneralSteps.sequence([
          tinyApis.sSetContent('<div contenteditable="false">a<p contenteditable="true">ab</p>b</div>'),
          tinyApis.sSetSelection([0, 1, 0], 0, [0, 1, 0], 1),
          sFakeBackspaceKeyOnRange(editor),
          tinyApis.sAssertContentStructure(
            ApproxStructure.build(function (s, str, arr) {
              return s.element('body', {
                children: [
                  s.element('div', {
                    children: [
                      s.text(str.is('a')),
                      s.element('p', {
                        children: [
                          s.text(str.is('b'))
                        ]
                      }),
                      s.text(str.is('b'))
                    ]
                  })
                ]
              });
            })
          )
        ])),

        Logger.t('Should padd editor with paragraph and br if the editor is empty after delete of a cef element', GeneralSteps.sequence([
          tinyApis.sSetContent('<div contenteditable="false">a</div>'),
          tinyApis.sSetSelection([], 0, [], 1),
          tinyActions.sContentKeystroke(Keys.backspace(), {}),
          tinyApis.sAssertSelection([0], 0, [0], 0),
          tinyApis.sAssertContentStructure(
            ApproxStructure.build(function (s, str, arr) {
              return s.element('body', {
                children: [
                  s.element('p', {
                    children: [
                      s.element('br', {
                        attrs: {
                          'data-mce-bogus': str.is('1')
                        }
                      })
                    ]
                  })
                ]
              });
            })
          )
        ]))
      ]);
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        sTestDeletePadd(editor, tinyApis, tinyActions)
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);