import { Arr } from '@ephox/katamari';
import { SugarElement, SugarNode } from '@ephox/sugar';
import { Structs } from 'ephox/snooker/api/Main';

// Creates an elementNew (or returns from elements array if it already exists)
const getElementNew = (elements: Structs.ElementNew[], tagName: keyof HTMLElementTagNameMap, text: string, isNew: boolean): Structs.ElementNew => {
  const createAndAppendElement = () => {
    const elm = SugarElement.fromTag(tagName);
    elm.dom.innerText = text;
    const elementNew = Structs.elementnew(elm, isNew);
    elements.push(elementNew);
    return elementNew;
  };

  return Arr.find(elements,
    (elementNew) => elementNew.element.dom.innerText === text && SugarNode.name(elementNew.element) === tagName
  ).fold(
    () => createAndAppendElement(),
    (elementNew) => elementNew
  );
};

export {
  getElementNew
};
