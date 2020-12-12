import { Logger, Step } from '@ephox/agar';
import * as MockDataTransfer from './MockDataTransfer';

const sPaste = (editor, data) => {
  return Logger.t(`Paste ${data}`, Step.sync(() => {
    const dataTransfer = MockDataTransfer.create(data);
    editor.fire('paste', { clipboardData: dataTransfer });
  }));
};

export {
  sPaste
};
