import { Id, Optional } from '@ephox/katamari';

export const enum Mode {
  ReadWrite,
  Protected,
  ReadOnly
}

const modeId: string = Id.generate('mode');

const getSetModeFn = (mode: Mode) => (transfer: DataTransfer): void => {
  const dt: any = transfer;
  dt[modeId] = mode;
};

const setMode = (transfer: DataTransfer, mode: Mode): void =>
  getSetModeFn(mode)(transfer);

const checkMode = (expectedMode: Mode) => (transfer: DataTransfer): boolean => {
  const dt: any = transfer;
  return Optional.from(dt[modeId]).exists((mode) => mode === expectedMode);
};

const getMode = (transfer: DataTransfer): Optional<Mode> => {
  const dt: any = transfer;
  return Optional.from(dt[modeId]);
};
const setReadWriteMode = getSetModeFn(Mode.ReadWrite);
const setProtectedMode = getSetModeFn(Mode.Protected);
const setReadOnlyMode = getSetModeFn(Mode.ReadOnly);

const isInReadWriteMode = checkMode(Mode.ReadWrite);
const isInProtectedMode = checkMode(Mode.Protected);
const isInReadOnlyMode = checkMode(Mode.ReadOnly);

export {
  setMode,
  getMode,
  setReadWriteMode,
  setProtectedMode,
  setReadOnlyMode,
  isInReadWriteMode,
  isInProtectedMode,
  isInReadOnlyMode
};
