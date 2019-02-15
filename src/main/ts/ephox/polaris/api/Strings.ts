import * as Sanitise from '../string/Sanitise';
import * as Split from '../string/Split';

type SplitsApi = (value: string, indices: number[]) => string[];
const splits: SplitsApi = Split.splits;

type CssSanitiseApi = (str: string) => string;
const cssSanitise: CssSanitiseApi = Sanitise.css;

export {
  cssSanitise,
  splits
};