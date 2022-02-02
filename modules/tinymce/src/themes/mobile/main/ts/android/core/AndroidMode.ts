/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Singleton } from '@ephox/katamari';
import { Class } from '@ephox/sugar';

import * as PlatformEditor from '../../ios/core/PlatformEditor';
import * as Styles from '../../style/Styles';
import * as MetaViewport from '../../touch/view/MetaViewport';
import * as Thor from '../../util/Thor';
import * as AndroidEvents from './AndroidEvents';
import * as AndroidSetup from './AndroidSetup';

const create = (platform, mask) => {

  const meta = MetaViewport.tag();
  const androidApi = Singleton.api();

  const androidEvents = Singleton.api();

  const enter = () => {
    mask.hide();

    Class.add(platform.container, Styles.resolve('fullscreen-maximized'));
    Class.add(platform.container, Styles.resolve('android-maximized'));
    meta.maximize();

    // TM-48 Prevent browser refresh by swipe/scroll on android devices
    Class.add(platform.body, Styles.resolve('android-scroll-reload'));

    androidApi.set(
      AndroidSetup.setup(platform.win, PlatformEditor.getWin(platform.editor).getOrDie('no'))
    );

    PlatformEditor.getActiveApi(platform.editor).each((editorApi) => {
      Thor.clobberStyles(platform.container, editorApi.body);
      androidEvents.set(
        AndroidEvents.initEvents(editorApi, platform.toolstrip, platform.alloy)
      );
    });
  };

  const exit = () => {
    meta.restore();
    mask.show();
    Class.remove(platform.container, Styles.resolve('fullscreen-maximized'));
    Class.remove(platform.container, Styles.resolve('android-maximized'));
    Thor.restoreStyles();

    // TM-48 re-enable swipe/scroll browser refresh on android
    Class.remove(platform.body, Styles.resolve('android-scroll-reload'));

    androidEvents.clear();

    androidApi.clear();
  };

  return {
    enter,
    exit
  };
};

export {
  create
};
