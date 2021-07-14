/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyEvents, Behaviour, SimpleOrSketchSpec } from '@ephox/alloy';
import { Arr, Optional } from '@ephox/katamari';
import { Attribute, SelectorFind } from '@ephox/sugar';

export type IconProvider = () => Record<string, string>;

const defaultIcon = (icons: IconProvider): string => Optional.from(icons()['temporary-placeholder']).getOr('!not found!');

const get = (name: string, icons: IconProvider): string => Optional.from(icons()[name.toLowerCase()]).getOrThunk(() => defaultIcon(icons));

const getOr = (name: string, icons: IconProvider, fallback: Optional<string>): string => Optional.from(icons()[name.toLowerCase()]).or(fallback).getOrThunk(() => defaultIcon(icons));

const getFirst = (names: string[], icons: IconProvider): string => Arr.findMap(names, (name) => Optional.from(icons()[name.toLowerCase()])).getOrThunk(() => defaultIcon(icons));

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

export {
  getFirst,
  getOr,
  get,
  render,
  addFocusableBehaviour
};
