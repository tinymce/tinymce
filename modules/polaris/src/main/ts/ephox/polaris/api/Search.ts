import { PRange, PRegExp } from '../pattern/Types';
import * as Find from '../search/Find';
import * as Sleuth from '../search/Sleuth';

type FindallApi = (input: string, pattern: PRegExp) => PRange[];
const findall: FindallApi = Find.all;

type FindmanyApi = <T extends { pattern: PRegExp }>(text: string, targets: T[]) => Array<T & PRange>;
const findmany: FindmanyApi = Sleuth.search;

export {
  findall,
  findmany
};
