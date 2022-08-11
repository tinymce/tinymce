import { AlloyComponent, AlloyEvents, EventFormat } from '@ephox/alloy';
import { Cell, Type } from '@ephox/katamari';

export interface GetApiType<T> {
  readonly getApi: (comp: AlloyComponent) => T;
}

export type OnDestroy<T> = (controlApi: T) => void;

export interface OnControlAttachedType<T> extends GetApiType<T> {
  readonly onSetup: (controlApi: T) => OnDestroy<T> | void;
}

const runWithApi = <T>(info: GetApiType<T>, comp: AlloyComponent): (f: OnDestroy<T>) => void => {
  const api = info.getApi(comp);
  return (f: OnDestroy<T>) => {
    f(api);
  };
};

// These handlers are used for providing common onAttached and onDetached handlers.
// Essentially, the `editorOffCell` is used store the onDestroy function returned
// by onSetup. The reason onControlAttached doesn't create the cell itself, is because
// it also has to be passed into onControlDetached. We could make this function return
// the cell and the onAttachedHandler, but that would provide too much complexity.
const onControlAttached = <T>(info: OnControlAttachedType<T>, editorOffCell: Cell<OnDestroy<T>>): AlloyEvents.AlloyEventKeyAndHandler<EventFormat> =>
  AlloyEvents.runOnAttached((comp) => {
    const run = runWithApi(info, comp);
    run((api) => {
      const onDestroy = info.onSetup(api);
      if (Type.isFunction(onDestroy)) {
        editorOffCell.set(onDestroy);
      }
    });
  });

const onControlDetached = <T>(getApi: GetApiType<T>, editorOffCell: Cell<OnDestroy<T>>): AlloyEvents.AlloyEventKeyAndHandler<EventFormat> =>
  AlloyEvents.runOnDetached((comp) => runWithApi(getApi, comp)(editorOffCell.get()));

export { runWithApi, onControlAttached, onControlDetached };
