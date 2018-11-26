/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Document } from '@ephox/dom-globals';
import { Arr, Option, Options } from '@ephox/katamari';
import { Attr, Css, Element, Insert, InsertAll, Node, Replication } from '@ephox/sugar';
import { Entry } from './Entry';
import { ListType } from './ListType';

interface Section {
  list: Element;
  item: Element;
}

const createSection = (scope: Document, listType: ListType): Section => {
  const section: Section = {
    list: Element.fromTag(listType, scope),
    item: Element.fromTag('li', scope)
  };
  Insert.append(section.list, section.item);
  return section;
};

const joinSections = (parent: Section, appendor: Section): void => {
  Insert.append(parent.item, appendor.list);
};

const createJoinedSections = (scope: Document, length: number, listType: ListType): Section[] => {
  const sections: Section[] = [];
  for (let i = 0; i < length; i++) {
    const newSection = createSection(scope, listType);
    Arr.last(sections).each((lastSection) => joinSections(lastSection, newSection));
    sections.push(newSection);
  }
  return sections;
};

const normalizeSection = (section: Section, entry: Entry): void => {
  if (Node.name(section.list).toUpperCase() !== entry.listType) {
    section.list = Replication.mutate(section.list, entry.listType);
  }
  Attr.setAll(section.list, entry.listAttributes);
};

const createItem = (scope: Document, attr: Record<string, any>, content: Element[]): Element => {
  const item = Element.fromTag('li', scope);
  Attr.setAll(item, attr);
  InsertAll.append(item, content);
  return item;
};

const setItem = (section: Section, item: Element): void => {
  Insert.append(section.list, item);
  section.item = item;
};

const writeShallow = (scope: Document, outline: Section[], entry: Entry): Section[] => {
  const newOutline = outline.slice(0, entry.depth);

  Arr.last(newOutline).each((section) => {
    setItem(section, createItem(scope, entry.itemAttributes, entry.content));
    normalizeSection(section, entry);
  });

  return newOutline;
};

const populateSections = (sections: Section[], entry: Entry): void => {
  Arr.last(sections).each((section) => {
    Attr.setAll(section.list, entry.listAttributes);
    Attr.setAll(section.item, entry.itemAttributes);
    InsertAll.append(section.item, entry.content);
  });

  for (let i = 0; i < sections.length - 1; i++) {
    Css.set(sections[i].item, 'list-style-type', 'none');
  }
};

const writeDeep = (scope: Document, outline: Section[], entry: Entry): Section[] => {
  const newSections = createJoinedSections(scope, entry.depth - outline.length, entry.listType);
  populateSections(newSections, entry);

  Options.liftN([
    Arr.last(outline),
    Arr.head(newSections)
  ], joinSections);
  return outline.concat(newSections);
};

const composeList = (scope: Document, entries: Entry[]): Option<Element> => {
  const outline: Section[] = Arr.foldl(entries, (outline, entry) => {
    return entry.depth > outline.length ? writeDeep(scope, outline, entry) : writeShallow(scope, outline, entry);
  }, []);
  return Arr.head(outline).map((section) => section.list);
};

export { composeList };