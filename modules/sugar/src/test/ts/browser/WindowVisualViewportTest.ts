import { Assert, UnitTest } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';

import * as WindowVisualViewport from 'ephox/sugar/api/view/WindowVisualViewport';

UnitTest.test('WindowVisualViewport.getBounds', () => {
  const deviceType = PlatformDetection.detect().deviceType;
  if (deviceType.isDesktop()) {
    const bounds = WindowVisualViewport.getBounds();
    Assert.eq('Top is 0', 0, bounds.y);
    Assert.eq('Left is 0', 0, bounds.x);
    Assert.eq('Height is the same as the document height', document.documentElement.clientHeight, bounds.height);
    Assert.eq('Width is the same as the document width', document.documentElement.clientWidth, bounds.width);
  }
});

UnitTest.test('WindowVisualViewport.bind', () => {
  let resizeCount = 0;
  const binder = WindowVisualViewport.bind('resize', () => {
    resizeCount += 1;
  });

  // Trigger resize
  WindowVisualViewport.get().each((viewport) => {
    const resizeEvent = new UIEvent('resize');
    viewport.dispatchEvent(resizeEvent);
    Assert.eq('Check resize event handled', 1, resizeCount);
  });

  binder.unbind();
});
