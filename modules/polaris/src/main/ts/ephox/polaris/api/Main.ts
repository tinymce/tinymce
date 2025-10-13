import type { PRange, PRegExp } from '../pattern/Types';
import type { WordOptions } from '../words/Words';

import * as Arrays from './Arrays';
import * as PathPattern from './PathPattern';
import * as Pattern from './Pattern';
import * as PositionArray from './PositionArray';
import * as Regexes from './Regexes';
import * as Search from './Search';
import { Splitting } from './Splitting';
import * as Strings from './Strings';
import * as Url from './Url';
import * as Words from './Words';

export type { PRange, PRegExp, WordOptions };
export {
  Arrays,
  PathPattern,
  Pattern,
  PositionArray,
  Regexes,
  Search,
  Splitting,
  Strings,
  Url,
  Words
};
