/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Dialog } from '@ephox/bridge';
import { Arr, Obj } from '@ephox/katamari';

type Component = Dialog.DialogFooterButton | Dialog.BodyComponent;

export enum DiffType {
  Unchanged,
  Changed,
  Replaced,
  Added,
  Removed
}

interface GeneralDiffResult<T extends Component> {
  readonly type: Omit<DiffType, DiffType.Replaced>;
  readonly item: T;
  readonly items: DiffResult<Dialog.BodyComponent>[];
}

interface ReplacedDiffResult<T extends Component> {
  readonly type: DiffType.Replaced;
  readonly item: T;
  readonly oldItem: T;
  readonly items: DiffResult<Dialog.BodyComponent>[];
}

export type DiffResult<T extends Component> = GeneralDiffResult<T> | ReplacedDiffResult<T>;

const nestedComponentTypes = new Set([
  'panel',
  'bar',
  'grid',
  'label'
]);

const hasItems = (comp: Component): comp is Dialog.Panel | Dialog.Bar | Dialog.Grid | Dialog.Label =>
  nestedComponentTypes.has(comp.type) && Obj.has(comp as Record<string, any>, 'items');

const createResult = <T extends Component>(type: DiffType, item: T, items: DiffResult<Dialog.BodyComponent>[] = []): GeneralDiffResult<T> => ({
  type,
  item,
  items
});

const hasDifferentProps = (comp1: Component, comp2: Component) =>
  Obj.find(comp1, (_, key) => !Obj.has(comp2 as Record<string, any>, key)).isSome();

const hasDifferentValues = (comp1: Component, comp2: Component) =>
  Obj.find(comp1, (value, key) => comp2[key] !== value).isSome();

export const diffItems = <T extends Component>(newItems: T[], oldItems: T[]): DiffResult<T>[] => {
  const results = Arr.map(newItems, (newItem, index) =>
    Arr.get(oldItems, index).fold(
      () => createResult(DiffType.Added, newItem),
      (oldItem) => diffComponent(newItem, oldItem)
    )
  );

  if (oldItems.length > newItems.length) {
    Arr.each(oldItems.slice(newItems.length), (oldItem) => {
      results.push(createResult(DiffType.Removed, oldItem));
    });
  }

  return results;
};

export const diffComponent = <T extends Component>(newComp: T, oldComp: T): DiffResult<T> => {
  // If the types are different then we have a new component
  if (newComp.type !== oldComp.type) {
    return { type: DiffType.Replaced, item: newComp, oldItem: oldComp, items: [] };
  } else {
    // Check if any of the properties and their values are different
    const hasChanged = hasDifferentProps(newComp, oldComp) || hasDifferentProps(oldComp, newComp) || hasDifferentValues(newComp, oldComp);
    const type = hasChanged ? DiffType.Changed : DiffType.Unchanged;

    // If there were child items then diff them as well
    const childResults = hasItems(newComp) && hasItems(oldComp) ? diffItems(newComp.items, oldComp.items) : [];
    return createResult(type, newComp, childResults);
  }
};

export const isReplaced = <T extends Component>(result: DiffResult<T>): result is ReplacedDiffResult<T> =>
  result.type === DiffType.Replaced;
