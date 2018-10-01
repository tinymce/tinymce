import Settings from '../../api/Settings';
import { Option } from '@ephox/katamari';
import { ListItem } from '../DialogTypes';
import { ListOptions } from '../../core/ListOptions';

// Looks like tinymce currently renders menus, but doesn't
// let you choose from one.

const getClasses = (editor): Option<ListItem[]> => {
  if (Settings.hasLinkClassList(editor.settings)) {
    const list = Settings.getLinkClassList(editor.settings);
    return ListOptions.sanitize(list);
  }
  return Option.none();
};

export const ClassListOptions = {
  getClasses
};