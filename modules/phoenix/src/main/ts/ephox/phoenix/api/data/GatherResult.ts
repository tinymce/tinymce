import { Struct } from '@ephox/katamari';

export interface GatherResult {
  result(): any; // TODO narrow types
  pruned(): boolean;
}

type GatherResultConstructor = (result: any, pruned: boolean) => GatherResult;

export const GatherResult = <GatherResultConstructor> Struct.immutable('result', 'pruned');