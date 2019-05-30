import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import ClusterSearch from './ClusterSearch';
import WordDecision from './WordDecision';
import LanguageZones from '../zone/LanguageZones';

// This identifies the inline edges to the left and right, ignoring any language
// boundaries
var byBoundary = function (universe, item) {
  var isCustomBoundary = Fun.constant(false);

  var edges = getEdges(universe, item, item, isCustomBoundary);
 
  var isMiddleEmpty = function () {
    return ClusterSearch.isEmpty(universe, item);
  };

  var isEmpty = edges.isEmpty() && isMiddleEmpty();

  return {
    left: edges.left,
    right: edges.right,
    isEmpty: Fun.constant(isEmpty)
  };
};

// This identifies the edges to the left and right, using a custom boundaryFunction
// to use in addition to normal boundaries. Often, it's language
var getEdges = function (universe, start, finish, isCustomBoundary) {
  var toLeft = ClusterSearch.creepLeft(universe, start, isCustomBoundary);
  var toRight = ClusterSearch.creepRight(universe, finish, isCustomBoundary);

  var leftEdge = toLeft.length > 0 ? toLeft[toLeft.length - 1] : WordDecision.fromItem(universe, start);
  var rightEdge = toRight.length > 0 ? toRight[toRight.length - 1] : WordDecision.fromItem(universe, finish);

  var isEmpty = toLeft.length === 0 && toRight.length === 0;

  return {
    left: Fun.constant(leftEdge),
    right: Fun.constant(rightEdge),
    isEmpty: Fun.constant(isEmpty)     
  };
};

// Return a grouping of: left, middle, right, lang, and all. It will use 
// language boundaries in addition to the normal block boundaries. Use this 
// to create a cluster of the same language.
var byLanguage = function (universe, item) {
  var optLang = LanguageZones.calculate(universe, item);
  var isLanguageBoundary = LanguageZones.softBounder(optLang);

  var toLeft = ClusterSearch.creepLeft(universe, item, isLanguageBoundary);
  var toRight = ClusterSearch.creepRight(universe, item, isLanguageBoundary);
  var middle =  universe.property().isText(item) ? [ WordDecision.detail(universe, item) ] : [ ];

  var all = Arr.reverse(toLeft).concat(middle).concat(toRight);

  return {
    all: Fun.constant(all),
    left: Fun.constant(toLeft),
    middle: Fun.constant(middle),
    right: Fun.constant(toRight),
    lang: Fun.constant(optLang)
  };
};

export default <any> {
  byBoundary: byBoundary,
  getEdges: getEdges,
  byLanguage: byLanguage
};