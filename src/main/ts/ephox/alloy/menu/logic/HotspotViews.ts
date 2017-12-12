import Focusing from '../../api/behaviour/Focusing';
import Sandboxing from '../../api/behaviour/Sandboxing';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var onEscape = function (anchor, sandbox) {

  Sandboxing.closeSandbox(sandbox);
  // TODO: Move.
  if (anchor.anchor === 'hotspot') Focusing.focus(anchor.hotspot);
  else if (anchor.anchor === 'makeshift') {
    anchor.onEscape(sandbox);
  }
  return Option.some(true);
};

export default <any> {
  onEscape: onEscape
};