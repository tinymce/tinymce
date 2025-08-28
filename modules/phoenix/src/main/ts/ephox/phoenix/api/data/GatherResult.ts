export interface GatherResult {
  readonly result: any; // TODO narrow types
  readonly pruned: boolean;
}

export const GatherResult = (result: any, pruned: boolean): GatherResult => ({
  result,
  pruned
});
