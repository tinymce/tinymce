import { Fun, Id } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';
import * as SeleniumAction from '../server/SeleniumAction';
import { Chain } from './Chain';
import { Step } from './Step';

const BedrockIdAttribute = 'data-bedrockid';

const sActionOn = <T>(selector: string, type: string): Step<T, T> =>
  SeleniumAction.sPerform<T>('/mouse', {
    selector,
    type
  });

const sMoveToOn = <T>(selector: string): Step<T, T> =>
  sActionOn<T>(selector, 'move');

const sDownOn = <T>(selector: string): Step<T, T> =>
  sActionOn<T>(selector, 'down');

const sUpOn = <T>(selector: string): Step<T, T> =>
  sActionOn<T>(selector, 'up');

const sClickOn = <T>(selector: string): Step<T, T> =>
  sActionOn<T>(selector, 'click');

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
      Chain.mapper((elem: SugarElement<any>) => {
        const id = Id.generate('');
        Attribute.set(elem, BedrockIdAttribute, id);
        return `[${BedrockIdAttribute}="${id}"]`;
      }),
      cAction('click')
    ]),
    Chain.op((elem: SugarElement<any>) => {
      Attribute.remove(elem, BedrockIdAttribute);
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
