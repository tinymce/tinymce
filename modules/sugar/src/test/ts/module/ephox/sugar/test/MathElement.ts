import { HTMLElement } from '@ephox/dom-globals';
import Element from 'ephox/sugar/api/node/Element';

export default () => Element.fromHtml<HTMLElement>('<math xmlns="http://www.w3.org/1998/Math/MathML"></math>');
