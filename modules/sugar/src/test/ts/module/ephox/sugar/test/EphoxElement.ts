import { SugarElement } from 'ephox/sugar/api/node/SugarElement';

export default (type: string) => {
  const dom = document.createElement(type);
  return SugarElement.fromDom(dom);
};
