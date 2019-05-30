import { DomUniverse } from '@ephox/boss';
import Structure from '../general/Structure';

var universe = DomUniverse();

var isBlock = function (element) {
  return Structure.isBlock(universe, element);
};

var isList = function (element) {
  return Structure.isList(universe, element);
};

var isFormatting = function (element) {
  return Structure.isFormatting(universe, element);
};

var isHeading = function (element) {
  return Structure.isHeading(universe, element);
};

var isContainer = function (element) {
  return Structure.isContainer(universe, element);
};

var isEmptyTag = function (element) {
  return Structure.isEmptyTag(universe, element);
};

var isFrame = function (element) {
  return Structure.isFrame(universe, element);
};

var isInline = function (element) {
  return Structure.isInline(universe, element);
};

export default <any> {
  isBlock: isBlock,
  isList: isList,
  isFormatting: isFormatting,
  isHeading: isHeading,
  isContainer: isContainer,
  isEmptyTag: isEmptyTag,
  isFrame: isFrame,
  isInline: isInline
};