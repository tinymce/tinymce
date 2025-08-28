import { SugarElement } from 'ephox/sugar/api/node/SugarElement';

export default <K extends keyof HTMLElementTagNameMap>(type: K): SugarElement<HTMLElementTagNameMap[K]> => {
  const dom = document.createElement(type);
  return SugarElement.fromDom(dom);
};
