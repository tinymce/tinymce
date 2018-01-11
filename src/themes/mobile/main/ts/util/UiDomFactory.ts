import { DomFactory } from '@ephox/alloy';
import { Strings } from '@ephox/katamari';
import Styles from '../style/Styles';

const dom = function (rawHtml) {
  const html = Strings.supplant(rawHtml, {
    prefix: Styles.prefix()
  });
  return DomFactory.fromHtml(html);
};

const spec = function (rawHtml) {
  const sDom = dom(rawHtml);
  return {
    dom: sDom
  };
};

export default {
  dom,
  spec
};