import { Optional } from '@ephox/katamari';

import { Situs } from './Situs';

export interface Response {
  readonly selection: Optional<Situs>;
  readonly kill: boolean;
}

const create = (selection: Optional<Situs>, kill: boolean): Response => ({
  selection,
  kill
});

export const Response = {
  create
};
