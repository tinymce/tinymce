import { getDemoRegistry } from './../buttons/DemoRegistry';

// FIX: TODO....
export const registerEmoticonItems = () => {
  getDemoRegistry().addButton('emoticon', {
    type: 'button',
    disabled: false,
    onSetup: (_buttonApi) => () => { },
    onAction: (_buttonApi) => {

    }
  });
};