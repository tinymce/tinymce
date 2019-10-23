import { HTMLInputElement, File, Window, document, Event } from '@ephox/dom-globals';
import { Cell, Option } from '@ephox/katamari';
import { Step, GeneralSteps, Chain } from '@ephox/agar';
import { createFileList } from './FileList';

interface Props {
  files: PropertyDescriptor;
  click: () => void;
}

const inputPrototypeState = Cell(Option.none<Props>());

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
    click: HTMLInputElement.prototype.click
  };

  inputPrototypeState.set(Option.some(currentProps));

  Object.defineProperty(HTMLInputElement.prototype, 'files', {
    get: () => createFileList(files)
  });

  HTMLInputElement.prototype.click = function () {
    this.dispatchEvent(createChangeEvent(this.ownerDocument.defaultView));
  };
});

const cUnpatchInputElement = Chain.op<any>(() => {
  inputPrototypeState.get().each((props) => {
    Object.defineProperty(HTMLInputElement.prototype, 'files', props.files);
    HTMLInputElement.prototype.click = props.click;
  });
});

const sRunOnPatchedFileInput = (files: File[], step: Step<any, any>): Step<any, any> => {
  return GeneralSteps.sequence([
    Chain.asStep({}, [ cPatchInputElement(files) ]),
    step,
    Chain.asStep({}, [ cUnpatchInputElement ]),
  ]);
};

const cRunOnPatchedFileInput = (files: File[], chain: Chain<any, any>): Chain<any, any> => {
  return Chain.fromChains([
    cPatchInputElement(files),
    chain,
    cUnpatchInputElement
  ]);
};

export {
  sRunOnPatchedFileInput,
  cRunOnPatchedFileInput
};
