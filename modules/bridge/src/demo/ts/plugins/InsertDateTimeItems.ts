import { Arr } from '@ephox/katamari';

import { ToolbarSplitButtonItemTypes } from '../../../main/ts/ephox/bridge/components/toolbar/ToolbarSplitButton';
import { getDemoRegistry } from '../buttons/DemoRegistry';

export const registerInsertDateTimeItems = (): void => {
  // Example, they are all the same.
  getDemoRegistry().addSplitButton('insertdatetime', {
    type: 'splitbutton',
    fetch: (callback) => {
      const items = Arr.map([ '%H:%M:%S', '%Y-%m-%d', '%I:%M:%S %p', '%D' ], (fmt) => ({
        type: 'choiceitem',
        value: fmt,
        // Convert current time
        text: fmt
      } as ToolbarSplitButtonItemTypes));
      callback(items);
    },
    onItemAction: (_buttonApi, _itemValue) => {
      // insert date time using itemValue fmt
    },
    onAction: (_buttonApi) => {
      // fmt <- retrieve previously selected format (or default if none)
      // insert data time using fmt
    }
  });
};
