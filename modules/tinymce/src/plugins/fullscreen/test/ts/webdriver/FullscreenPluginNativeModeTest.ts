import { UnitTest } from '@ephox/bedrock-client';

import { Editor as McEditor } from '@ephox/mcagar';
import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { Pipeline, Log, NamedChain, Chain, UiFinder, RealMouse, Waiter, Step } from '@ephox/agar';

UnitTest.asynctest('browser.tinymce.plugins.fullscreen.FullScreenPluginNativeModeTest', (success, failure) => {
  FullscreenPlugin();
  SilverTheme();

  const cSetupEditor = McEditor.cFromSettings({
    plugins: 'fullscreen',
    toolbar: 'fullscreen',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    fullscreen_native: true
  });

  const getFullscreenElement = () => {
    if (document.fullscreenElement !== undefined) {
      return document.fullscreenElement;
    } else if ((document as any).msFullscreenElement !== undefined) {
      return (document as any).msFullscreenElement;
    } else if ((document as any).webkitFullscreenElement !== undefined) {
      return (document as any).webkitFullscreenElement;
    } else {
      return undefined;
    }
  };

  const cIsFullscreen = (fullscreen: boolean) => Waiter.cTryUntilPredicate('Waiting for fullscreen mode to ' + (fullscreen ? 'start' : 'end'), (_v) => {
    if (fullscreen) {
      return getFullscreenElement() === document.body;
    } else {
      return getFullscreenElement() === null;
    }
  });

  const unsupportedBrowser = (() => {
    if (/HeadlessChrome/.test(window.navigator.userAgent)) {
      return 'headless Chrome';
    } else if (/PhantomJS/.test(window.navigator.userAgent)) {
      return 'PhantomJs';
    }
    return '';
  })();

  const skipInUnsupportedBrowsers = (step: Step<unknown, unknown>) => unsupportedBrowser ? Step.log('Skipping test as ' + unsupportedBrowser + ' can not run it') : step;

  Pipeline.async({}, [
    skipInUnsupportedBrowsers(
      Log.chainsAsStep('TBA', 'FullScreen: Toggle fullscreen on with real click, check document.fullscreenElement, toggle fullscreen off, check document.fullscreenElement', [
        NamedChain.asChain([
          NamedChain.write('editor', cSetupEditor),
          NamedChain.direct('editor', Chain.mapper((editor) => editor.getContainer()), 'container'),
          NamedChain.direct('container', UiFinder.cFindIn('button[title="Fullscreen"]'), 'button'),
          NamedChain.read('editor', cIsFullscreen(false)),
          NamedChain.read('button', RealMouse.cClick()),
          NamedChain.read('editor', cIsFullscreen(true)),
          NamedChain.read('button', RealMouse.cClick()),
          NamedChain.read('editor', cIsFullscreen(false)),
          NamedChain.read('editor', McEditor.cRemove)
        ])
      ])
    )
  ], success, failure);
});