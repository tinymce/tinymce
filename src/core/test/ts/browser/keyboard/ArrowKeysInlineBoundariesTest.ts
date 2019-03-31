import { Assertions, GeneralSteps, Keys, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import WordSelection from 'tinymce/core/selection/WordSelection';
import Zwsp from 'tinymce/core/text/Zwsp';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest(
  'browser.tinymce.core.keyboard.ArrowKeysInlineBoundariesTest',
  function () {
    const success = arguments[arguments.length - 2];
    const failure = arguments[arguments.length - 1];
    const os = PlatformDetection.detect().os;

    Theme();

    const sAssertCaretAtZwsp = function (editor) {
      return Step.sync(function () {
        const rng = editor.selection.getRng();
        const sc = rng.startContainer, so = rng.startOffset;
        const chr = sc.data.substr(so, 1);
        Assertions.assertEq('Should be zwsp at caret', chr, Zwsp.ZWSP);
      });
    };

    const sAssertCaretAfterZwsp = function (editor) {
      return Step.sync(function () {
        const rng = editor.selection.getRng();
        const sc = rng.startContainer, so = rng.startOffset;
        const chr = sc.data.substr(so - 1, 1);
        Assertions.assertEq('Should be after a zwsp at caret', chr, Zwsp.ZWSP);
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      const tinyApis = TinyApis(editor);
      const tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('Arrow keys anchor with text', GeneralSteps.sequence([
          Logger.t('From start to end inside anchor over text', GeneralSteps.sequence([
            tinyApis.sSetRawContent('<p><a href="#">x</a></p>'),
            tinyApis.sSetCursor([0, 0, 0], 0),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1),
            sAssertCaretAtZwsp(editor)
          ])),
          Logger.t('From start to before anchor with text', GeneralSteps.sequence([
            tinyApis.sSetRawContent('<p><a href="#">x</a></p>'),
            tinyApis.sSetCursor([0, 0, 0], 0),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
            sAssertCaretAtZwsp(editor)
          ])),
          Logger.t('From end to after anchor with text', GeneralSteps.sequence([
            tinyApis.sSetRawContent('<p><a href="#">x</a></p>'),
            tinyApis.sSetCursor([0, 0, 0], 1),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
            sAssertCaretAfterZwsp(editor)
          ])),
          Logger.t('From end to start inside anchor over text', GeneralSteps.sequence([
            tinyApis.sSetRawContent('<p><a href="#">x</a></p>'),
            tinyApis.sSetCursor([0, 0, 0], 1),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1),
            sAssertCaretAfterZwsp(editor)
          ]))
        ])),

        Logger.t('Arrow keys anchor with image', GeneralSteps.sequence([
          Logger.t('From start to end inside anchor over img', GeneralSteps.sequence([
            tinyApis.sSetRawContent('<p><a href="#"><img src="#"></a></p>'),
            tinyApis.sSetCursor([0, 0], 0),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sAssertSelection([0, 0, 1], 0, [0, 0, 1], 0),
            sAssertCaretAtZwsp(editor)
          ])),
          Logger.t('From start to before on anchor with img', GeneralSteps.sequence([
            tinyApis.sSetRawContent('<p><a href="#"><img src="#"></a></p>'),
            tinyApis.sSetCursor([0, 0], 0),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
            sAssertCaretAtZwsp(editor)
          ])),
          Logger.t('From end to after on anchor with img', GeneralSteps.sequence([
            tinyApis.sSetRawContent('<p><a href="#"><img src="#"></a></p>'),
            tinyApis.sSetCursor([0, 0], 1),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.right(), { }),
            tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
            sAssertCaretAfterZwsp(editor)
          ])),
          Logger.t('From end to start inside anchor over img', GeneralSteps.sequence([
            tinyApis.sSetRawContent('<p><a href="#"><img src="#"></a></p>'),
            tinyApis.sSetCursor([0, 0], 1),
            tinyApis.sNodeChanged,
            tinyActions.sContentKeystroke(Keys.left(), { }),
            tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1),
            sAssertCaretAfterZwsp(editor)
          ]))
        ])),

        Logger.t('Arrow keys between blocks', GeneralSteps.sequence([
          Logger.t('From end of anchor text to after anchor to start of anchor in next paragraph', GeneralSteps.sequence([
            tinyApis.sSetRawContent('<p><a href="#">a</a></p><p><a href="#">b</a></p>'),
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
            tinyApis.sSetRawContent('<p><a href="#">a</a></p><p><a href="#">b</a></p>'),
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
            tinyApis.sSetRawContent('<p><a href="#">a</a></p><p>b<a href="#">c</a></p>'),
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
            tinyApis.sSetRawContent('<p><a href="#">a</a>b</p><p><a href="#">c</a></p>'),
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
            tinyApis.sSetRawContent('<ul><li><a href="#">a</a></li><li><a href="#">b</a></li></ul>'),
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
            tinyApis.sSetRawContent('<ul><li><a href="#">a</a></li><li><a href="#">b</a></li></ul>'),
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
            tinyApis.sSetRawContent('<ul><li><a href="#">a</a></li><li>b<a href="#">c</a></li></ul>'),
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
            tinyApis.sSetRawContent('<ul><li><a href="#">a</a>b</li><li><a href="#">c</a></li></ul>'),
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
            tinyApis.sSetRawContent('<ul><li><a href="#">a</a></li><li>b<a href="#">c</a></li></ul>'),
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
            tinyApis.sSetRawContent('<ul><li><a href="#">a</a>b</li><li><a href="#">c</a></li></ul>'),
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
              tinyApis.sSetRawContent('<p><a href="#"><code>x</code></a></p>'),
              tinyApis.sSetCursor([0, 0, 0, 0], 0),
              tinyApis.sNodeChanged,
              tinyActions.sContentKeystroke(Keys.right(), { }),
              tinyApis.sAssertSelection([0, 0, 0, 0], 1, [0, 0, 0, 0], 1),
              sAssertCaretAtZwsp(editor)
            ])),
            Logger.t('From start to before anchor + code with text', GeneralSteps.sequence([
              tinyApis.sSetRawContent('<p><a href="#"><code>x</code></a></p>'),
              tinyApis.sSetCursor([0, 0, 0, 0], 0),
              tinyApis.sNodeChanged,
              tinyActions.sContentKeystroke(Keys.left(), { }),
              tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
              sAssertCaretAtZwsp(editor)
            ])),
            Logger.t('From end to after anchor + code with text', GeneralSteps.sequence([
              tinyApis.sSetRawContent('<p><a href="#"><code>x</code></a></p>'),
              tinyApis.sSetCursor([0, 0, 0, 0], 1),
              tinyApis.sNodeChanged,
              tinyActions.sContentKeystroke(Keys.right(), { }),
              tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
              sAssertCaretAfterZwsp(editor)
            ])),
            Logger.t('From end to start inside anchor + code over text', GeneralSteps.sequence([
              tinyApis.sSetRawContent('<p><a href="#"><code>x</code></a></p>'),
              tinyApis.sSetCursor([0, 0, 0, 0], 1),
              tinyApis.sNodeChanged,
              tinyActions.sContentKeystroke(Keys.left(), { }),
              tinyApis.sAssertSelection([0, 0, 0, 0], 1, [0, 0, 0, 0], 1),
              sAssertCaretAfterZwsp(editor)
            ]))
          ])),

          Logger.t('Ctrl+arrow keys at anchor', GeneralSteps.sequence(
            WordSelection.hasSelectionModifyApi(editor) ? [
              Logger.t('Ctrl+Arrow right from inline boundary to next word', GeneralSteps.sequence([
                tinyApis.sSetRawContent('<p>aa <a href="#">bb</a> cc</p>'),
                tinyApis.sSetCursor([0, 1, 0], 2),
                tinyApis.sNodeChanged,
                tinyActions.sContentKeystroke(Keys.right(), { ctrl: !os.isOSX(), alt: os.isOSX() }),
                tinyApis.sAssertSelection([0, 2], 3, [0, 2], 3)
              ])),
              Logger.t('Ctrl+Arrow left from inline boundary to previous word', GeneralSteps.sequence([
                tinyApis.sSetRawContent('<p>aa <a href="#">bb</a> cc</p>'),
                tinyApis.sSetCursor([0, 1, 0], 0),
                tinyApis.sNodeChanged,
                tinyActions.sContentKeystroke(Keys.left(), { ctrl: !os.isOSX(), alt: os.isOSX() }),
                tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0)
              ]))
            ] : []
          ))
        ]))
      ], onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      base_url: '/project/tinymce/js/tinymce'
    }, success, failure);
  }
);
