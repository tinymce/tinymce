import { Universe } from '@ephox/boss';
import { Option } from '@ephox/katamari';
import { Descent } from '@ephox/phoenix';
import { ZoneViewports } from '../api/general/ZoneViewports';
import Clustering from '../words/Clustering';
import { WordDecision, WordDecisionItem } from '../words/WordDecision';
import { LanguageZones } from './LanguageZones';
import TextZones from './TextZones';
import { Zone } from './Zones';

// a Text Zone enforces a language, and returns Option.some only if a single zone was identified
// with that language.
const filterZone = function <E> (zone: Zone<E>, onlyLang: string) {
  return zone.lang() === onlyLang ? Option.some(zone) : Option.none<Zone<E>>();
};

const fromBoundedWith = function <E, D> (universe: Universe<E, D>, left: E, right: E, envLang: string, onlyLang: string, transform: (universe: Universe<E, D>, item: E) => WordDecisionItem<E>) {
  const output = TextZones.fromBoundedWith(universe, left, right, envLang, transform, ZoneViewports.anything());
  const zones = output.zones();
  return zones.length === 1 ? filterZone(zones[0], onlyLang) : Option.none<Zone<E>>();
};

const fromBounded = function <E, D> (universe: Universe<E, D>, left: E, right: E, envLang: string, onlyLang: string) {
  return fromBoundedWith(universe, left, right, envLang, onlyLang, WordDecision.detail);
};

const fromRange = function <E, D> (universe: Universe<E, D>, start: E, finish: E, envLang: string, onlyLang: string) {
  const isLanguageBoundary = LanguageZones.strictBounder(envLang, onlyLang);
  const edges = Clustering.getEdges(universe, start, finish, isLanguageBoundary);
  const transform = TextZones.transformEdges(edges.left(), edges.right());
  return fromBoundedWith(universe, edges.left().item(), edges.right().item(), envLang, onlyLang, transform);
};

const fromInline = function <E, D> (universe: Universe<E, D>, element: E, envLang: string, onlyLang: string) {
  const isLanguageBoundary = LanguageZones.strictBounder(envLang, onlyLang);
  const edges = Clustering.getEdges(universe, element, element, isLanguageBoundary);
  const transform = TextZones.transformEdges(edges.left(), edges.right());
  return edges.isEmpty() ? scour(universe, element, envLang, onlyLang) :
    fromBoundedWith(universe, edges.left().item(), edges.right().item(), envLang, onlyLang, transform);
};

const scour = function <E, D> (universe: Universe<E, D>, element: E, envLang: string, onlyLang: string) {
  const lastOffset = universe.property().isText(element) ? universe.property().getText(element).length : universe.property().children(element).length;
  const left = Descent.toLeaf(universe, element, 0);
  const right = Descent.toLeaf(universe, element, lastOffset);
  return fromBounded(universe, left.element(), right.element(), envLang, onlyLang);
};

const empty = function <E> () {
  return Option.none<Zone<E>>();
};

export default {
  fromRange,
  fromBounded,
  fromInline,
  empty
};