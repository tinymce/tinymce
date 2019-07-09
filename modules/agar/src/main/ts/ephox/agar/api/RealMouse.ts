import * as SeleniumAction from '../server/SeleniumAction';
import { Chain } from './Chain';
import { Step } from './Step';
import { Id, Fun } from '@ephox/katamari';
import { Attr, Element } from '@ephox/sugar';

const BedrockIdAttribute = 'data-bedrockid';

const sActionOn = function <T>(selector: string, type: string): Step<T, T> {
  return SeleniumAction.sPerform<T>('/mouse', {
    selector,
    type
  });
};

const sMoveToOn = function <T>(selector: string): Step<T, T> {
  return sActionOn<T>(selector, 'move');
};

const sDownOn = function <T>(selector: string): Step<T, T> {
  return sActionOn<T>(selector, 'down');
};

const sUpOn = function <T>(selector: string): Step<T, T> {
  return sActionOn<T>(selector, 'up');
};

const sClickOn = function <T>(selector: string): Step<T, T> {
  return sActionOn<T>(selector, 'click');
};

const cAction = (action) =>
  Chain.fromChains([
    Chain.mapper((selector) => ({
      selector,
      type: action
    })),
    SeleniumAction.cPerform('/mouse')
  ]);

const cClick = () =>
  Chain.fromParent(Chain.mapper(Fun.identity), [
    Chain.fromChains([
      Chain.mapper((elem: Element) => {
        const id = Id.generate('');
        Attr.set(elem, BedrockIdAttribute, id);
        return `[${BedrockIdAttribute}="${id}"]`;
      }),
      cAction('click')
    ]),
    Chain.op((elem: Element) => {
      Attr.remove(elem, BedrockIdAttribute);
    })
  ]);

export {
  sMoveToOn,
  sDownOn,
  sUpOn,
  sClickOn,
  cClick,
  BedrockIdAttribute
};
