import { GeneralSteps, Step } from '@ephox/agar';
import { document, Event, File, HTMLInputElement, Window } from '@ephox/dom-globals';
import { Cell, Option } from '@ephox/katamari';

const inputPrototypeState = Cell(Option.none());

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

const sPatchInputElement = (files: File[]) => Step.sync(() => {
  const currentProps = {
    files: Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'files'),
    click: HTMLInputElement.prototype.click
  };

  inputPrototypeState.set(Option.some(currentProps));

  Object.defineProperty(HTMLInputElement.prototype, 'files', {
    get: () => {
      // TODO: Should really be a FileList but needs to be exposed in Files on agar
      return files;
    }
  });

  HTMLInputElement.prototype.click = function () {
    this.dispatchEvent(createChangeEvent(this.ownerDocument.defaultView));
  };
});

const sUnpatchInputElement = Step.sync(() => {
  inputPrototypeState.get().each((props) => {
    Object.defineProperty(HTMLInputElement.prototype, 'files', props.files);
    HTMLInputElement.prototype.click = props.click;
  });
});

const sRunStepOnPatchedFileInput = (files: File[], step: Step<any, any>) => {
  return GeneralSteps.sequence([
    sPatchInputElement(files),
    step,
    sUnpatchInputElement
  ]);
};

export { sRunStepOnPatchedFileInput };
