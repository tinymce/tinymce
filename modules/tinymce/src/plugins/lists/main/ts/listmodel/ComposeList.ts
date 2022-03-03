import { Arr, Optional, Optionals } from '@ephox/katamari';
import { Attribute, Css, Insert, InsertAll, Replication, SugarElement, SugarNode } from '@ephox/sugar';

import { Entry } from './Entry';
import { ListType } from './Util';

interface Segment {
  list: SugarElement<HTMLElement>;
  item: SugarElement<HTMLElement>;
}

const joinSegment = (parent: Segment, child: Segment): void => {
  Insert.append(parent.item, child.list);
};

const joinSegments = (segments: Segment[]): void => {
  for (let i = 1; i < segments.length; i++) {
    joinSegment(segments[i - 1], segments[i]);
  }
};

const appendSegments = (head: Segment[], tail: Segment[]): void => {
  Optionals.lift2(Arr.last(head), Arr.head(tail), joinSegment);
};

const createSegment = (scope: Document, listType: ListType): Segment => {
  const segment: Segment = {
    list: SugarElement.fromTag(listType, scope),
    item: SugarElement.fromTag('li', scope)
  };
  Insert.append(segment.list, segment.item);
  return segment;
};

const createSegments = (scope: Document, entry: Entry, size: number): Segment[] => {
  const segments: Segment[] = [];
  for (let i = 0; i < size; i++) {
    segments.push(createSegment(scope, entry.listType));
  }
  return segments;
};

const populateSegments = (segments: Segment[], entry: Entry): void => {
  for (let i = 0; i < segments.length - 1; i++) {
    Css.set(segments[i].item, 'list-style-type', 'none');
  }
  Arr.last(segments).each((segment) => {
    Attribute.setAll(segment.list, entry.listAttributes);
    Attribute.setAll(segment.item, entry.itemAttributes);
    InsertAll.append(segment.item, entry.content);
  });
};

const normalizeSegment = (segment: Segment, entry: Entry): void => {
  if (SugarNode.name(segment.list) !== entry.listType) {
    segment.list = Replication.mutate(segment.list, entry.listType);
  }
  Attribute.setAll(segment.list, entry.listAttributes);
};

const createItem = (scope: Document, attr: Record<string, any>, content: SugarElement[]): SugarElement => {
  const item = SugarElement.fromTag('li', scope);
  Attribute.setAll(item, attr);
  InsertAll.append(item, content);
  return item;
};

const appendItem = (segment: Segment, item: SugarElement): void => {
  Insert.append(segment.list, item);
  segment.item = item;
};

const writeShallow = (scope: Document, cast: Segment[], entry: Entry): Segment[] => {
  const newCast = cast.slice(0, entry.depth);

  Arr.last(newCast).each((segment) => {
    const item = createItem(scope, entry.itemAttributes, entry.content);
    appendItem(segment, item);
    normalizeSegment(segment, entry);
  });

  return newCast;
};

const writeDeep = (scope: Document, cast: Segment[], entry: Entry): Segment[] => {
  const segments = createSegments(scope, entry, entry.depth - cast.length);
  joinSegments(segments);
  populateSegments(segments, entry);
  appendSegments(cast, segments);

  return cast.concat(segments);
};

const composeList = (scope: Document, entries: Entry[]): Optional<SugarElement<HTMLElement>> => {
  const cast = Arr.foldl(entries, (cast, entry) => {
    return entry.depth > cast.length ? writeDeep(scope, cast, entry) : writeShallow(scope, cast, entry);
  }, [] as Segment[]);

  return Arr.head(cast).map((segment) => segment.list);
};

export { composeList };
