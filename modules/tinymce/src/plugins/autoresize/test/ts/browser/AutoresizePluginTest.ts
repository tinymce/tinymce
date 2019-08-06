import { Assertions, Log, Logger, Pipeline, RawAssertions, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { navigator } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import AutoresizePlugin from 'tinymce/plugins/autoresize/Plugin';
import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.plugins.autoresize.AutoresizePluginTest', (success, failure) => {

  AutoresizePlugin();
  FullscreenPlugin();
  SilverTheme();

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

  const sAssertEditorContentApproxHeight = (editor: Editor, height: number, expectedDiff: number = 5) => {
    return Logger.t(`Assert editor content height is approx ${height}`, Step.sync(() => {
      // Get the editor height, but exclude the 10px margin from the calculations
      const editorContentHeight = editor.getContentAreaContainer().offsetHeight - 10;
      const actualDiff = Math.abs(editorContentHeight - height);
      RawAssertions.assertEq(`should be approx (within ${expectedDiff}px): ${editorContentHeight} ~= ${height}`, true,  actualDiff <= expectedDiff);
    }));
  };

  const sAssertScroll = (editor, state) => {
    return Logger.t(`Assert scroll ${state}`, Step.sync(function () {
      const body = editor.getBody();
      Assertions.assertEq('', !state, body.style.overflowY === 'hidden');
    }));
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const resizeEventsCount = Cell(0);

    Pipeline.async({},
      // These tests doesn't work on phantom since measuring things seems broken there
      navigator.userAgent.indexOf('PhantomJS') === -1 ?
      [
        Step.sync(() => {
          editor.on('ResizeEditor', () => {
            resizeEventsCount.set(resizeEventsCount.get() + 1);
          });
        }),
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
        Log.stepsAsStep('TBA', 'AutoResize: Editor size increase with floated content', [
          tinyApis.sSetContent('<div style="height: 5500px; float: right;">a</div>'),
          // Content height + bottom margin = 5550
          Waiter.sTryUntil('wait for editor height', sAssertEditorContentApproxHeight(editor, 5550), 10, 3000),
          Waiter.sTryUntil('wait for editor height', sAssertEditorHeightAbove(editor, 5550), 10, 3000)
        ]),
        Log.stepsAsStep('TBA', 'AutoResize: Editor size decrease based on content size', [
          tinyApis.sSetContent('<div style="height: 1000px;">a</div>'),
          Waiter.sTryUntil('wait for editor height', sAssertEditorContentApproxHeight(editor, 1050), 10, 3000),
          Waiter.sTryUntil('wait for editor height', sAssertEditorHeightBelow(editor, 1200), 10, 3000)
        ]),
        Log.step('TBA', 'AutoResize: Should fire ResizeEditor events when resizing', Step.sync(() => {
          Assertions.assertEq('Should have fired at least 3 ResizeEditor events', true, resizeEventsCount.get() >= 3);
        })),
        Log.stepsAsStep('TBA', 'AutoResize: Editor size increase with async loaded content', [
          // Note: Use a min-height here to account for different browsers rendering broken images differently
          tinyApis.sSetContent('<div style="min-height: 35px;"><img src="#" /></div><div style="height: 5500px;"></div>'),
          Waiter.sTryUntil('wait for editor height', sAssertEditorContentApproxHeight(editor, 5585), 10, 3000),
          Step.sync(() => {
            // Update the img element to load an image
            editor.$('img').attr('src', 'http://moxiecode.cachefly.net/tinymce/v9/images/logo.png');
          }),
          // Content height + div image height (84px) + bottom margin = 5634
          Waiter.sTryUntil('wait for editor height', sAssertEditorContentApproxHeight(editor, 5634), 10, 3000),
          Waiter.sTryUntil('wait for editor height', sAssertEditorHeightAbove(editor, 5634), 10, 3000)
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
    base_url: '/project/tinymce/js/tinymce',
    autoresize_bottom_margin: 50,
    autoresize_on_init: false,
    // Override the content css margins, so they don't come into play
    content_style: 'body { margin: 0; margin-top: 10px; }'
  }, success, failure);
});
