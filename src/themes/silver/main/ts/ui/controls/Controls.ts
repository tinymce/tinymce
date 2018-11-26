/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloyEvents } from '@ephox/alloy';
import { Cell } from '@ephox/katamari';

export interface GetApiType<T> {
  getApi: (comp: AlloyComponent) => T;
}

export type OnDestroy<T> = (controlApi: T) => void;

export interface OnControlAttachedType<T> extends GetApiType<T> {
  onSetup: (controlApi: T) => OnDestroy<T>; // TODO: check: no change here?
}

const runWithApi = <T>(info: GetApiType<T>, comp: AlloyComponent) => {
  const api = info.getApi(comp);
  return (f: OnDestroy<T>) => {
    f(api);
  };
};

const onControlAttached = <T>(info: OnControlAttachedType<T>, editorOffCell: Cell<OnDestroy<T>>) => {
  return AlloyEvents.runOnAttached((comp) => {
    const run = runWithApi(info, comp);
    run((api) => {
      const onDestroy = info.onSetup(api);
      if (onDestroy !== null && onDestroy !== undefined) {
        editorOffCell.set(onDestroy);
      }
    });
  });
};

const onControlDetached = <T>(getApi: GetApiType<T>, editorOffCell: Cell<OnDestroy<T>>) => {
  return AlloyEvents.runOnDetached((comp) => runWithApi(getApi, comp)(editorOffCell.get()));
};

export { runWithApi, onControlAttached, onControlDetached };