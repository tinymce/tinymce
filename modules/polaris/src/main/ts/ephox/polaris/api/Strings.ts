import * as Sanitise from '../string/Sanitise';
import * as Split from '../string/Split';

type CssSanitiseApi = (str: string) => string;

type SplitsApi = (value: string, indices: number[]) => string[];
const splits: SplitsApi = Split.splits;

const cssSanitise: CssSanitiseApi = Sanitise.css;

export {
  cssSanitise,
  splits
};