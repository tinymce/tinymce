import { Fun } from '@ephox/katamari';

import { getDemoRegistry } from '../buttons/DemoRegistry';

/*
export interface ToolbarButtonApi {
  type?: 'button';
  disabled?: boolean;
  tooltip?: string;
  icon?: string;
  text?: string;
  onSetup?: (api: ToolbarButtonInstanceApi) => void;
  onAction: (api: ToolbarButtonInstanceApi) => void;
}

export interface ToolbarSplitButtonApi {
  type?: 'splitbutton';
  tooltip?: string;
  icon?: string;
  text?: string;
  select?: SelectPredicate;
  fetch: (success: SuccessCallback) => void;
  onSetup?: (api: ToolbarSplitButtonInstanceApi) => void;
  onAction: (api: ToolbarSplitButtonInstanceApi) => void;
  onItemAction: (api: ToolbarSplitButtonInstanceApi, value: string) => void;
}

*/

const editor = {
  on: (_s: string, _f: Function) => { }
};

export const registerAdvListItems = (): void => {
  getDemoRegistry().addSplitButton('bullist', {
    type: 'splitbutton',
    tooltip: 'Unordered Lists',
    icon: '',
    text: 'Bullet List',
    // FIX: disabled does not seem to be supported.
    // disabled: false,
    onSetup: (buttonApi: any) => {
      editor.on('NodeChange', (e: any) => {
        // Set the active state based on something
        const state = e;
        // FIX: This is missing.
        buttonApi.setActive(state);
      });
      return Fun.noop;
    },
    onAction: (_buttonApi) => {
      // apply basic list command
    },

    fetch: (_callback) => { },
    onItemAction: (_buttonApi) => {
      // apply list format that was chosen (specialised list command)
    }
  });
};
