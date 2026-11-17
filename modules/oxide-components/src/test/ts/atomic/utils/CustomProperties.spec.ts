import * as CustomProperties from 'oxide-components/utils/CustomProperties';
import { describe, expect, it } from 'vitest';

describe('atomic.utils.CustomProperties', () => {
  it('ref', () => {
    expect(CustomProperties.ref('--tox-private-floating-sidebar-width')).toBe('var(--tox-private-floating-sidebar-width)');
    expect(CustomProperties.ref('--tox-private-spinner-color', 'currentColor')).toBe('var(--tox-private-spinner-color, currentColor)');
    expect(CustomProperties.ref('--tox-private-requested-sidebar-width')).toBe('var(--tox-private-requested-sidebar-width)');
  });

  it('style', () => {
    expect(CustomProperties.style({ '--tox-private-spinner-color': 'red', '--tox-private-spinner-size': '24px' })).toEqual({
      '--tox-private-spinner-color': 'red',
      '--tox-private-spinner-size': '24px'
    });
    expect(CustomProperties.style({ '--tox-private-spinner-color': undefined })).toEqual({});
    const values = { '--tox-private-spinner-color': 'red', '--tox-private-floating-sidebar-width': undefined };
    expect(CustomProperties.style(values)).toEqual({ '--tox-private-spinner-color': 'red' });
  });

  it('groupStyle', () => {
    expect(CustomProperties.groupStyle('tinymceai/spinner', { '--tox-private-spinner-size': '24px' })).toEqual({ '--tox-private-spinner-size': '24px' });
    const values = { '--tox-private-spinner-size': '24px', '--tox-private-spinner-color': undefined };
    expect(CustomProperties.groupStyle('tinymceai/spinner', values)).toEqual({ '--tox-private-spinner-size': '24px' });
  });
});
