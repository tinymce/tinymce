import { SugarElement } from '@ephox/sugar';

export interface Pattern {
  readonly regex: RegExp;
  readonly matchIndex: number;
}

export interface Position {
  readonly start: number;
  readonly finish: number;
}

export interface TextSection {
  sOffset: number;
  fOffset: number;
  readonly elements: SugarElement<Text>[];
}

export interface TextMatch extends Position {
  readonly element: SugarElement<Text>;
}
