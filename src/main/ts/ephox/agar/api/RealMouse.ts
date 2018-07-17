import * as SeleniumAction from '../server/SeleniumAction';

const sActionOn = function <T>(selector: string, type: string) {
  return SeleniumAction.sPerform<T>('/mouse', {
    selector: selector,
    type: type
  });
};

const sMoveToOn = function <T>(selector: string) {
  return sActionOn<T>(selector, 'move');
};

const sDownOn = function <T>(selector: string) {
  return sActionOn<T>(selector, 'down');
};

const sUpOn = function <T>(selector: string) {
  return sActionOn<T>(selector, 'up');
};

const sClickOn = function <T>(selector: string) {
  return sActionOn<T>(selector, 'click');
};

export {
  sMoveToOn,
  sDownOn,
  sUpOn,
  sClickOn
};