import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';
import * as Structure from '../general/Structure';

const universe = DomUniverse();

const isBlock = function (element: SugarElement): boolean {
  return Structure.isBlock(universe, element);
};

const isList = function (element: SugarElement): boolean {
  return Structure.isList(universe, element);
};

const isFormatting = function (element: SugarElement): boolean {
  return Structure.isFormatting(universe, element);
};

const isHeading = function (element: SugarElement): boolean {
  return Structure.isHeading(universe, element);
};

const isContainer = function (element: SugarElement): boolean {
  return Structure.isContainer(universe, element);
};

const isEmptyTag = function (element: SugarElement): boolean {
  return Structure.isEmptyTag(universe, element);
};

const isFrame = function (element: SugarElement): boolean {
  return Structure.isFrame(universe, element);
};

const isInline = function (element: SugarElement): boolean {
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
