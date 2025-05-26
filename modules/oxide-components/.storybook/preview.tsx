import type { Preview } from '@storybook/react';
import '@tinymce/oxide/build/skins/ui/default/skin.css';

const preview: Preview = {
  decorators: [
    (Story) => <div className='tox'><Story /></div>
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
