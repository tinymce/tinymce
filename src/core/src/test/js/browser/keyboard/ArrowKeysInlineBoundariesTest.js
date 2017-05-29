asynctest(
  'browser.tinymce.core.keyboard.ArrowKeysInlineBoundariesTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyActions',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.text.Zwsp',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, GeneralSteps, Keys, Logger, Pipeline, Step, TinyActions, TinyApis, TinyLoader, Zwsp, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sAssertCaretAtZwsp = function (editor) {
      return Step.sync(function () {
        var rng = editor.selection.getRng();
        var sc = rng.startContainer, so = rng.startOffset;
        var chr = sc.data.substr(so, 1);
        Assertions.assertEq('Should be zwsp at caret', chr, Zwsp.ZWSP);
      });
    };

    var sAssertCaretAfterZwsp = function (editor) {
      return Step.sync(function () {
        var rng = editor.selection.getRng();
        var sc = rng.startContainer, so = rng.startOffset;
        var chr = sc.data.substr(so - 1, 1);
        Assertions.assertEq('Should be after a zwsp at caret', chr, Zwsp.ZWSP);
      });
    };

    var sSetRawContent = function (editor, html) {
      return Step.sync(function () {
        editor.getBody().innerHTML = html;
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('Arrow keys anchor with text', GeneralSteps.sequence([
          Logger.t('From start to end inside anchor over text', GeneralSteps.sequence([
            sSetRawContent(editor, '<p><a href="#">x</a></p>'),
            tinyApis.sSetCursor([0, 0, 0], 0),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1),
            sAssertCaretAtZwsp(editor)
          ])),
          Logger.t('From start to before anchor with text', GeneralSteps.sequence([
            sSetRawContent(editor, '<p><a href="#">x</a></p>'),
            tinyApis.sSetCursor([0, 0, 0], 0),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
            sAssertCaretAtZwsp(editor)
          ])),
          Logger.t('From end to after anchor with text', GeneralSteps.sequence([
            sSetRawContent(editor, '<p><a href="#">x</a></p>'),
            tinyApis.sSetCursor([0, 0, 0], 1),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
            sAssertCaretAfterZwsp(editor)
          ])),
          Logger.t('From end to start inside anchor over text', GeneralSteps.sequence([
            sSetRawContent(editor, '<p><a href="#">x</a></p>'),
            tinyApis.sSetCursor([0, 0, 0], 1),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1),
            sAssertCaretAfterZwsp(editor)
          ]))
        ])),

        Logger.t('Arrow keys anchor with image', GeneralSteps.sequence([
          Logger.t('From start to end inside anchor over img', GeneralSteps.sequence([
            sSetRawContent(editor, '<p><a href="#"><img src="#"></a></p>'),
            tinyApis.sSetCursor([0, 0], 0),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sAssertSelection([0, 0, 1], 0, [0, 0, 1], 0),
            sAssertCaretAtZwsp(editor)
          ])),
          Logger.t('From start to before on anchor with img', GeneralSteps.sequence([
            sSetRawContent(editor, '<p><a href="#"><img src="#"></a></p>'),
            tinyApis.sSetCursor([0, 0], 0),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
            sAssertCaretAtZwsp(editor)
          ])),
          Logger.t('From end to after on anchor with img', GeneralSteps.sequence([
            sSetRawContent(editor, '<p><a href="#"><img src="#"></a></p>'),
            tinyApis.sSetCursor([0, 0], 1),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
            sAssertCaretAfterZwsp(editor)
          ])),
          Logger.t('From end to start inside anchor over img', GeneralSteps.sequence([
            sSetRawContent(editor, '<p><a href="#"><img src="#"></a></p>'),
            tinyApis.sSetCursor([0, 0], 1),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1),
            sAssertCaretAfterZwsp(editor)
          ]))
        ])),

        Logger.t('Arrow keys between blocks', GeneralSteps.sequence([
          Logger.t('From end of anchor text to after anchor to start of anchor in next paragraph', GeneralSteps.sequence([
            sSetRawContent(editor, '<p><a href="#">a</a></p><p><a href="#">b</a></p>'),
            tinyApis.sSetCursor([0, 0, 0], 1),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sSetCursor([0, 1], 1),
            sAssertCaretAfterZwsp(editor),
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sAssertSelection([1, 0, 0], 1, [1, 0, 0], 1),
            sAssertCaretAfterZwsp(editor)
          ])),
          Logger.t('From start of anchor text to before anchor to end of anchor in previous paragraph', GeneralSteps.sequence([
            sSetRawContent(editor, '<p><a href="#">a</a></p><p><a href="#">b</a></p>'),
            tinyApis.sSetCursor([1, 0, 0], 0),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sSetCursor([1, 0], 0),
            sAssertCaretAtZwsp(editor),
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1),
            sAssertCaretAtZwsp(editor)
          ])),
          Logger.t('From end of anchor text to after anchor to but not to next paragraph', GeneralSteps.sequence([
            sSetRawContent(editor, '<p><a href="#">a</a></p><p>b<a href="#">c</a></p>'),
            tinyApis.sSetCursor([0, 0, 0], 1),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sSetCursor([0, 1], 1),
            sAssertCaretAfterZwsp(editor),
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
            sAssertCaretAfterZwsp(editor)
          ])),
          Logger.t('From start of anchor text to before anchor to end of anchor but not to previous paragraph', GeneralSteps.sequence([
            sSetRawContent(editor, '<p><a href="#">a</a>b</p><p><a href="#">c</a></p>'),
            tinyApis.sSetCursor([1, 0, 0], 0),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sSetCursor([1, 0], 0),
            sAssertCaretAtZwsp(editor),
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sAssertSelection([1, 0], 0, [1, 0], 0),
            sAssertCaretAtZwsp(editor)
          ]))
        ])),

        Logger.t('Arrow keys between lists', GeneralSteps.sequence([
          Logger.t('From end of anchor text to after anchor to start of anchor in next list item', GeneralSteps.sequence([
            sSetRawContent(editor, '<ul><li><a href="#">a</a></li><li><a href="#">b</a></li></ul>'),
            tinyApis.sSetCursor([0, 0, 0, 0], 1),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sSetCursor([0, 0, 1], 1),
            sAssertCaretAfterZwsp(editor),
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sAssertSelection([0, 1, 0, 0], 1, [0, 1, 0, 0], 1),
            sAssertCaretAfterZwsp(editor)
          ])),
          Logger.t('From start of anchor text to before anchor to end of anchor in previous list item', GeneralSteps.sequence([
            sSetRawContent(editor, '<ul><li><a href="#">a</a></li><li><a href="#">b</a></li></ul>'),
            tinyApis.sSetCursor([0, 1, 0, 0], 0),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sSetCursor([0, 1, 0], 0),
            sAssertCaretAtZwsp(editor),
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sAssertSelection([0, 0, 0, 0], 1, [0, 0, 0, 0], 1),
            sAssertCaretAtZwsp(editor)
          ])),
          Logger.t('From end of anchor text to after anchor to but not to next list item', GeneralSteps.sequence([
            sSetRawContent(editor, '<ul><li><a href="#">a</a></li><li>b<a href="#">c</a></li></ul>'),
            tinyApis.sSetCursor([0, 0, 0, 0], 1),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sSetCursor([0, 0, 1], 1),
            sAssertCaretAfterZwsp(editor),
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sAssertSelection([0, 0, 1], 1, [0, 0, 1], 1),
            sAssertCaretAfterZwsp(editor)
          ])),
          Logger.t('From start of anchor text to before anchor to end of anchor but not to previous list item', GeneralSteps.sequence([
            sSetRawContent(editor, '<ul><li><a href="#">a</a>b</li><li><a href="#">c</a></li></ul>'),
            tinyApis.sSetCursor([0, 1, 0, 0], 0),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sSetCursor([0, 1, 0], 0),
            sAssertCaretAtZwsp(editor),
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sAssertSelection([0, 1, 0], 0, [0, 1, 0], 0),
            sAssertCaretAtZwsp(editor)
          ])),
          Logger.t('From start of anchor to before anchor but not to previous list item anchor', GeneralSteps.sequence([
            sSetRawContent(editor, '<ul><li><a href="#">a</a></li><li>b<a href="#">c</a></li></ul>'),
            tinyApis.sSetCursor([0, 1, 1, 0], 0),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sSetCursor([0, 1, 0], 1),
            sAssertCaretAtZwsp(editor),
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sAssertSelection([0, 1, 0], 1, [0, 1, 0], 1),
            sAssertCaretAtZwsp(editor)
          ])),
          Logger.t('From end of anchor to after anchor but not to next list item anchor', GeneralSteps.sequence([
            sSetRawContent(editor, '<ul><li><a href="#">a</a>b</li><li><a href="#">c</a></li></ul>'),
            tinyApis.sSetCursor([0, 0, 0, 0], 1),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sSetCursor([0, 0, 1], 1),
            sAssertCaretAfterZwsp(editor),
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sAssertSelection([0, 0, 1], 1, [0, 0, 1], 1),
            sAssertCaretAfterZwsp(editor)
          ])),

          Logger.t('Arrow keys at anchor + code', GeneralSteps.sequence([
            Logger.t('From start to end inside anchor + code over text', GeneralSteps.sequence([
              sSetRawContent(editor, '<p><a href="#"><code>x</code></a></p>'),
              tinyApis.sSetCursor([0, 0, 0, 0], 0),
              tinyApis.sNodeChanged,
              tinyActions.sContentKeystroke(Keys.right(), { }),
              tinyApis.sAssertSelection([0, 0, 0, 0], 1, [0, 0, 0, 0], 1),
              sAssertCaretAtZwsp(editor)
            ])),
            Logger.t('From start to before anchor + code with text', GeneralSteps.sequence([
              sSetRawContent(editor, '<p><a href="#"><code>x</code></a></p>'),
              tinyApis.sSetCursor([0, 0, 0, 0], 0),
              tinyApis.sNodeChanged,
              tinyActions.sContentKeystroke(Keys.left(), { }),
              tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
              sAssertCaretAtZwsp(editor)
            ])),
            Logger.t('From end to after anchor + code with text', GeneralSteps.sequence([
              sSetRawContent(editor, '<p><a href="#"><code>x</code></a></p>'),
              tinyApis.sSetCursor([0, 0, 0, 0], 1),
              tinyApis.sNodeChanged,
              tinyActions.sContentKeystroke(Keys.right(), { }),
              tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
              sAssertCaretAfterZwsp(editor)
            ])),
            Logger.t('From end to start inside anchor + code over text', GeneralSteps.sequence([
              sSetRawContent(editor, '<p><a href="#"><code>x</code></a></p>'),
              tinyApis.sSetCursor([0, 0, 0, 0], 1),
              tinyApis.sNodeChanged,
              tinyActions.sContentKeystroke(Keys.left(), { }),
              tinyApis.sAssertSelection([0, 0, 0, 0], 1, [0, 0, 0, 0], 1),
              sAssertCaretAfterZwsp(editor)
            ]))
          ]))
        ]))
      ], onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);