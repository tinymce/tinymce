import { Step, Logger } from '@ephox/agar';
import * as MockDataTransfer from './MockDataTransfer';

const sPaste = function (editor, data) {
  return Logger.t(`Paste ${data}`, Step.sync(function () {
    const dataTransfer = MockDataTransfer.create(data);
    editor.fire('paste', { clipboardData: dataTransfer });
  }));
};

export {
  sPaste
};
