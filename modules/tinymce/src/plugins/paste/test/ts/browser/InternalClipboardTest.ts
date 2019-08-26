import { GeneralSteps, Logger, Pipeline, RawAssertions, Step, Waiter, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import InternalHtml from 'tinymce/plugins/paste/core/InternalHtml';
import Utils from 'tinymce/plugins/paste/core/Utils';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import MockDataTransfer from '../module/test/MockDataTransfer';

UnitTest.asynctest('browser.tinymce.plugins.paste.InternalClipboardTest', (success, failure) => {
  let dataTransfer, lastPreProcessEvent, lastPostProcessEvent;

  PastePlugin();
  TablePlugin();
  Theme();

  const sResetProcessEvents = Logger.t('Reset process events', Step.sync(function () {
    lastPreProcessEvent = null;
    lastPostProcessEvent = null;
  }));

  const sCutCopyDataTransferEvent = function (editor, type) {
    return Logger.t('Cut copy data transfer event', Step.sync(function () {
      dataTransfer = MockDataTransfer.create({});
      editor.fire(type, { clipboardData: dataTransfer });
    }));
  };

  const sPasteDataTransferEvent = function (editor, data) {
    return Logger.t('Paste data transfer event', Step.sync(function () {
      dataTransfer = MockDataTransfer.create(data);
      editor.fire('paste', { clipboardData: dataTransfer });
    }));
  };

  const sAssertClipboardData = function (expectedHtml, expectedText) {
    return Logger.t(`Assert clipboard data ${expectedHtml}, ${expectedText}`, Step.sync(function () {
      RawAssertions.assertEq('text/html data should match', expectedHtml, dataTransfer.getData('text/html'));
      RawAssertions.assertEq('text/plain data should match', expectedText, dataTransfer.getData('text/plain'));
    }));
  };

  const sCopy = function (editor, tinyApis, html, spath, soffset, fpath, foffset) {
    return Logger.t('Copy', GeneralSteps.sequence([
      tinyApis.sSetContent(html),
      tinyApis.sSetSelection(spath, soffset, fpath, foffset),
      sCutCopyDataTransferEvent(editor, 'copy')
    ]));
  };

  const sCut = function (editor, tinyApis, html, spath, soffset, fpath, foffset) {
    return Logger.t('Cut', GeneralSteps.sequence([
      tinyApis.sSetContent(html),
      tinyApis.sSetSelection(spath, soffset, fpath, foffset),
      sCutCopyDataTransferEvent(editor, 'cut')
    ]));
  };

  const sPaste = function (editor, tinyApis, startHtml, pasteData, spath, soffset, fpath, foffset) {
    return Logger.t('Paste', GeneralSteps.sequence([
      tinyApis.sSetContent(startHtml),
      tinyApis.sSetSelection(spath, soffset, fpath, foffset),
      sResetProcessEvents,
      sPasteDataTransferEvent(editor, pasteData)
    ]));
  };

  const sTestCopy = function (editor, tinyApis) {
    return Log.stepsAsStep('TBA', 'Paste: Copy simple text', [
        sCopy(editor, tinyApis, '<p>text</p>', [0, 0], 0, [0, 0], 4),
        sAssertClipboardData('text', 'text'),
        tinyApis.sAssertContent('<p>text</p>'),
        tinyApis.sAssertSelection([0, 0], 0, [0, 0], 4)
      ]),

      Log.stepsAsStep('TBA', 'Paste: Copy inline elements', [
        sCopy(editor, tinyApis, '<p>te<em>x</em>t</p>', [0, 0], 0, [0, 2], 1),
        sAssertClipboardData('te<em>x</em>t', 'text'),
        tinyApis.sAssertContent('<p>te<em>x</em>t</p>'),
        tinyApis.sAssertSelection([0, 0], 0, [0, 2], 1)
      ]),

      Log.stepsAsStep('TBA', 'Paste: Copy partialy selected inline elements', [
        sCopy(editor, tinyApis, '<p>a<em>cd</em>e</p>', [0, 0], 0, [0, 1, 0], 1),
        sAssertClipboardData('a<em>c</em>', 'ac'),
        tinyApis.sAssertContent('<p>a<em>cd</em>e</p>'),
        tinyApis.sAssertSelection([0, 0], 0, [0, 1, 0], 1)
      ]),

      Log.stepsAsStep('TBA', 'Paste: Copy collapsed selection', [
        sCopy(editor, tinyApis, '<p>abc</p>', [0, 0], 1, [0, 0], 1),
        sAssertClipboardData('', ''),
        tinyApis.sAssertContent('<p>abc</p>'),
        tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
      ]),

      Log.stepsAsStep('TBA', 'Copy collapsed selection with table selection', [
        sCopy(editor, tinyApis,
          '<table data-mce-selected="1">' +
            '<tbody>' +
              '<tr>' +
                '<td data-mce-first-selected="1" data-mce-selected="1">a</td>' +
                '<td data-mce-last-selected="1" data-mce-selected="1">b</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>',
        [0, 0, 0, 1, 0], 0, [0, 0, 0, 1, 0], 0),
        sAssertClipboardData(
          '<table>\n' +
            '<tbody>\n' +
              '<tr>\n' +
                '<td>a</td>\n' +
                '<td>b</td>\n' +
              '</tr>\n' +
            '</tbody>\n' +
          '</table>', 'ab'),
        tinyApis.sAssertSelection([0, 0, 0, 1, 0], 0, [0, 0, 0, 1, 0], 0)
      ]);
  };

  const sTestCut = function (editor, tinyApis) {
    const sWaitUntilAssertContent = function (expected) {
      return Waiter.sTryUntil('Cut is async now, so need to wait for content', tinyApis.sAssertContent(expected));
    };

    return Log.stepsAsStep('TBA', 'Paste: Cut simple text', [
        sCut(editor, tinyApis, '<p>text</p>', [0, 0], 0, [0, 0], 4),
        sAssertClipboardData('text', 'text'),
        sWaitUntilAssertContent(''),
        tinyApis.sAssertSelection([0], 0, [0], 0)
      ]),

      Log.stepsAsStep('TBA', 'Paste: Cut inline elements', [
        sCut(editor, tinyApis, '<p>te<em>x</em>t</p>', [0, 0], 0, [0, 2], 1),
        sAssertClipboardData('te<em>x</em>t', 'text'),
        sWaitUntilAssertContent(''),
        tinyApis.sAssertSelection([0], 0, [0], 0)
      ]),

      Log.stepsAsStep('TBA', 'Paste: Cut partialy selected inline elements', [
        sCut(editor, tinyApis, '<p>a<em>cd</em>e</p>', [0, 0], 0, [0, 1, 0], 1),
        sAssertClipboardData('a<em>c</em>', 'ac'),
        sWaitUntilAssertContent('<p><em>d</em>e</p>'),
        tinyApis.sAssertSelection([0, 0, 0], 0, [0, 0, 0], 0)
      ]),

      Log.stepsAsStep('TBA', 'Paste: Cut collapsed selection', [
        sCut(editor, tinyApis, '<p>abc</p>', [0, 0], 1, [0, 0], 1),
        sAssertClipboardData('', ''),
        sWaitUntilAssertContent('<p>abc</p>'),
        tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
      ]);
  };

  const sAssertLastPreProcessEvent = function (expectedData) {
    return Logger.t('Assert last preprocess event', Step.sync(function () {
      RawAssertions.assertEq('Internal property should be equal', expectedData.internal, lastPreProcessEvent.internal);
      RawAssertions.assertEq('Content property should be equal', expectedData.content, lastPreProcessEvent.content);
    }));
  };

  const sAssertLastPostProcessEvent = function (expectedData) {
    return Logger.t('Assert last postprocess event', Step.sync(function () {
      RawAssertions.assertEq('Internal property should be equal', expectedData.internal, lastPostProcessEvent.internal);
      RawAssertions.assertEq('Content property should be equal', expectedData.content, lastPostProcessEvent.node.innerHTML);
    }));
  };

  const sWaitForProcessEvents = Waiter.sTryUntil('Did not get any events fired', Step.sync(function () {
    RawAssertions.assertEq('PastePreProcess event object', lastPreProcessEvent !== null, true);
    RawAssertions.assertEq('PastePostProcess event object', lastPostProcessEvent !== null, true);
  }));

  const sTestPaste = function (editor, tinyApis) {
    return Log.stepsAsStep('TBA', 'Paste: Paste external content', [
        sPaste(editor, tinyApis, '<p>abc</p>', { 'text/plain': 'X', 'text/html': '<p>X</p>' }, [0, 0], 0, [0, 0], 3),
        sWaitForProcessEvents,
        sAssertLastPreProcessEvent({ internal: false, content: 'X' }),
        sAssertLastPostProcessEvent({ internal: false, content: 'X' })
      ]),

      Log.stepsAsStep('TBA', 'Paste: Paste external content treated as plain text', [
        sPaste(editor, tinyApis, '<p>abc</p>', { 'text/html': '<p>X</p>' }, [0, 0], 0, [0, 0], 3),
        sWaitForProcessEvents,
        sAssertLastPreProcessEvent({ internal: false, content: 'X' }),
        sAssertLastPostProcessEvent({ internal: false, content: 'X' })
      ]),

      Log.stepsAsStep('TBA', 'Paste: Paste internal content with mark', [
        sPaste(editor, tinyApis, '<p>abc</p>', { 'text/plain': 'X', 'text/html': InternalHtml.mark('<p>X</p>') }, [0, 0], 0, [0, 0], 3),
        sWaitForProcessEvents,
        sAssertLastPreProcessEvent({ internal: true, content: '<p>X</p>' }),
        sAssertLastPostProcessEvent({ internal: true, content: '<p>X</p>' })
      ]),

      Log.stepsAsStep('TBA', 'Paste: Paste internal content with mime', [
        sPaste(editor, tinyApis, '<p>abc</p>',
          { 'text/plain': 'X', 'text/html': '<p>X</p>', 'x-tinymce/html': '<p>X</p>' },
          [0, 0], 0, [0, 0], 3
        ),
        sWaitForProcessEvents,
        sAssertLastPreProcessEvent({ internal: true, content: '<p>X</p>' }),
        sAssertLastPostProcessEvent({ internal: true, content: '<p>X</p>' })
      ]);
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    // Disabled tests on Edge 15 due to broken clipboard API
    Pipeline.async({}, Utils.isMsEdge() ? [ ] : [
      sTestCopy(editor, tinyApis),
      sTestCut(editor, tinyApis),
      sTestPaste(editor, tinyApis)
    ], onSuccess, onFailure);
  }, {
    plugins: 'paste table',
    init_instance_callback (editor) {
      editor.on('PastePreProcess', function (evt) {
        lastPreProcessEvent = evt;
      });

      editor.on('PastePostProcess', function (evt) {
        lastPostProcessEvent = evt;
      });
    },
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
