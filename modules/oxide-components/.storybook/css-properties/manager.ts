// The manager bundles JSX with the classic transform, so React must be in scope.
import * as React from 'react';
import { AddonPanel } from 'storybook/internal/components';
import { addons, types } from 'storybook/manager-api';

import { Panel } from './Panel';
import { ADDON_ID, PANEL_ID } from './Shared';

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'CSS Properties (internal)',
    match: ({ viewMode }) => viewMode === 'story',
    render: ({ active }) => React.createElement(AddonPanel, { active: Boolean(active), children: React.createElement(Panel) })
  });
});
