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

const pActionOn = (selector: string, type: string): Promise<{}> =>
  SeleniumAction.pPerform('/mouse', {
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

const cAction = (action: string) =>
  Chain.fromChains([
    Chain.mapper((selector) => ({
      selector,
      type: action
    })),
    SeleniumAction.cPerform('/mouse')
  ]);

const cClick = (): Chain<SugarElement<Element>, SugarElement<Element>> =>
  Chain.fromParent(Chain.mapper(Fun.identity), [
    Chain.fromChains([
      Chain.mapper((elem: SugarElement<Element>) => {
        const id = Id.generate('');
        Attribute.set(elem, BedrockIdAttribute, id);
        return `[${BedrockIdAttribute}="${id}"]`;
      }),
      cAction('click')
    ]),
    Chain.op((elem: SugarElement<Element>) => {
      Attribute.remove(elem, BedrockIdAttribute);
    })
  ]);

const pClickOn = (selector: string): Promise<{}> =>
  pActionOn(selector, 'click');

const pClick = async (elem: SugarElement<Element>): Promise<{}> => {
  const id = Id.generate('');
  Attribute.set(elem, BedrockIdAttribute, id);
  const selector = `[${BedrockIdAttribute}="${id}"]`;
  try {
    return await pClickOn(selector);
  } finally {
    Attribute.remove(elem, BedrockIdAttribute);
  }
};

const pUpOn = (selector: string): Promise<{}> =>
  pActionOn(selector, 'up');

const pDownOn = (selector: string): Promise<{}> =>
  pActionOn(selector, 'down');

const pMoveToOn = (selector: string): Promise<{}> =>
  pActionOn(selector, 'click');

export {
  sMoveToOn,
  sDownOn,
  sUpOn,
  sClickOn,
  cClick,
  BedrockIdAttribute,

  pClickOn,
  pClick,
  pUpOn,
  pDownOn,
  pMoveToOn
};
