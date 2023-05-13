import { Id, Optional } from '@ephox/katamari';

export const enum Mode {
  ReadWrite,
  Protected,
  ReadOnly
}

const modeId = Id.generate('mode');

const getMode = (transfer: DataTransfer): Optional<Mode> => {
  const dt: any = transfer;
  return Optional.from(dt[modeId]);
};

const setMode = (transfer: DataTransfer, mode: Mode): void => {
  const dt: any = transfer;
  dt[modeId] = mode;
};

const checkMode = (expectedMode: Mode) => (transfer: DataTransfer): boolean => {
  const dt: any = transfer;
  return Optional.from(dt[modeId]).exists((mode) => mode === expectedMode);
};

const isInReadWriteMode = checkMode(Mode.ReadWrite);
const isInProtectedMode = checkMode(Mode.Protected);
const isInReadOnlyMode = checkMode(Mode.ReadOnly);

export {
  getMode,
  setMode,
  isInReadWriteMode,
  isInProtectedMode,
  isInReadOnlyMode
};
