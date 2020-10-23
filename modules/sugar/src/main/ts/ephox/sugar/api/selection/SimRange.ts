import { SugarElement } from '../node/SugarElement';

export interface SimRange {
  readonly start: SugarElement<Node>;
  readonly soffset: number;
  readonly finish: SugarElement<Node>;
  readonly foffset: number;
}

const create = (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number): SimRange => ({
  start,
  soffset,
  finish,
  foffset
});

// tslint:disable-next-line:variable-name
export const SimRange = {
  create
};
