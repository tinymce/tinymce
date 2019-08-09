import Element from 'ephox/sugar/api/node/Element';
import { HTMLElement } from '@ephox/dom-globals';

export default function () {
  return Element.fromHtml<HTMLElement>('<math xmlns="http://www.w3.org/1998/Math/MathML"></math>');
}