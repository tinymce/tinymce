import { Id, Optional } from '@ephox/katamari';

export const enum DtMode {
  ReadWrite,
  Protected,
  ReadOnly
}

const modeId = Id.generate('mode');

const getMode = (transfer: DataTransfer): Optional<DtMode> => {
  const dt: any = transfer;
  return Optional.from(dt[modeId]);
};

const setMode = (transfer: DataTransfer, mode: DtMode): void => {
  const dt: any = transfer;
  dt[modeId] = mode;
};

const checkMode = (expectedMode: DtMode) => (transfer: DataTransfer): boolean => {
  const dt: any = transfer;
  return Optional.from(dt[modeId]).exists((mode) => mode === expectedMode);
};

const isInReadWriteMode = checkMode(DtMode.ReadWrite);
const isInProtectedMode = checkMode(DtMode.Protected);
const isInReadOnlyMode = checkMode(DtMode.ReadOnly);

export {
  getMode,
  setMode,
  isInReadWriteMode,
  isInProtectedMode,
  isInReadOnlyMode
};
