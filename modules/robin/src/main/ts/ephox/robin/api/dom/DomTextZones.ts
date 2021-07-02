import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';
import { ShouldSkip } from '../../zone/ZoneWalker';
import * as TextZones from '../general/TextZones';
import { ZoneViewports } from '../general/ZoneViewports';

const universe = DomUniverse();

const single = (element: SugarElement, envLang: string, viewport: ZoneViewports<SugarElement>, shouldSkip?: ShouldSkip<SugarElement>): TextZones.Zones<SugarElement> => {
  return TextZones.single(universe, element, envLang, viewport, shouldSkip);
};

const range = (start: SugarElement, soffset: number, finish: SugarElement, foffset: number, envLang: string, viewport: ZoneViewports<SugarElement>, shouldSkip?: ShouldSkip<SugarElement>): TextZones.Zones<SugarElement> => {
  return TextZones.range(universe, start, soffset, finish, foffset, envLang, viewport, shouldSkip);
};

const empty = (): TextZones.Zones<SugarElement> => {
  return TextZones.empty<SugarElement>();
};

export {
  single,
  range,
  empty
};
