import { Universe } from '@ephox/boss';
import { Optional } from '@ephox/katamari';
import { Descent } from '@ephox/phoenix';

import { ZoneViewports } from '../api/general/ZoneViewports';
import * as Clustering from '../words/Clustering';
import { WordDecision, WordDecisionItem } from '../words/WordDecision';
import { LanguageZones } from './LanguageZones';
import * as TextZones from './TextZones';
import { Zone } from './Zones';

// a Text Zone enforces a language, and returns Optional.some only if a single zone was identified
// with that language.
const filterZone = <E>(zone: Zone<E>, onlyLang: string): Optional<Zone<E>> => {
  return zone.lang === onlyLang ? Optional.some(zone) : Optional.none<Zone<E>>();
};

const fromBoundedWith = <E, D>(universe: Universe<E, D>, left: E, right: E, envLang: string, onlyLang: string, transform: (universe: Universe<E, D>, item: E) => WordDecisionItem<E>): Optional<Zone<E>> => {
  const output = TextZones.fromBoundedWith(universe, left, right, envLang, transform, ZoneViewports.anything());
  const zones = output.zones;
  return zones.length === 1 ? filterZone(zones[0], onlyLang) : Optional.none<Zone<E>>();
};

const fromBounded = <E, D>(universe: Universe<E, D>, left: E, right: E, envLang: string, onlyLang: string): Optional<Zone<E>> => {
  return fromBoundedWith(universe, left, right, envLang, onlyLang, WordDecision.detail);
};

const fromRange = <E, D>(universe: Universe<E, D>, start: E, finish: E, envLang: string, onlyLang: string): Optional<Zone<E>> => {
  const isLanguageBoundary = LanguageZones.strictBounder(envLang, onlyLang);
  const edges = Clustering.getEdges(universe, start, finish, isLanguageBoundary);
  const transform = TextZones.transformEdges(edges.left, edges.right);
  return fromBoundedWith(universe, edges.left.item, edges.right.item, envLang, onlyLang, transform);
};

const fromInline = <E, D>(universe: Universe<E, D>, element: E, envLang: string, onlyLang: string): Optional<Zone<E>> => {
  const isLanguageBoundary = LanguageZones.strictBounder(envLang, onlyLang);
  const edges = Clustering.getEdges(universe, element, element, isLanguageBoundary);
  const transform = TextZones.transformEdges(edges.left, edges.right);
  return edges.isEmpty ? scour(universe, element, envLang, onlyLang) :
    fromBoundedWith(universe, edges.left.item, edges.right.item, envLang, onlyLang, transform);
};

const scour = <E, D>(universe: Universe<E, D>, element: E, envLang: string, onlyLang: string): Optional<Zone<E>> => {
  const lastOffset = universe.property().isText(element) ? universe.property().getText(element).length : universe.property().children(element).length;
  const left = Descent.toLeaf(universe, element, 0);
  const right = Descent.toLeaf(universe, element, lastOffset);
  return fromBounded(universe, left.element, right.element, envLang, onlyLang);
};

const empty = <E>(): Optional<Zone<E>> => {
  return Optional.none<Zone<E>>();
};

export {
  fromRange,
  fromBounded,
  fromInline,
  empty
};
