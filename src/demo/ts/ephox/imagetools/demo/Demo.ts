import { document, HTMLButtonElement, HTMLElement, HTMLFormElement, HTMLImageElement, HTMLSelectElement, NodeListOf } from '@ephox/dom-globals';
import * as ResultConversions from 'ephox/imagetools/api/ResultConversions';
import * as ImageTransformations from 'ephox/imagetools/api/ImageTransformations';
import { ImageResult } from 'ephox/imagetools/util/ImageResult';

function isSelect(el: HTMLElement): el is HTMLSelectElement {
  return el.tagName === 'SELECT';
}

function getValue(el: HTMLSelectElement | HTMLButtonElement): string {
  let value;
  if (isSelect(el)) {
    value = el.options[el.selectedIndex].value;
  } else {
    value = el.value;
  }
  return value.trim();
}

function modify(image: HTMLImageElement, op: string, args: any[]) {
  ResultConversions.imageToImageResult(image).then(function (ir) {
    args.unshift(ir);
    return (ImageTransformations as any)[op].apply(null, args)
      .then(function (imageResult: ImageResult) {
        image.src = imageResult.toDataURL();
      });
  });
}

const forms = document.querySelectorAll('.options') as NodeListOf<HTMLFormElement>;
// tslint:disable-next-line:prefer-for-of
for (let i = 0; i < forms.length; i++) {
  (function (form: HTMLFormElement) {
    form.onsubmit = function (_) {
      const selector = document.getElementById('selector') as HTMLSelectElement;
      const currOp = getValue(selector);
      const image = document.getElementById('editor') as HTMLImageElement;
      modify(image, currOp, [].slice.call((<HTMLFormElement> this).elements)
        .filter(function (el: HTMLElement) {
          return el.tagName !== 'BUTTON';
        })
        .map(function (el: HTMLButtonElement) {
          return getValue(el);
        })
      );
      return false;
    };
  }(forms[i]));
}
