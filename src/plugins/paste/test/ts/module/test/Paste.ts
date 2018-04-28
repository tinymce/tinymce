import { Step } from '@ephox/agar';
import MockDataTransfer from './MockDataTransfer';

const sPaste = function (editor, data) {
  return Step.sync(function () {
    const dataTransfer = MockDataTransfer.create(data);
    editor.fire('paste', { clipboardData: dataTransfer });
  });
};

export default {
  sPaste
};