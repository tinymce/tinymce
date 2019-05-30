import { Step, Logger } from '@ephox/agar';
import MockDataTransfer from './MockDataTransfer';

const sPaste = function (editor, data) {
  return Logger.t(`Paste ${data}`, Step.sync(function () {
    const dataTransfer = MockDataTransfer.create(data);
    editor.fire('paste', { clipboardData: dataTransfer });
  }));
};

export default {
  sPaste
};