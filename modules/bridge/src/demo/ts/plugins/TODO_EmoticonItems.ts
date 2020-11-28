import { getDemoRegistry } from '../buttons/DemoRegistry';

// FIX: TODO....
export const registerEmoticonItems = (): void => {
  getDemoRegistry().addButton('emoticon', {
    type: 'button',
    disabled: false,
    onSetup: (_buttonApi) => () => { },
    onAction: (_buttonApi) => {

    }
  });
};
