import { Singleton } from '@ephox/katamari';

import { Chain } from '../api/Chain';
import * as GeneralSteps from '../api/GeneralSteps';
import { Step } from '../api/Step';
import { createFileList } from './FileList';

interface Props {
  files: PropertyDescriptor;
  click: () => void;
}

const inputPrototypeState = Singleton.value<Props>();

const createChangeEvent = (win: Window): Event => {
  const event: any = document.createEvent('CustomEvent');
  event.initCustomEvent('change', true, true, null);

  event.view = win;
  event.ctrlKey = false;
  event.altKey = false;
  event.shiftKey = false;
  event.metaKey = false;
  event.button = 0;
  event.relatedTarget = null;
  event.screenX = 0;
  event.screenY = 0;

  return event;
};

const cPatchInputElement = (files: File[]) => Chain.op<any>(() => {
  const currentProps = {
    files: Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'files'),
    // eslint-disable-next-line @typescript-eslint/unbound-method
    click: HTMLInputElement.prototype.click
  };

  inputPrototypeState.set(currentProps);

  Object.defineProperty(HTMLInputElement.prototype, 'files', {
    get: () => createFileList(files)
  });

  HTMLInputElement.prototype.click = function () {
    this.dispatchEvent(createChangeEvent(this.ownerDocument.defaultView));
  };
});

const cUnpatchInputElement = Chain.op<any>(() => {
  inputPrototypeState.on((props) => {
    Object.defineProperty(HTMLInputElement.prototype, 'files', props.files);
    HTMLInputElement.prototype.click = props.click;
  });
});

const sRunOnPatchedFileInput = (files: File[], step: Step<any, any>): Step<any, any> => GeneralSteps.sequence([
  Chain.asStep({}, [ cPatchInputElement(files) ]),
  step,
  Chain.asStep({}, [ cUnpatchInputElement ])
]);

const cRunOnPatchedFileInput = (files: File[], chain: Chain<any, any>): Chain<any, any> => Chain.fromChains([
  cPatchInputElement(files),
  chain,
  cUnpatchInputElement
]);

const pRunOnPatchedFileInput = (files: File[], action: () => Promise<void>): Promise<void > =>
  Chain.toPromise(cRunOnPatchedFileInput(files, Chain.fromPromise(action)))(undefined);

export {
  sRunOnPatchedFileInput,
  cRunOnPatchedFileInput,
  pRunOnPatchedFileInput
};
