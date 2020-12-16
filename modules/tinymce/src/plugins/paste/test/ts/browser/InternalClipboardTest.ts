import { GeneralSteps, Log, Logger, Pipeline, Step, Waiter } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';

import Editor from 'tinymce/core/api/Editor';
import * as InternalHtml from 'tinymce/plugins/paste/core/InternalHtml';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as MockDataTransfer from '../module/test/MockDataTransfer';

UnitTest.asynctest('browser.tinymce.plugins.paste.InternalClipboardTest', (success, failure) => {
  const browser = PlatformDetection.detect().browser;
  let dataTransfer, lastPreProcessEvent, lastPostProcessEvent;

  PastePlugin();
  TablePlugin();
  Theme();

  const sResetProcessEvents = Logger.t('Reset process events', Step.sync(() => {
    lastPreProcessEvent = null;
    lastPostProcessEvent = null;
  }));

  const sCutCopyDataTransferEvent = (editor: Editor, type: string) => {
    return Logger.t('Cut copy data transfer event', Step.sync(() => {
      dataTransfer = MockDataTransfer.create({});
      editor.fire(type, { clipboardData: dataTransfer });
    }));
  };

  const sPasteDataTransferEvent = (editor: Editor, data: Record<string, string>) => {
    return Logger.t('Paste data transfer event', Step.sync(() => {
      dataTransfer = MockDataTransfer.create(data);
      editor.fire('paste', { clipboardData: dataTransfer } as ClipboardEvent);
    }));
  };

  const sAssertClipboardData = (expectedHtml: string, expectedText: string) => {
    return Logger.t(`Assert clipboard data ${expectedHtml}, ${expectedText}`, Step.sync(() => {
      Assert.eq('text/html data should match', expectedHtml, dataTransfer.getData('text/html'));
      Assert.eq('text/plain data should match', expectedText, dataTransfer.getData('text/plain'));
    }));
  };

  const sCopy = (editor: Editor, tinyApis: TinyApis, html: string, spath: number[], soffset: number, fpath: number[], foffset: number) => {
    return Logger.t('Copy', GeneralSteps.sequence([
      tinyApis.sSetContent(html),
      tinyApis.sSetSelection(spath, soffset, fpath, foffset),
      sCutCopyDataTransferEvent(editor, 'copy')
    ]));
  };

  const sCut = (editor: Editor, tinyApis: TinyApis, html: string, spath: number[], soffset: number, fpath: number[], foffset: number) => {
    return Logger.t('Cut', GeneralSteps.sequence([
      tinyApis.sSetContent(html),
      tinyApis.sSetSelection(spath, soffset, fpath, foffset),
      sCutCopyDataTransferEvent(editor, 'cut')
    ]));
  };

  const sPaste = (editor: Editor, tinyApis: TinyApis, startHtml: string, pasteData: Record<string, string>, spath: number[], soffset: number, fpath: number[], foffset: number) => {
    return Logger.t('Paste', GeneralSteps.sequence([
      tinyApis.sSetContent(startHtml),
      tinyApis.sSetSelection(spath, soffset, fpath, foffset),
      sResetProcessEvents,
      sPasteDataTransferEvent(editor, pasteData)
    ]));
  };

  const sTestCopy = (editor: Editor, tinyApis: TinyApis) => {
    return GeneralSteps.sequence([
      Log.stepsAsStep('TBA', 'Paste: Copy simple text', [
        sCopy(editor, tinyApis, '<p>text</p>', [ 0, 0 ], 0, [ 0, 0 ], 4),
        sAssertClipboardData('text', 'text'),
        tinyApis.sAssertContent('<p>text</p>'),
        tinyApis.sAssertSelection([ 0, 0 ], 0, [ 0, 0 ], 4)
      ]),

      Log.stepsAsStep('TBA', 'Paste: Copy inline elements', [
        sCopy(editor, tinyApis, '<p>te<em>x</em>t</p>', [ 0, 0 ], 0, [ 0, 2 ], 1),
        sAssertClipboardData('te<em>x</em>t', 'text'),
        tinyApis.sAssertContent('<p>te<em>x</em>t</p>'),
        tinyApis.sAssertSelection([ 0, 0 ], 0, [ 0, 2 ], 1)
      ]),

      Log.stepsAsStep('TBA', 'Paste: Copy partialy selected inline elements', [
        sCopy(editor, tinyApis, '<p>a<em>cd</em>e</p>', [ 0, 0 ], 0, [ 0, 1, 0 ], 1),
        sAssertClipboardData('a<em>c</em>', 'ac'),
        tinyApis.sAssertContent('<p>a<em>cd</em>e</p>'),
        tinyApis.sAssertSelection([ 0, 0 ], 0, [ 0, 1, 0 ], 1)
      ]),

      Log.stepsAsStep('TBA', 'Paste: Copy collapsed selection', [
        sCopy(editor, tinyApis, '<p>abc</p>', [ 0, 0 ], 1, [ 0, 0 ], 1),
        sAssertClipboardData('', ''),
        tinyApis.sAssertContent('<p>abc</p>'),
        tinyApis.sAssertSelection([ 0, 0 ], 1, [ 0, 0 ], 1)
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
          [ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 0, 1, 0 ], 0),
        sAssertClipboardData(
          '<table>\n' +
              '<tbody>\n' +
                '<tr>\n' +
                  '<td>a</td>\n' +
                  '<td>b</td>\n' +
                '</tr>\n' +
              '</tbody>\n' +
            '</table>', 'ab'),
        tinyApis.sAssertSelection([ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 0, 1, 0 ], 0)
      ])
    ]);
  };

  const sTestCut = (editor: Editor, tinyApis: TinyApis) => {
    const sWaitUntilAssertContent = (expected: string) => {
      return Waiter.sTryUntil('Cut is async now, so need to wait for content', tinyApis.sAssertContent(expected));
    };

    return GeneralSteps.sequence([
      Log.stepsAsStep('TBA', 'Paste: Cut simple text', [
        sCut(editor, tinyApis, '<p>text</p>', [ 0, 0 ], 0, [ 0, 0 ], 4),
        sAssertClipboardData('text', 'text'),
        sWaitUntilAssertContent(''),
        tinyApis.sAssertSelection([ 0 ], 0, [ 0 ], 0)
      ]),

      Log.stepsAsStep('TBA', 'Paste: Cut inline elements', [
        sCut(editor, tinyApis, '<p>te<em>x</em>t</p>', [ 0, 0 ], 0, [ 0, 2 ], 1),
        sAssertClipboardData('te<em>x</em>t', 'text'),
        sWaitUntilAssertContent(''),
        tinyApis.sAssertSelection([ 0 ], 0, [ 0 ], 0)
      ]),

      Log.stepsAsStep('TBA', 'Paste: Cut partially selected inline elements', [
        sCut(editor, tinyApis, '<p>a<em>cd</em>e</p>', [ 0, 0 ], 0, [ 0, 1, 0 ], 1),
        sAssertClipboardData('a<em>c</em>', 'ac'),
        sWaitUntilAssertContent('<p><em>d</em>e</p>'),
        // TODO: Investigate why Edge ends up with a different selection here
        tinyApis.sAssertSelection(browser.isEdge() ? [ 0 ] : [ 0, 0, 0 ], 0, browser.isEdge() ? [ 0 ] : [ 0, 0, 0 ], 0)
      ]),

      Log.stepsAsStep('TBA', 'Paste: Cut collapsed selection', [
        sCut(editor, tinyApis, '<p>abc</p>', [ 0, 0 ], 1, [ 0, 0 ], 1),
        sAssertClipboardData('', ''),
        sWaitUntilAssertContent('<p>abc</p>'),
        tinyApis.sAssertSelection([ 0, 0 ], 1, [ 0, 0 ], 1)
      ])
    ]);
  };

  const sAssertLastPreProcessEvent = (expectedData) => {
    return Logger.t('Assert last preprocess event', Step.sync(() => {
      Assert.eq('Internal property should be equal', expectedData.internal, lastPreProcessEvent.internal);
      Assert.eq('Content property should be equal', expectedData.content, lastPreProcessEvent.content);
    }));
  };

  const sAssertLastPostProcessEvent = (expectedData) => {
    return Logger.t('Assert last postprocess event', Step.sync(() => {
      Assert.eq('Internal property should be equal', expectedData.internal, lastPostProcessEvent.internal);
      Assert.eq('Content property should be equal', expectedData.content, lastPostProcessEvent.node.innerHTML);
    }));
  };

  const sWaitForProcessEvents = Waiter.sTryUntil('Did not get any events fired', Step.sync(() => {
    Assert.eq('PastePreProcess event object', lastPreProcessEvent !== null, true);
    Assert.eq('PastePostProcess event object', lastPostProcessEvent !== null, true);
  }));

  const sTestPaste = (editor: Editor, tinyApis: TinyApis) => {
    return GeneralSteps.sequence([
      Log.stepsAsStep('TBA', 'Paste: Paste external content', [
        sPaste(editor, tinyApis, '<p>abc</p>', { 'text/plain': 'X', 'text/html': '<p>X</p>' }, [ 0, 0 ], 0, [ 0, 0 ], 3),
        sWaitForProcessEvents,
        sAssertLastPreProcessEvent({ internal: false, content: 'X' }),
        sAssertLastPostProcessEvent({ internal: false, content: 'X' })
      ]),

      Log.stepsAsStep('TBA', 'Paste: Paste external content treated as plain text', [
        sPaste(editor, tinyApis, '<p>abc</p>', { 'text/html': '<p>X</p>' }, [ 0, 0 ], 0, [ 0, 0 ], 3),
        sWaitForProcessEvents,
        sAssertLastPreProcessEvent({ internal: false, content: 'X' }),
        sAssertLastPostProcessEvent({ internal: false, content: 'X' })
      ]),

      Log.stepsAsStep('TBA', 'Paste: Paste internal content with mark', [
        sPaste(editor, tinyApis, '<p>abc</p>', { 'text/plain': 'X', 'text/html': InternalHtml.mark('<p>X</p>') }, [ 0, 0 ], 0, [ 0, 0 ], 3),
        sWaitForProcessEvents,
        sAssertLastPreProcessEvent({ internal: true, content: '<p>X</p>' }),
        sAssertLastPostProcessEvent({ internal: true, content: '<p>X</p>' })
      ]),

      Log.stepsAsStep('TBA', 'Paste: Paste internal content with mime', [
        sPaste(editor, tinyApis, '<p>abc</p>',
          { 'text/plain': 'X', 'text/html': '<p>X</p>', 'x-tinymce/html': '<p>X</p>' },
          [ 0, 0 ], 0, [ 0, 0 ], 3
        ),
        sWaitForProcessEvents,
        sAssertLastPreProcessEvent({ internal: true, content: '<p>X</p>' }),
        sAssertLastPostProcessEvent({ internal: true, content: '<p>X</p>' })
      ])
    ]);
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      sTestCopy(editor, tinyApis),
      sTestCut(editor, tinyApis),
      sTestPaste(editor, tinyApis)
    ], onSuccess, onFailure);
  }, {
    plugins: 'paste table',
    init_instance_callback: (editor) => {
      editor.on('PastePreProcess', (evt) => {
        lastPreProcessEvent = evt;
      });

      editor.on('PastePostProcess', (evt) => {
        lastPostProcessEvent = evt;
      });
    },
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
