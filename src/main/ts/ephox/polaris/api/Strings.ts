import Sanitise from '../string/Sanitise';
import Split from '../string/Split';

type SplitsApi = (value: string, indices: number[]) => string[];
const splits: SplitsApi = Split.splits;

type CssSanitiseApi = (str: string) => string;
const cssSanitise: CssSanitiseApi = Sanitise.css;

export default {
  cssSanitise,
  splits
};