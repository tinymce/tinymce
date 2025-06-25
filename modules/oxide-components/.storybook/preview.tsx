import {
  Controls,
  Description,
  Primary,
  Subtitle,
  Title
} from '@storybook/addon-docs/blocks';
import type { Preview, ReactRenderer } from '@storybook/react-vite';
import styles from '@tinymce/oxide/skins/ui/default/skin.ts';
import type { PartialStoryFn } from 'storybook/internal/csf';

// @ts-expect-error the bundler handles this just fine but tsc is not happy with it
import '@tinymce/oxide/build/skins/ui/default/skin.css';

const preview: Preview = {
  decorators: [
    (Story: PartialStoryFn<ReactRenderer>): JSX.Element => <div className={styles.tox}><Story /></div>
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
    },
    docs: {
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Controls />
        </>
      ),
    },
  },
};

export default preview;
