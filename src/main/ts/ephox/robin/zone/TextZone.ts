import { Option } from '@ephox/katamari';
import { Descent } from '@ephox/phoenix';
import ZoneViewports from '../api/general/ZoneViewports';
import Clustering from '../words/Clustering';
import WordDecision from '../words/WordDecision';
import LanguageZones from './LanguageZones';
import TextZones from './TextZones';

var viewport = ZoneViewports.anything();

// a Text Zone enforces a language, and returns Option.some only if a single zone was identified
// with that language.
var filterZone = function (zone, onlyLang) {
  return zone.lang() === onlyLang ? Option.some(zone) : Option.none();
};

var fromBoundedWith = function (universe, left, right, envLang, onlyLang, transform) {
  var output = TextZones.fromBoundedWith(universe, left, right, envLang, transform, viewport);
  var zones = output.zones();
  return zones.length === 1 ? filterZone(zones[0], onlyLang) : Option.none();
};

var fromBounded = function (universe, left, right, envLang, onlyLang) {
  return fromBoundedWith(universe, left, right, envLang, onlyLang, WordDecision.detail);
};

var fromRange = function (universe, start, finish, envLang, onlyLang) {
  var isLanguageBoundary = LanguageZones.strictBounder(envLang, onlyLang);
  var edges = Clustering.getEdges(universe, start, finish, isLanguageBoundary);
  var transform = TextZones.transformEdges(edges.left(), edges.right());
  return fromBoundedWith(universe, edges.left().item(), edges.right().item(), envLang, onlyLang, transform);
};

var fromInline = function (universe, element, envLang, onlyLang) {
  var isLanguageBoundary = LanguageZones.strictBounder(envLang, onlyLang);
  var edges = Clustering.getEdges(universe, element, element, isLanguageBoundary);
  var transform = TextZones.transformEdges(edges.left(), edges.right());
  return edges.isEmpty() ? scour(universe, element, envLang, onlyLang) :
    fromBoundedWith(universe, edges.left().item(), edges.right().item(), envLang, onlyLang, transform);
};

var scour = function (universe, element, envLang, onlyLang) {
  var lastOffset = universe.property().isText(element) ? universe.property().getText(element) : universe.property().children(element).length;
  var left = Descent.toLeaf(universe, element, 0);
  var right = Descent.toLeaf(universe, element, lastOffset);
  return fromBounded(universe, left.element(), right.element(), envLang, onlyLang);
};

var empty = function () {
  return Option.none();
};

export default <any> {
  fromRange: fromRange,
  fromBounded: fromBounded,
  fromInline: fromInline,
  empty: empty
};