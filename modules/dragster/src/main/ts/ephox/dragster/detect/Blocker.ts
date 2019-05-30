import Styles from '../style/Styles';
import { Merger } from '@ephox/katamari';
import { Remove } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';
import { Class } from '@ephox/sugar';
import { Css } from '@ephox/sugar';



export default <any> function (options) {
  var settings = Merger.merge({
    'layerClass': Styles.resolve('blocker')
  }, options);

  var div = Element.fromTag('div');
  Attr.set(div, 'role', 'presentation');
  Css.setAll(div, {
    position: 'fixed',
    left: '0px',
    top: '0px',
    width: '100%',
    height: '100%'
  });

  Class.add(div, Styles.resolve('blocker'));
  Class.add(div, settings.layerClass);

  var element = function () {
    return div;
  };

  var destroy = function () {
    Remove.remove(div);
  };

  return {
    element: element,
    destroy: destroy
  };
};