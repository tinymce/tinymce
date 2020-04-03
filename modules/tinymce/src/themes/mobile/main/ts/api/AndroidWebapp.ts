/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { GuiFactory } from '@ephox/alloy';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Css, Insert } from '@ephox/sugar';

import * as AndroidMode from '../android/core/AndroidMode';
import * as TapToEditMask from '../touch/view/TapToEditMask';
import MobileSchema from './MobileSchema';
import { MobileWebApp } from 'tinymce/themes/mobile/api/IosWebapp';

// TODO: Remove dupe with IosWebapp
const produce = function (raw: {any}): MobileWebApp {
  const mobile = ValueSchema.asRawOrDie(
    'Getting AndroidWebapp schema',
    MobileSchema,
    raw
  );

  /* Make the toolbar */
  Css.set(mobile.toolstrip, 'width', '100%');

  // We do not make the Android container relative, because we aren't positioning the toolbar absolutely.
  const onTap = function () {
    mobile.setReadOnly(mobile.readOnlyOnInit());
    mode.enter();
  };

  const mask = GuiFactory.build(
    TapToEditMask.sketch(onTap, mobile.translate)
  );

  mobile.alloy.add(mask);
  const maskApi = {
    show() {
      mobile.alloy.add(mask);
    },
    hide() {
      mobile.alloy.remove(mask);
    }
  };

  Insert.append(mobile.container, mask.element());

  const mode = AndroidMode.create(mobile, maskApi);

  return {
    setReadOnly: mobile.setReadOnly,
    // Not used.
    refreshStructure: Fun.noop,
    enter: mode.enter,
    exit: mode.exit,
    destroy: Fun.noop
  };
};

export {
  produce
};
