import Find from '../search/Find';
import Sleuth from '../search/Sleuth';
import { PRange, PRegExp } from '../pattern/Types';

type FindallApi = (input: string, pattern: PRegExp) => PRange[];
const findall: FindallApi = Find.all;

type FindmanyApi = <T extends { pattern: () => PRegExp; }>(text: string, targets: T[]) => (T & PRange)[];
const findmany: FindmanyApi = Sleuth.search;

export default {
  findall,
  findmany
};