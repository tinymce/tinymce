import { Optional } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';

import * as Options from '../../api/Options';
import { ListOptions } from '../../core/ListOptions';
import type { ListItem } from '../DialogTypes';

// Looks like tinymce currently renders menus, but doesn't
// let you choose from one.

const getClasses = (editor: Editor): Optional<ListItem[]> => {
  const list = Options.getLinkClassList(editor);
  if (list.length > 0) {
    return ListOptions.sanitize(list);
  }
  return Optional.none();
};

export const ClassListOptions = {
  getClasses
};
