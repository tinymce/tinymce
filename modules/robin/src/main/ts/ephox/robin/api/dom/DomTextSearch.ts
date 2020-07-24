import { DomUniverse } from '@ephox/boss';
import { Document } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { TextSeekerPhaseProcessor } from '../../textdata/TextSeeker';
import { TextSearch, TextSearchSeeker } from '../general/TextSearch';

const universe = DomUniverse();

const previousChar = function (text: string, offset: Option<number>) {
  return TextSearch.previousChar(text, offset);
};

const nextChar = function (text: string, offset: Option<number>) {
  return TextSearch.nextChar(text, offset);
};

const repeatLeft = function (item: SugarElement, offset: number, process: TextSeekerPhaseProcessor<SugarElement, Document>) {
  return TextSearch.repeatLeft(universe, item, offset, process);
};

const repeatRight = function (item: SugarElement, offset: number, process: TextSeekerPhaseProcessor<SugarElement, Document>) {
  return TextSearch.repeatRight(universe, item, offset, process);
};

const expandLeft = function (item: SugarElement, offset: number, rawSeeker: TextSearchSeeker) {
  return TextSearch.expandLeft(universe, item, offset, rawSeeker);
};

const expandRight = function (item: SugarElement, offset: number, rawSeeker: TextSearchSeeker) {
  return TextSearch.expandRight(universe, item, offset, rawSeeker);
};

const scanRight = function (item: SugarElement, offset: number) {
  return TextSearch.scanRight(universe, item, offset);
};

export {
  previousChar,
  nextChar,
  repeatLeft,
  repeatRight,
  expandLeft,
  expandRight,
  scanRight
};
