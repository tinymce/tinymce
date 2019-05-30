import { navigator } from '@ephox/dom-globals';

const skip = () => {
  return navigator.userAgent.indexOf('PhantomJS') > -1;
};

export {
  skip
};