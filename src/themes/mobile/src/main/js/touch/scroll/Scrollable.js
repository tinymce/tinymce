import { Fun } from '@ephox/katamari';
import { Class } from '@ephox/sugar';
import Styles from '../../style/Styles';

var scrollable = Styles.resolve('scrollable');

var register = function (element) {
/*
 *  The reason this function exists is to have a
 *  central place where to set if an element can be explicitly
 *  scrolled. This is for mobile devices atm.
 */
  Class.add(element, scrollable);
};

var deregister = function (element) {
  Class.remove(element, scrollable);
};

export default <any> {
  register: register,
  deregister: deregister,
  scrollable: Fun.constant(scrollable)
};