import { navigator } from '@ephox/dom-globals';

const skip = () => navigator.userAgent.indexOf('PhantomJS') > -1;

export {
  skip
};