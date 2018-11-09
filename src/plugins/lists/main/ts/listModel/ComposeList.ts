/**
 * ComposeList.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Entry } from './Entry';
import { Element, Insert, InsertAll, Attr, Css, Node, Replication } from '@ephox/sugar';
import { Arr, Option, Options } from '@ephox/katamari';
import { ListType } from './ListType';

interface Section {
  list: Element;
  item: Element;
}

const createSection = (listType: ListType): Section => {
  const section: Section = {
    list: Element.fromTag(listType),
    item: Element.fromTag('li')
  };
  Insert.append(section.list, section.item);
  return section;
};

const joinSections = (parent: Section, appendor: Section): void => {
  Insert.append(parent.item, appendor.list);
};

const createJoinedSections = (length: number, listType: ListType): Section[] => {
  const sections: Section[] = [];
  for (let i = 0; i < length; i++) {
    const newSection = createSection(listType);
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

const createItem = (attr: Record<string, any>, content: Element[]): Element => {
  const item = Element.fromTag('li');
  Attr.setAll(item, attr);
  InsertAll.append(item, content);
  return item;
};

const setItem = (section: Section, item: Element): void => {
  Insert.append(section.list, item);
  section.item = item;
};

const writeShallow = (outline: Section[], entry: Entry): Section[] => {
  const newOutline = outline.slice(0, entry.depth);

  Arr.last(newOutline).each((section) => {
    setItem(section, createItem(entry.itemAttributes, entry.content));
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

const writeDeep = (outline: Section[], entry: Entry): Section[] => {
  const newSections = createJoinedSections(entry.depth - outline.length, entry.listType);
  populateSections(newSections, entry);

  Options.liftN([
    Arr.last(outline),
    Arr.head(newSections)
  ], joinSections);
  return outline.concat(newSections);
};

const composeList = (entries: Entry[]): Option<Element> => {
  const outline: Section[] = Arr.foldl(entries, (outline, entry) => {
    return entry.depth > outline.length ? writeDeep(outline, entry) : writeShallow(outline, entry);
  }, []);
  return Arr.head(outline).map((section) => section.list);
};

export {
  composeList
};