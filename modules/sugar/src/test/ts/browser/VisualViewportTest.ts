import { Assert, UnitTest } from '@ephox/bedrock-client';
import { document, UIEvent } from '@ephox/dom-globals';
import { PlatformDetection } from '@ephox/sand';
import * as VisualViewport from 'ephox/sugar/api/view/VisualViewport';

UnitTest.test('VisualViewport.getBounds', () => {
  const deviceType = PlatformDetection.detect().deviceType;
  if (deviceType.isDesktop()) {
    const bounds = VisualViewport.getBounds();
    Assert.eq('Top is 0', 0, bounds.y);
    Assert.eq('Left is 0', 0, bounds.x);
    Assert.eq('Height is the same as the document height', document.documentElement.clientHeight, bounds.height);
    Assert.eq('Width is the same as the document width', document.documentElement.clientWidth, bounds.width);
  }
});

UnitTest.test('VisualViewport.bind', () => {
  let resizeCount = 0;
  const binder = VisualViewport.bind('resize', () => {
    resizeCount += 1;
  });

  // Trigger resize
  // Note: Won't work on IE/Edge as they don't support the visual viewport API
  VisualViewport.get().each((viewport) => {
    const resizeEvent = new UIEvent('resize');
    viewport.dispatchEvent(resizeEvent);
    Assert.eq('Check resize event handled', 1, resizeCount);
  });

  binder.unbind();
});
