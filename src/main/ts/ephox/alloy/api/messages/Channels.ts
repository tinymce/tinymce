import { Fun } from '@ephox/katamari';
import { StringConstant } from '../../alien/TypeDefinitions';

const dismissPopups = Fun.constant('dismiss.popups') as StringConstant;
const mouseReleased = Fun.constant('mouse.released') as StringConstant;

export {
  dismissPopups,
  mouseReleased
};