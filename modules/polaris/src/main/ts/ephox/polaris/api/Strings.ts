import * as Sanitise from '../string/Sanitise';
import * as Split from '../string/Split';
import * as Url from '../string/Url';

type SplitsApi = (value: string, indices: number[]) => string[];
const splits: SplitsApi = Split.splits;

type CssSanitiseApi = (str: string) => string;
const cssSanitise: CssSanitiseApi = Sanitise.css;

const extractUrlHost = Url.extractHost;

export {
  cssSanitise,
  extractUrlHost,
  splits
};
