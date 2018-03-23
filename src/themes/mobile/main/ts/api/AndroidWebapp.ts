import { GuiFactory } from '@ephox/alloy';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Css, Insert } from '@ephox/sugar';

import AndroidMode from '../android/core/AndroidMode';
import TapToEditMask from '../touch/view/TapToEditMask';
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
    mobile.setReadOnly(true);
    mode.enter();
  };

  const mask = GuiFactory.build(
    TapToEditMask.sketch(onTap, mobile.translate)
  );

  mobile.alloy.add(mask);
  const maskApi = {
    show () {
      mobile.alloy.add(mask);
    },
    hide () {
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

export default {
  produce
};