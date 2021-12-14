/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloySpec, Replacing } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Eq } from '@ephox/dispute';
import { Arr, Obj, Optional, Optionals, Type } from '@ephox/katamari';

type Component = Dialog.DialogFooterButton | Dialog.BodyComponent | Dialog.Tab;
type Body = Dialog.Dialog<unknown>['body'];

export enum DiffType {
  Unchanged,
  Changed,
  ChildrenChanged,
  Added,
  Removed
}

type GenericDiffType = DiffType.Unchanged | DiffType.Changed | DiffType.ChildrenChanged ;

interface BaseDiffResult<T, I> {
  readonly type: DiffType;
  readonly item: T;
  readonly items: DiffResult<I>[];
  parent?: GenericDiffResult<ContainerComponent | Dialog.TabPanel>;
}

export interface GenericDiffResult<T, I = Dialog.BodyComponent> extends BaseDiffResult<T, I> {
  readonly type: GenericDiffType;
  readonly oldItem: T;
}

export interface AddedRemovedDiffResult<T, I = Dialog.BodyComponent> extends BaseDiffResult<T, I> {
  readonly type: DiffType.Added | DiffType.Removed;
}

export type DiffResult<T, I = Dialog.BodyComponent> = GenericDiffResult<T, I> | AddedRemovedDiffResult<T, I>;

export type ContainerComponent = Dialog.Panel | Dialog.Bar | Dialog.Grid | Dialog.Label | Dialog.Tab;
const containerComponentTypes = new Set([
  'panel',
  'tabpanel',
  'bar',
  'grid',
  'label',
  'tab'
]);

const isContainer = (comp: Component | Dialog.TabPanel): comp is ContainerComponent | Dialog.TabPanel =>
  containerComponentTypes.has(comp.type);

const hasChildren = (comp: Component): comp is ContainerComponent =>
  isContainer(comp) && Obj.has(comp as Record<string, any>, 'items');

const genericResult = <T, U>(type: GenericDiffType, item: T, oldItem: T, items: DiffResult<U>[] = []): GenericDiffResult<T, U> => {
  const result = {
    type,
    item,
    oldItem,
    items
  };

  Arr.each(result.items, (item) => {
    // If we have items then the result item is guaranteed to be a container
    item.parent = result as any;
  });

  return result;
};

const addedRemovedResult = <T>(type: DiffType.Added | DiffType.Removed, item: T): AddedRemovedDiffResult<T> => ({
  type,
  item,
  items: []
});

const eq = (a: any, b: any): boolean => {
  // Need a special case for optionals here
  if (Type.is(a, Optional) && Type.is(b, Optional)) {
    return Optionals.equals(a, b);
  } else {
    return Eq.eqAny.eq(a, b);
  }
};

const ignoredKeys = new Set([
  'uid',
  'items',
  'tabs'
]);

const hasDifferentProps = (comp1: Record<string, any>, comp2: Record<string, any>) =>
  Obj.find(comp1, (_, key) => !ignoredKeys.has(key) && !Obj.has(comp2, key)).isSome();

const hasDifferentValues = (comp1: Record<string, any>, comp2: Record<string, any>) =>
  Obj.find(comp1, (value, key) => !ignoredKeys.has(key) && !eq(comp2[key], value)).isSome();

// Check if any of the properties and their values are different
const hasChanges = (newComp: Record<string, any>, oldComp: Record<string, any>) =>
  hasDifferentProps(newComp, oldComp) || hasDifferentProps(oldComp, newComp) || hasDifferentValues(newComp, oldComp);

const hasChildChanges = <T>(results: DiffResult<T>[]): boolean =>
  Arr.exists(results, (result) => result.type !== DiffType.Unchanged);

const generateDiff = <T, U>(item: T, oldItem: T, childDiffs: DiffResult<U>[]): GenericDiffResult<T, U> => {
  const childType = hasChildChanges(childDiffs) ? DiffType.ChildrenChanged : DiffType.Unchanged;
  const type = hasChanges(item, oldItem) ? DiffType.Changed : childType;
  return genericResult(type, item, oldItem, childDiffs);
};

export const diffItems = <T extends Component>(newItems: T[], oldItems: T[]): DiffResult<T>[] => {
  const results = Arr.map(newItems, (newItem, index) =>
    Arr.get(oldItems, index).fold(
      () => addedRemovedResult(DiffType.Added, newItem),
      (oldItem) => diffComponent(newItem, oldItem)
    )
  );

  if (oldItems.length > newItems.length) {
    Arr.each(oldItems.slice(newItems.length), (oldItem) => {
      results.push(addedRemovedResult(DiffType.Removed, oldItem));
    });
  }

  return results;
};

export const diffComponent = <T extends Component>(newComp: T, oldComp: T): DiffResult<T> => {
  // If the types are different then we have a new component so don't look at the children
  if (newComp.type !== oldComp.type) {
    return genericResult(DiffType.Changed, newComp, oldComp);
  } else if (hasChildren(newComp) && hasChildren(oldComp)) {
    const childResults = diffItems(newComp.items, oldComp.items);
    return generateDiff(newComp, oldComp, childResults);
  } else {
    return generateDiff(newComp, oldComp, []);
  }
};

export const diffBody = (newBody: Body, oldBody: Body): DiffResult<Body, Dialog.BodyComponent | Dialog.Tab> => {
  if (newBody.type === 'panel' && oldBody.type === 'panel') {
    return diffComponent(newBody, oldBody);
  } else if (newBody.type === 'tabpanel' && oldBody.type === 'tabpanel') {
    const childResults = diffItems(newBody.tabs, oldBody.tabs);
    return generateDiff(newBody, oldBody, childResults);
  } else {
    return genericResult(DiffType.Changed, newBody, oldBody);
  }
};

export const applyDiff = <T extends Component>(comp: AlloyComponent, diff: DiffResult<T>, index: number, render: (spec: T) => AlloySpec): T[] => {
  if (diff.type === DiffType.Unchanged) {
    // TODO: TINY-8334 Remove this mutation, it's only temporarily needed
    diff.item.uid = diff.oldItem.uid;
    return [ diff.oldItem ];
  } else if (diff.type === DiffType.Removed) {
    Replacing.replaceAt(comp, index, Optional.none());
    return [];
  } else {
    // Generate the new/updated item and then add or replace it
    const newItem = render(diff.item);
    if (diff.type === DiffType.Changed) {
      Replacing.replaceAt(comp, index, Optional.some(newItem));
    } else {
      Replacing.append(comp, newItem);
    }
    return [ diff.item ];
  }
};
