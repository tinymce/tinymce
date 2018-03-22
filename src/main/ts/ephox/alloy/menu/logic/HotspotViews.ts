import { Option } from '@ephox/katamari';

import { Focusing } from '../../api/behaviour/Focusing';
import { Sandboxing } from '../../api/behaviour/Sandboxing';

const onEscape = function (anchor, sandbox) {

  Sandboxing.closeSandbox(sandbox);
  // TODO: Move.
  if (anchor.anchor === 'hotspot') { Focusing.focus(anchor.hotspot); } else if (anchor.anchor === 'makeshift') {
    anchor.onEscape(sandbox);
  }
  return Option.some(true);
};

export default <any> {
  onEscape
};