import { SugarElement } from '../node/SugarElement';

const get = (element: SugarElement<Node>): string | null =>
  element.dom.textContent;

const set = (element: SugarElement<Node>, value: string): void => {
  element.dom.textContent = value;
};

export {
  get,
  set
};
