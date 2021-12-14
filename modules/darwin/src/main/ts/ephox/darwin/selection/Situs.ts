import { Situ, SugarElement } from '@ephox/sugar';

export interface Situs {
  readonly start: Situ;
  readonly finish: Situ;
}

const create = (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number): Situs => {
  return {
    start: Situ.on(start, soffset),
    finish: Situ.on(finish, foffset)
  };
};

export const Situs = {
  create
};
