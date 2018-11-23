/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { TapEvent } from '@ephox/alloy';
import { DomEvent } from '@ephox/sugar';

// TODO: TapEvent needs to be exposed in alloy's API somehow
const monitor = function (editorApi) {
  const tapEvent = TapEvent.monitor({
    triggerEvent (type, evt) {
      editorApi.onTapContent(evt);
    }
  } as any);

  // convenience methods
  const onTouchend = function () {
    return DomEvent.bind(editorApi.body(), 'touchend', function (evt) {
      tapEvent.fireIfReady(evt, 'touchend');
    });
  };

  const onTouchmove = function () {
    return DomEvent.bind(editorApi.body(), 'touchmove', function (evt) {
      tapEvent.fireIfReady(evt, 'touchmove');
    });
  };

  const fireTouchstart = function (evt) {
    tapEvent.fireIfReady(evt, 'touchstart');
  };

  return {
    fireTouchstart,
    onTouchend,
    onTouchmove
  };
};

export default {
  monitor
};