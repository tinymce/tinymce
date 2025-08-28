import { Id, Optional } from '@ephox/katamari';

export const enum Mode {
  ReadWrite,
  Protected,
  ReadOnly
}

const modeId = Id.generate('mode');

const getMode = (transfer: DataTransfer): Optional<Mode> => {
  const dt: Record<string, any> = transfer;
  return Optional.from(dt[modeId]);
};

const mkSetModeFn = (mode: Mode) => (transfer: DataTransfer): void => {
  const dt: Record<string, any> = transfer;
  dt[modeId] = mode;
};

const setMode = (transfer: DataTransfer, mode: Mode): void => mkSetModeFn(mode)(transfer);

const setReadWriteMode = mkSetModeFn(Mode.ReadWrite);
const setReadOnlyMode = mkSetModeFn(Mode.ReadOnly);
const setProtectedMode = mkSetModeFn(Mode.Protected);

const checkMode = (expectedMode: Mode) => (transfer: DataTransfer): boolean => {
  const dt: Record<string, any> = transfer;
  return Optional.from(dt[modeId]).exists((mode) => mode === expectedMode);
};

const isInReadWriteMode = checkMode(Mode.ReadWrite);
const isInProtectedMode = checkMode(Mode.Protected);
const isInReadOnlyMode = checkMode(Mode.ReadOnly);

export {
  getMode,
  setMode,
  setReadWriteMode,
  setReadOnlyMode,
  setProtectedMode,
  isInReadWriteMode,
  isInProtectedMode,
  isInReadOnlyMode
};
