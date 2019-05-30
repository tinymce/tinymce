import { Universe } from '@ephox/boss';
import * as Group from '../../family/Group';
import * as Range from '../../family/Range';
import { TypedItem } from '../data/TypedItem';

type RangeApi = <E, D>(universe: Universe<E, D>, item1: E, delta1: number, item2: E, delta2: number) => E[];
const range: RangeApi = Range.range;

type GroupApi = <E, D>(universe: Universe<E, D>, items: E[], optimise?: (e: E) => boolean) => TypedItem<E, D>[][];
const group: GroupApi = Group.group;

export {
  range,
  group
};