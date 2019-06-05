import { Struct, Option } from '@ephox/katamari';
import { Situs } from './Situs';

export interface Response {
  selection: () => Option<Situs>;
  kill: () => boolean;
}

const create: (selection: Option<Situs>, kill: boolean) => Response = Struct.immutable('selection', 'kill');

export const Response = {
  create
};