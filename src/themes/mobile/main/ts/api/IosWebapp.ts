import { GuiFactory } from '@ephox/alloy';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Css } from '@ephox/sugar';
import MobileSchema from './MobileSchema';
import IosMode from '../ios/core/IosMode';
import TapToEditMask from '../touch/view/TapToEditMask';

export interface MobileWebApp {
  setReadOnly(): void;
  refreshStructure(): void;
  enter(): void;
  exit(): void;
  destroy(): void;
}

const produce = function (raw: {any}): MobileWebApp {
  const mobile = ValueSchema.asRawOrDie(
    'Getting IosWebapp schema',
    MobileSchema,
    raw
  );

  /* Make the toolbar */
  Css.set(mobile.toolstrip, 'width', '100%');
  Css.set(mobile.container, 'position', 'relative');

  const onView = function () {
    mobile.setReadOnly(mobile.readOnlyOnInit());
    mode.enter();
  };

  const mask = GuiFactory.build(
    TapToEditMask.sketch(onView, mobile.translate)
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

  const mode = IosMode.create(mobile, maskApi);

  return {
    setReadOnly: mobile.setReadOnly,
    refreshStructure: mode.refreshStructure,
    enter: mode.enter,
    exit: mode.exit,
    destroy: Fun.noop  // TODO: lifecycle hookup
  };
};

export default {
  produce
};