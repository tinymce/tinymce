import { Arr } from '@ephox/katamari';

import { Setup } from './Types';

const setup = (): Setup => {
  const urlMap: Record<string, string> = {
    // TODO: Add user chosen emojis
    checkbox: '&#x2611;', // ☑
    cross: '&#x2716;', // ✖
    question: '&#x2753;', // ❓
  };

  const toCollectionItem = () => {
    return Arr.map(Object.entries(urlMap), ([ key, value ]) => {
      return {
        type: 'collectionitem',
        text: key,
        icon: `<span>${value}</span>`,
        value
      };
    });
  };

  return {
    toCollectionItem,
  };
};

export {
  setup
};
