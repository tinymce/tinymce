import * as Seeker from '../gather/Seeker'; // robin is using this directly
import { Focus } from './data/Focus';
import { GatherResult } from './data/GatherResult';
import { InjectPosition } from './data/InjectPosition';
import { NamedPattern } from './data/NamedPattern';
import { SplitPosition } from './data/SplitPosition';
import * as Spot from './data/Spot';
import { TextSplit } from './data/TextSplit';
import { TypedItem } from './data/TypedItem';
import { Direction, SearchResult, SpanWrapRange, SpotDelta, SpotPoint, SpotPoints, SpotRange, SpotText, Successor, Transition, Traverse, Wrapter } from './data/Types';
import * as DomDescent from './dom/DomDescent';
import * as DomExtract from './dom/DomExtract';
import * as DomFamily from './dom/DomFamily';
import * as DomGather from './dom/DomGather';
import * as DomInjection from './dom/DomInjection';
import * as DomSearch from './dom/DomSearch';
import * as DomSplit from './dom/DomSplit';
import * as DomWrapping from './dom/DomWrapping';
import * as Descent from './general/Descent';
import * as Extract from './general/Extract';
import * as Family from './general/Family';
import * as Gather from './general/Gather';
import * as Injection from './general/Injection';
import * as Search from './general/Search';
import * as Split from './general/Split';
import * as Wrapping from './general/Wrapping';

export {
  Focus,
  GatherResult,
  InjectPosition,
  NamedPattern,
  SplitPosition,
  Spot,
  TextSplit,
  TypedItem,
  SpotPoint,
  SpotDelta,
  SpotRange,
  SpotPoints,
  SpotText,
  SearchResult,
  Direction,
  Transition,
  Traverse,
  Successor,
  Wrapter,
  SpanWrapRange,
  DomDescent,
  DomExtract,
  DomFamily,
  DomGather,
  DomInjection,
  DomSearch,
  DomSplit,
  DomWrapping,
  Descent,
  Extract,
  Family,
  Gather,
  Injection,
  Search,
  Split,
  Wrapping,
  Seeker
};