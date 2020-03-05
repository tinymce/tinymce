import { Option, Fun } from '@ephox/katamari';
import { Situs } from './Situs';

export interface Response {
  selection: () => Option<Situs>;
  kill: () => boolean;
}

const create = (selection: Option<Situs>, kill: boolean): Response => ({
  selection: Fun.constant(selection),
  kill: Fun.constant(kill)
});

export const Response = {
  create
};
