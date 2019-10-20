import { Id, Option } from '@ephox/katamari';
import { DataTransfer } from '@ephox/dom-globals';

const enum Mode {
  ReadWrite,
  Protected,
  ReadOnly
}

const modeId: string = Id.generate('mode');

const setMode = (mode: Mode) => (transfer: DataTransfer): void => {
  const dt: any = transfer;
  dt[modeId] = mode;
};

const checkMode = (expectedMode: Mode) => (transfer: DataTransfer): boolean => {
  const dt: any = transfer;
  return Option.from(dt[modeId]).exists((mode) => mode === expectedMode);
};

const setReadWriteMode = setMode(Mode.ReadWrite);
const setProtectedMode = setMode(Mode.Protected);
const setReadOnlyMode = setMode(Mode.ReadOnly);

const isInReadWriteMode = checkMode(Mode.ReadWrite);
const isInProtectedMode = checkMode(Mode.Protected);
const isInReadOnlyMode = checkMode(Mode.ReadOnly);

export {
  setReadWriteMode,
  setProtectedMode,
  setReadOnlyMode,
  isInReadWriteMode,
  isInProtectedMode,
  isInReadOnlyMode
};
