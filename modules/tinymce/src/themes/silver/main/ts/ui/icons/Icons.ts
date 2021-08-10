/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyEvents, Behaviour, SimpleOrSketchSpec } from '@ephox/alloy';
import { Arr, Obj, Optional, Strings } from '@ephox/katamari';
import { Attribute, SelectorFind } from '@ephox/sugar';

import I18n from 'tinymce/core/api/util/I18n';

export type IconProvider = () => Record<string, string>;

// Icons that need to be transformed in RTL
const rtlTransform: Record<string, boolean> = {
  'indent': true,
  'outdent': true,
  'table-insert-column-after': true,
  'table-insert-column-before': true,
  'unordered-list': true,
  'list-bull-circle': true,
  'list-bull-default': true,
  'list-bull-square': true
};

const defaultIcon = (icons: IconProvider): string =>
  Obj.get(icons(), 'temporary-placeholder').getOr('!not found!');

const lookupIcon = (name: string, icons: IconProvider): Optional<string> => {
  const iconList = icons();
  const lcName = name.toLowerCase();
  const lookup = () => Obj.get(iconList, lcName);
  // If in rtl mode then try to see if we have a rtl icon to use instead
  if (I18n.isRtl()) {
    const rtlName = Strings.ensureTrailing(lcName, '-rtl');
    return Obj.get(iconList, rtlName).orThunk(lookup);
  } else {
    return lookup();
  }
};

const get = (name: string, icons: IconProvider): string =>
  lookupIcon(name, icons).getOrThunk(() => defaultIcon(icons));

const getOr = (name: string, icons: IconProvider, fallback: Optional<string>): string =>
  lookupIcon(name, icons).or(fallback).getOrThunk(() => defaultIcon(icons));

const getFirst = (names: string[], icons: IconProvider): string =>
  Arr.findMap(names, (name) => lookupIcon(name, icons)).getOrThunk(() => defaultIcon(icons));

const addFocusableBehaviour = () =>
  AddEventsBehaviour.config('add-focusable', [
    AlloyEvents.runOnAttached((comp) => {
      // set focusable=false on SVGs to prevent IE 11 from focusing the toolbar when tabbing into the editor
      SelectorFind.child(comp.element, 'svg').each((svg) => Attribute.set(svg, 'focusable', 'false'));
    })
  ]);

const render = (tagName: string, iconHtml: string, classes: string[], behaviours: Array<Behaviour.NamedConfiguredBehaviour<any, any, any>> = []): SimpleOrSketchSpec => {
  return {
    dom: {
      tag: tagName,
      innerHtml: iconHtml,
      classes
    },
    behaviours: Behaviour.derive([
      ...behaviours,
      addFocusableBehaviour()
    ])
  };
};

const needsRtlTransform = (iconName: string) =>
  I18n.isRtl() ? Obj.has(rtlTransform, iconName) : false;

export {
  getFirst,
  getOr,
  get,
  render,
  addFocusableBehaviour,
  needsRtlTransform
};
