asynctest(
  'browser.tinymce.plugins.paste.InternalClipboardTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.plugins.paste.core.CutCopy',
    'tinymce.plugins.paste.test.MockDataTransfer'
  ],
  function (GeneralSteps, Logger, Pipeline, RawAssertions, Step, TinyApis, TinyLoader, CutCopy, MockDataTransfer) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var dataTransfer;

    var sDataTransferEvent = function (editor, type) {
      return Step.sync(function () {
        dataTransfer = MockDataTransfer.create({});
        editor.fire(type, { clipboardData: dataTransfer });
      });
    };

    var sAssertClipboardData = function (expectedHtml, expectedText) {
      return Step.sync(function () {
        RawAssertions.assertEq('text/html data should match', expectedHtml, dataTransfer.getData('text/html'));
        RawAssertions.assertEq('text/plain data should match', expectedText, dataTransfer.getData('text/plain'));
      });
    };

    var sCopy = function (editor, tinyApis, html, spath, soffset, fpath, foffset) {
      return GeneralSteps.sequence([
        tinyApis.sSetContent(html),
        tinyApis.sSetSelection(spath, soffset, fpath, foffset),
        sDataTransferEvent(editor, 'copy')
      ]);
    };

    var sCut = function (editor, tinyApis, html, spath, soffset, fpath, foffset) {
      return GeneralSteps.sequence([
        tinyApis.sSetContent(html),
        tinyApis.sSetSelection(spath, soffset, fpath, foffset),
        sDataTransferEvent(editor, 'cut')
      ]);
    };

    var sTestCopy = function (editor, tinyApis) {
      return Logger.t('Copy tests', GeneralSteps.sequence([
        Logger.t('Copy simple text', GeneralSteps.sequence([
          sCopy(editor, tinyApis, '<p>text</p>', [0, 0], 0, [0, 0], 4),
          sAssertClipboardData('text', 'text'),
          tinyApis.sAssertContent('<p>text</p>'),
          tinyApis.sAssertSelection([0, 0], 0, [0, 0], 4)
        ])),

        Logger.t('Copy inline elements', GeneralSteps.sequence([
          sCopy(editor, tinyApis, '<p>te<em>x</em>t</p>', [0, 0], 0, [0, 2], 1),
          sAssertClipboardData('te<em>x</em>t', 'text'),
          tinyApis.sAssertContent('<p>te<em>x</em>t</p>'),
          tinyApis.sAssertSelection([0, 0], 0, [0, 2], 1)
        ])),

        Logger.t('Copy partialy selected inline elements', GeneralSteps.sequence([
          sCopy(editor, tinyApis, '<p>a<em>cd</em>e</p>', [0, 0], 0, [0, 1, 0], 1),
          sAssertClipboardData('a<em>c</em>', 'ac'),
          tinyApis.sAssertContent('<p>a<em>cd</em>e</p>'),
          tinyApis.sAssertSelection([0, 0], 0, [0, 1, 0], 1)
        ])),

        Logger.t('Copy collapsed selection', GeneralSteps.sequence([
          sCopy(editor, tinyApis, '<p>abc</p>', [0, 0], 1, [0, 0], 1),
          sAssertClipboardData('', ''),
          tinyApis.sAssertContent('<p>abc</p>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ]))
      ]));
    };

    var sTestCut = function (editor, tinyApis) {
      return Logger.t('Cut tests', GeneralSteps.sequence([
        Logger.t('Cut simple text', GeneralSteps.sequence([
          sCut(editor, tinyApis, '<p>text</p>', [0, 0], 0, [0, 0], 4),
          sAssertClipboardData('text', 'text'),
          tinyApis.sAssertContent(''),
          tinyApis.sAssertSelection([0], 0, [0], 0)
        ])),

        Logger.t('Cut inline elements', GeneralSteps.sequence([
          sCut(editor, tinyApis, '<p>te<em>x</em>t</p>', [0, 0], 0, [0, 2], 1),
          sAssertClipboardData('te<em>x</em>t', 'text'),
          tinyApis.sAssertContent(''),
          tinyApis.sAssertSelection([0], 0, [0], 0)
        ])),

        Logger.t('Cut partialy selected inline elements', GeneralSteps.sequence([
          sCut(editor, tinyApis, '<p>a<em>cd</em>e</p>', [0, 0], 0, [0, 1, 0], 1),
          sAssertClipboardData('a<em>c</em>', 'ac'),
          tinyApis.sAssertContent('<p><em>d</em>e</p>'),
          tinyApis.sAssertSelection([0, 0, 0], 0, [0, 0, 0], 0)
        ])),

        Logger.t('Cut collapsed selection', GeneralSteps.sequence([
          sCut(editor, tinyApis, '<p>abc</p>', [0, 0], 1, [0, 0], 1),
          sAssertClipboardData('', ''),
          tinyApis.sAssertContent('<p>abc</p>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ]))
      ]));
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      CutCopy.register(editor);

      Pipeline.async({}, [
        sTestCopy(editor, tinyApis),
        sTestCut(editor, tinyApis)
      ], onSuccess, onFailure);
    }, {
    }, success, failure);
  }
);
