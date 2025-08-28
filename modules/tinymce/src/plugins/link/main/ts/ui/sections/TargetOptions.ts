import { Optional, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../../api/Options';
import { ListOptions } from '../../core/ListOptions';
import { ListItem } from '../DialogTypes';

// In current tinymce, targets can be nested menus.
// Do we really want to support that?

const fallbacks = [
  { text: 'Current window', value: '' },
  { text: 'New window', value: '_blank' }
];

const getTargets = (editor: Editor): Optional<ListItem[]> => {
  const list = Options.getTargetList(editor);
  if (Type.isArray(list)) {
    return ListOptions.sanitize(list).orThunk(
      () => Optional.some(fallbacks)
    );
  } else if (list === false) {
    return Optional.none();
  }
  return Optional.some(fallbacks);
};

export const TargetOptions = {
  getTargets
};
