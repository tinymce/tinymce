import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';

import * as Structure from '../general/Structure';

const universe = DomUniverse();

const isBlock = (element: SugarElement): boolean => {
  return Structure.isBlock(universe, element);
};

const isList = (element: SugarElement): boolean => {
  return Structure.isList(universe, element);
};

const isFormatting = (element: SugarElement): boolean => {
  return Structure.isFormatting(universe, element);
};

const isHeading = (element: SugarElement): boolean => {
  return Structure.isHeading(universe, element);
};

const isContainer = (element: SugarElement): boolean => {
  return Structure.isContainer(universe, element);
};

const isEmptyTag = (element: SugarElement): boolean => {
  return Structure.isEmptyTag(universe, element);
};

const isFrame = (element: SugarElement): boolean => {
  return Structure.isFrame(universe, element);
};

const isInline = (element: SugarElement): boolean => {
  return Structure.isInline(universe, element);
};

export {
  isBlock,
  isList,
  isFormatting,
  isHeading,
  isContainer,
  isEmptyTag,
  isFrame,
  isInline
};
