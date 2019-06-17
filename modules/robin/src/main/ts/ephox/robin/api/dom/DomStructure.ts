import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import Structure from '../general/Structure';

const universe = DomUniverse();

const isBlock = function (element: Element) {
  return Structure.isBlock(universe, element);
};

const isList = function (element: Element) {
  return Structure.isList(universe, element);
};

const isFormatting = function (element: Element) {
  return Structure.isFormatting(universe, element);
};

const isHeading = function (element: Element) {
  return Structure.isHeading(universe, element);
};

const isContainer = function (element: Element) {
  return Structure.isContainer(universe, element);
};

const isEmptyTag = function (element: Element) {
  return Structure.isEmptyTag(universe, element);
};

const isFrame = function (element: Element) {
  return Structure.isFrame(universe, element);
};

const isInline = function (element: Element) {
  return Structure.isInline(universe, element);
};

export default {
  isBlock,
  isList,
  isFormatting,
  isHeading,
  isContainer,
  isEmptyTag,
  isFrame,
  isInline
};