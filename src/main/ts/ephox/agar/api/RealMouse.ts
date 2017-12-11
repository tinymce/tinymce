import SeleniumAction from '../server/SeleniumAction';

var sActionOn = function (selector, type) {
  return SeleniumAction.sPerform('/mouse', {
    selector: selector,
    type: type
  });
};

var sMoveToOn = function (selector) {
  return sActionOn(selector, 'move');
};

var sDownOn = function (selector) {
  return sActionOn(selector, 'down');
};

var sUpOn = function (selector) {
  return sActionOn(selector, 'up');
};

var sClickOn = function (selector) {
  return sActionOn(selector, 'click');
};

export default <any> {
  sMoveToOn: sMoveToOn,
  sDownOn: sDownOn,
  sUpOn: sUpOn,
  sClickOn: sClickOn
};