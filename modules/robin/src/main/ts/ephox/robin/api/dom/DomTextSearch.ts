import { DomUniverse } from '@ephox/boss';
import { Optional } from '@ephox/katamari';
import { SpotPoint } from '@ephox/phoenix';
import { SugarElement } from '@ephox/sugar';
import { CharPos } from '../../textdata/TextSearch';
import { TextSeekerOutcome, TextSeekerPhaseProcessor } from '../../textdata/TextSeeker';
import { TextSearch, TextSearchSeeker } from '../general/TextSearch';

const universe = DomUniverse();

const previousChar = function (text: string, offset: Optional<number>): Optional<CharPos> {
  return TextSearch.previousChar(text, offset);
};

const nextChar = function (text: string, offset: Optional<number>): Optional<CharPos> {
  return TextSearch.nextChar(text, offset);
};

const repeatLeft = function (item: SugarElement, offset: number, process: TextSeekerPhaseProcessor<SugarElement, Document>): TextSeekerOutcome<SugarElement> {
  return TextSearch.repeatLeft(universe, item, offset, process);
};

const repeatRight = function (item: SugarElement, offset: number, process: TextSeekerPhaseProcessor<SugarElement, Document>): TextSeekerOutcome<SugarElement> {
  return TextSearch.repeatRight(universe, item, offset, process);
};

const expandLeft = function (item: SugarElement, offset: number, rawSeeker: TextSearchSeeker): TextSeekerOutcome<SugarElement> {
  return TextSearch.expandLeft(universe, item, offset, rawSeeker);
};

const expandRight = function (item: SugarElement, offset: number, rawSeeker: TextSearchSeeker): TextSeekerOutcome<SugarElement> {
  return TextSearch.expandRight(universe, item, offset, rawSeeker);
};

const scanRight = function (item: SugarElement, offset: number): Optional<SpotPoint<SugarElement>> {
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
