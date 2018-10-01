import { Option } from '@ephox/katamari';

import Settings from '../../api/Settings';
import { ListOptions } from '../../core/ListOptions';
import { ListItem } from '../DialogTypes';

// In current tinymce, targets can be nested menus.
// Do we really want to support that?

const fallbacks = [
  { text: 'None', value: '' },
  { text: 'New window', value: '_blank' }
];

const getTargets = (editor): Option<ListItem[]> => {
  if (Settings.shouldShowTargetList(editor.settings)) {
    const list = Settings.getTargetList(editor.settings);
    return ListOptions.sanitize(list).orThunk(
      () => Option.some(fallbacks)
    );
  }
  return Option.none();
};

export const TargetOptions = {
  getTargets
};