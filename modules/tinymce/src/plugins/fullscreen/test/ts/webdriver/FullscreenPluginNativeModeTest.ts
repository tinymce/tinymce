import { RealMouse, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { getFullscreenElement } from 'tinymce/plugins/fullscreen/core/NativeFullscreen';
import Plugin from 'tinymce/plugins/fullscreen/Plugin';

describe('webdriver.tinymce.plugins.fullscreen.FullScreenPluginNativeModeTest', () => {
  before(function () {
    if (/HeadlessChrome/.test(window.navigator.userAgent)) {
      this.skip();
    }
  });

  TinyHooks.bddSetup<Editor>({
    plugins: 'fullscreen',
    toolbar: 'fullscreen',
    base_url: '/project/tinymce/js/tinymce',
    fullscreen_native: true
  }, [ Plugin ]);

  const pIsFullscreen = (fullscreen: boolean) => Waiter.pTryUntilPredicate('Waiting for fullscreen mode to ' + (fullscreen ? 'start' : 'end'), () => {
    if (fullscreen) {
      return getFullscreenElement(document) === document.body;
    } else {
      return getFullscreenElement(document) === null;
    }
  });

  it('TBA: Toggle fullscreen on with real click, check document.fullscreenElement, toggle fullscreen off, check document.fullscreenElement', async () => {
    await pIsFullscreen(false);
    await RealMouse.pClickOn('button[title="Fullscreen"]');
    await pIsFullscreen(true);
    await RealMouse.pClickOn('button[title="Fullscreen"]');
    await pIsFullscreen(false);
  });
});
