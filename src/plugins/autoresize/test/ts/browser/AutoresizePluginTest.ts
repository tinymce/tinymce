import { Assertions, Log, Logger, Pipeline, RawAssertions, Step, Waiter } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import AutoresizePlugin from 'tinymce/plugins/autoresize/Plugin';
import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import { navigator } from '@ephox/dom-globals';
import { Editor } from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.plugins.autoresize.AutoresizePluginTest', (success, failure) => {

  AutoresizePlugin();
  FullscreenPlugin();

  const sAssertEditorHeightAbove = (editor: Editor, minHeight: number) => {
    return Logger.t(`Assert editor height is above ${minHeight}`, Step.sync(() => {
      const editorHeight = editor.getContainer().offsetHeight;
      RawAssertions.assertEq(`should be above: ${editorHeight}>=${minHeight}`, true, editorHeight >= minHeight);
    }));
  };

  const sAssertEditorHeightBelow = (editor: Editor, minHeight: number) => {
    return Logger.t(`Assert editor height is below ${minHeight}`, Step.sync(() => {
      const editorHeight = editor.getContainer().offsetHeight;
      RawAssertions.assertEq(`should be below: ${editorHeight}<=${minHeight}`, true, editorHeight <= minHeight);
    }));
  };

  // Default the diff to 37, as the default margins in oxide is 16px (top & bottom) and then add another 5px just for some leniency
  const sAssertEditorContentApproxHeight = (editor: Editor, height: number, diff: number = 37) => {
    return Logger.t(`Assert editor content height is approx ${height}`, Step.sync(() => {
      const editorContentHeight = editor.getContentAreaContainer().offsetHeight;
      RawAssertions.assertEq(`should be approx (within ${diff}px): ${editorContentHeight}~=${height}`, true, Math.abs(editorContentHeight - height) < diff);
    }));
  };

  const sAssertScroll = (editor, state) => {
    return Logger.t(`Assert scroll ${state}`, Step.sync(function () {
      const body = editor.getBody();
      Assertions.assertEq('', !state, body.style.overflowY === 'hidden');
    }));
  };

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({},
      // These tests doesn't work on phantom since measuring things seems broken there
      navigator.userAgent.indexOf('PhantomJS') === -1 ?
      [
        Log.stepsAsStep('TBA', 'AutoResize: Fullscreen toggle scroll state', [
          tinyApis.sExecCommand('mceFullScreen'),
          sAssertScroll(editor, true),
          tinyApis.sExecCommand('mceFullScreen'),
          sAssertScroll(editor, false)
        ]),
        Log.stepsAsStep('TBA', 'AutoResize: Editor size increase based on content size', [
          tinyApis.sSetContent('<div style="height: 5000px;">a</div>'),
          // Content height + bottom margin = 5050
          Waiter.sTryUntil('wait for editor height', sAssertEditorContentApproxHeight(editor, 5050), 10, 3000),
          Waiter.sTryUntil('wait for editor height', sAssertEditorHeightAbove(editor, 5050), 10, 3000)
        ]),
        Log.stepsAsStep('TBA', 'AutoResize: Editor size decrease based on content size', [
          tinyApis.sSetContent('<div style="height: 1000px;">a</div>'),
          Waiter.sTryUntil('wait for editor height', sAssertEditorContentApproxHeight(editor, 1050), 10, 3000),
          Waiter.sTryUntil('wait for editor height', sAssertEditorHeightBelow(editor, 1200), 10, 3000)
        ]),
        Log.stepsAsStep('TBA', 'AutoResize: Editor size content set to 10 and autoresize_bottom_margin set to 100', [
          tinyApis.sSetSetting('autoresize_bottom_margin', 100),
          tinyApis.sSetContent('<div style="height: 10px;">a</div>'),
          Waiter.sTryUntil('wait for editor height', sAssertEditorContentApproxHeight(editor, 110), 10, 3000),
          tinyApis.sSetSetting('autoresize_bottom_margin', 50)
        ]),
        Log.stepsAsStep('TBA', 'AutoResize: Editor size increase content to 1000 based and restrict by max height', [
          tinyApis.sSetSetting('max_height', 200),
          tinyApis.sSetContent('<div style="height: 1000px;">a</div>'),
          Waiter.sTryUntil('wait for editor height', sAssertEditorHeightBelow(editor, 200), 10, 3000),
          tinyApis.sSetSetting('max_height', 0)
        ]),
        Log.stepsAsStep('TBA', 'AutoResize: Editor size decrease content to 10 and set min height to 500', [
          tinyApis.sSetSetting('min_height', 500),
          tinyApis.sSetContent('<div style="height: 10px;">a</div>'),
          Waiter.sTryUntil('wait for editor height', sAssertEditorHeightAbove(editor, 500), 10, 3000),
          tinyApis.sSetSetting('min_height', 0)
        ])
      ] : []
    , onSuccess, onFailure);
  }, {
    plugins: 'autoresize fullscreen',
    toolbar: 'autoresize',
    base_url: '/project/js/tinymce',
    autoresize_bottom_margin: 50
  }, success, failure);
});
