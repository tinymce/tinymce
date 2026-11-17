import type { Decorator, Preview } from '@storybook/react-vite';

import { applyStoryContext } from './Runtime';
import { GLOBALS } from './Shared';

const withCssProperties: Decorator = (Story, context) => {
  applyStoryContext(context);
  return Story();
};

const preview: Preview = {
  decorators: [ withCssProperties ],
  globalTypes: {
    [GLOBALS.skin]: {
      description: 'Oxide skin',
      toolbar: {
        title: 'Skin',
        icon: 'paintbrush',
        items: [
          { value: 'default', title: 'Skin: default' },
          { value: 'dark', title: 'Skin: dark' }
        ],
        dynamicTitle: true
      }
    },
    [GLOBALS.customProperties]: {
      description: 'Use the skin compiled with @custom-properties-enabled, or the plain LESS build',
      toolbar: {
        title: 'Custom properties',
        icon: 'lightning',
        items: [
          { value: 'on', title: 'Custom properties: on' },
          { value: 'off', title: 'Custom properties: off (LESS build)' }
        ],
        dynamicTitle: true
      }
    }
  },
  initialGlobals: {
    [GLOBALS.skin]: 'default',
    [GLOBALS.customProperties]: 'on'
  }
};

export default preview;
