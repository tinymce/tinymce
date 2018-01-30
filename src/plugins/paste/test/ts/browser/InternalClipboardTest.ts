import { GeneralSteps, Logger, Pipeline, RawAssertions, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import InternalHtml from 'tinymce/plugins/paste/core/InternalHtml';
import Utils from 'tinymce/plugins/paste/core/Utils';
import Plugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

import MockDataTransfer from '../module/test/MockDataTransfer';

UnitTest.asynctest('browser.tinymce.plugins.paste.InternalClipboardTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  let dataTransfer, lastPreProcessEvent, lastPostProcessEvent;

  Plugin();
  Theme();

  const sResetProcessEvents = Step.sync(function () {
    lastPreProcessEvent = null;
    lastPostProcessEvent = null;
  });

  const sCutCopyDataTransferEvent = function (editor, type) {
    return Step.sync(function () {
      dataTransfer = MockDataTransfer.create({});
      editor.fire(type, { clipboardData: dataTransfer });
    });
  };

  const sPasteDataTransferEvent = function (editor, data) {
    return Step.sync(function () {
      dataTransfer = MockDataTransfer.create(data);
      editor.fire('paste', { clipboardData: dataTransfer });
    });
  };

  const sAssertClipboardData = function (expectedHtml, expectedText) {
    return Step.sync(function () {
      RawAssertions.assertEq('text/html data should match', expectedHtml, dataTransfer.getData('text/html'));
      RawAssertions.assertEq('text/plain data should match', expectedText, dataTransfer.getData('text/plain'));
    });
  };

  const sCopy = function (editor, tinyApis, html, spath, soffset, fpath, foffset) {
    return GeneralSteps.sequence([
      tinyApis.sSetContent(html),
      tinyApis.sSetSelection(spath, soffset, fpath, foffset),
      sCutCopyDataTransferEvent(editor, 'copy')
    ]);
  };

  const sCut = function (editor, tinyApis, html, spath, soffset, fpath, foffset) {
    return GeneralSteps.sequence([
      tinyApis.sSetContent(html),
      tinyApis.sSetSelection(spath, soffset, fpath, foffset),
      sCutCopyDataTransferEvent(editor, 'cut')
    ]);
  };

  const sPaste = function (editor, tinyApis, startHtml, pasteData, spath, soffset, fpath, foffset) {
    return GeneralSteps.sequence([
      tinyApis.sSetContent(startHtml),
      tinyApis.sSetSelection(spath, soffset, fpath, foffset),
      sResetProcessEvents,
      sPasteDataTransferEvent(editor, pasteData)
    ]);
  };

  const sTestCopy = function (editor, tinyApis) {
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

  const sTestCut = function (editor, tinyApis) {
    const sWaitUntilAssertContent = function (expected) {
      return Waiter.sTryUntil('Cut is async now, so need to wait for content', tinyApis.sAssertContent(expected), 100, 1000);
    };

    return Logger.t('Cut tests', GeneralSteps.sequence([
      Logger.t('Cut simple text', GeneralSteps.sequence([
        sCut(editor, tinyApis, '<p>text</p>', [0, 0], 0, [0, 0], 4),
        sAssertClipboardData('text', 'text'),
        sWaitUntilAssertContent(''),
        tinyApis.sAssertSelection([0], 0, [0], 0)
      ])),

      Logger.t('Cut inline elements', GeneralSteps.sequence([
        sCut(editor, tinyApis, '<p>te<em>x</em>t</p>', [0, 0], 0, [0, 2], 1),
        sAssertClipboardData('te<em>x</em>t', 'text'),
        sWaitUntilAssertContent(''),
        tinyApis.sAssertSelection([0], 0, [0], 0)
      ])),

      Logger.t('Cut partialy selected inline elements', GeneralSteps.sequence([
        sCut(editor, tinyApis, '<p>a<em>cd</em>e</p>', [0, 0], 0, [0, 1, 0], 1),
        sAssertClipboardData('a<em>c</em>', 'ac'),
        sWaitUntilAssertContent('<p><em>d</em>e</p>'),
        tinyApis.sAssertSelection([0, 0, 0], 0, [0, 0, 0], 0)
      ])),

      Logger.t('Cut collapsed selection', GeneralSteps.sequence([
        sCut(editor, tinyApis, '<p>abc</p>', [0, 0], 1, [0, 0], 1),
        sAssertClipboardData('', ''),
        sWaitUntilAssertContent('<p>abc</p>'),
        tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
      ]))
    ]));
  };

  const sAssertLastPreProcessEvent = function (expectedData) {
    return Step.sync(function () {
      RawAssertions.assertEq('Internal property should be equal', expectedData.internal, lastPreProcessEvent.internal);
      RawAssertions.assertEq('Content property should be equal', expectedData.content, lastPreProcessEvent.content);
    });
  };

  const sAssertLastPostProcessEvent = function (expectedData) {
    return Step.sync(function () {
      RawAssertions.assertEq('Internal property should be equal', expectedData.internal, lastPostProcessEvent.internal);
      RawAssertions.assertEq('Content property should be equal', expectedData.content, lastPostProcessEvent.node.innerHTML);
    });
  };

  const sWaitForProcessEvents = Waiter.sTryUntil('Did not get any events fired', Step.sync(function () {
    RawAssertions.assertEq('PastePreProcess event object', lastPreProcessEvent !== null, true);
    RawAssertions.assertEq('PastePostProcess event object', lastPostProcessEvent !== null, true);
  }), 100, 100);

  const sTestPaste = function (editor, tinyApis) {
    return Logger.t('Paste tests', GeneralSteps.sequence([
      Logger.t('Paste external content', GeneralSteps.sequence([
        sPaste(editor, tinyApis, '<p>abc</p>', { 'text/plain': 'X', 'text/html': '<p>X</p>' }, [0, 0], 0, [0, 0], 3),
        sWaitForProcessEvents,
        sAssertLastPreProcessEvent({ internal: false, content: 'X' }),
        sAssertLastPostProcessEvent({ internal: false, content: 'X' })
      ])),

      Logger.t('Paste external content treated as plain text', GeneralSteps.sequence([
        sPaste(editor, tinyApis, '<p>abc</p>', { 'text/html': '<p>X</p>' }, [0, 0], 0, [0, 0], 3),
        sWaitForProcessEvents,
        sAssertLastPreProcessEvent({ internal: false, content: 'X' }),
        sAssertLastPostProcessEvent({ internal: false, content: 'X' })
      ])),

      Logger.t('Paste internal content with mark', GeneralSteps.sequence([
        sPaste(editor, tinyApis, '<p>abc</p>', { 'text/plain': 'X', 'text/html': InternalHtml.mark('<p>X</p>') }, [0, 0], 0, [0, 0], 3),
        sWaitForProcessEvents,
        sAssertLastPreProcessEvent({ internal: true, content: '<p>X</p>' }),
        sAssertLastPostProcessEvent({ internal: true, content: '<p>X</p>' })
      ])),

      Logger.t('Paste internal content with mime', GeneralSteps.sequence([
        sPaste(editor, tinyApis, '<p>abc</p>',
          { 'text/plain': 'X', 'text/html': '<p>X</p>', 'x-tinymce/html': '<p>X</p>' },
          [0, 0], 0, [0, 0], 3
        ),
        sWaitForProcessEvents,
        sAssertLastPreProcessEvent({ internal: true, content: '<p>X</p>' }),
        sAssertLastPostProcessEvent({ internal: true, content: '<p>X</p>' })
      ]))
    ]));
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    // Disabled tests on Edge 15 due to broken clipboard API
    Pipeline.async({}, Utils.isMsEdge() ? [ ] : [
      sTestCopy(editor, tinyApis),
      sTestCut(editor, tinyApis),
      sTestPaste(editor, tinyApis)
    ], onSuccess, onFailure);
  }, {
    plugins: 'paste',
    init_instance_callback (editor) {
      editor.on('PastePreProcess', function (evt) {
        lastPreProcessEvent = evt;
      });

      editor.on('PastePostProcess', function (evt) {
        lastPostProcessEvent = evt;
      });
    },
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
