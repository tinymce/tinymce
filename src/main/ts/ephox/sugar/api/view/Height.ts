import Body from '../node/Body';
import Css from '../properties/Css';
import Dimension from '../../impl/Dimension';

var api = Dimension('height', function (element) {
  // getBoundingClientRect gives better results than offsetHeight for tables with captions on Firefox
  return Body.inBody(element) ? element.dom().getBoundingClientRect().height : element.dom().offsetHeight;
});

var set = function (element, h) {
  api.set(element, h);
};

var get = function (element) {
  return api.get(element);
};

var getOuter = function (element) {
  return api.getOuter(element);
};

var setMax = function (element, value) {
  // These properties affect the absolute max-height, they are not counted natively, we want to include these properties.
  var inclusions = [ 'margin-top', 'border-top-width', 'padding-top', 'padding-bottom', 'border-bottom-width', 'margin-bottom' ];
  var absMax = api.max(element, value, inclusions);
  Css.set(element, 'max-height', absMax + 'px');
};

export default <any> {
  set: set,
  get: get,
  getOuter: getOuter,
  setMax: setMax
};