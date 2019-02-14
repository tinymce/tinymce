import { Struct } from '@ephox/katamari';

export interface GatherResult {
  result(): any; // TODO narrow types
  pruned(): any;
}

type GatherResultConstructor = (result: any, pruned: any) => GatherResult;

export const GatherResult = <GatherResultConstructor>Struct.immutable('result', 'pruned');