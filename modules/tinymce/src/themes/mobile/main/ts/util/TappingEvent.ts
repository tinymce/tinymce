/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { TapEvent } from '@ephox/alloy';
import { DomEvent, EventUnbinder } from '@ephox/sugar';

// TODO: TapEvent needs to be exposed in alloy's API somehow
const monitor = (editorApi) => {
  const tapEvent = TapEvent.monitor({
    triggerEvent(type, evt) {
      editorApi.onTapContent(evt);
    }
  } as any);

  // convenience methods
  const onTouchend = (): EventUnbinder => DomEvent.bind(editorApi.body(), 'touchend', (evt) => {
    tapEvent.fireIfReady(evt, 'touchend');
  });

  const onTouchmove = (): EventUnbinder => DomEvent.bind(editorApi.body(), 'touchmove', (evt) => {
    tapEvent.fireIfReady(evt, 'touchmove');
  });

  const fireTouchstart = (evt): void => {
    tapEvent.fireIfReady(evt, 'touchstart');
  };

  return {
    fireTouchstart,
    onTouchend,
    onTouchmove
  };
};

export {
  monitor
};
