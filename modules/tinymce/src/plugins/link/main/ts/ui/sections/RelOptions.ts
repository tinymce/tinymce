import { Optional, Optionals } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../../api/Options';
import { ListOptions } from '../../core/ListOptions';
import * as Utils from '../../core/Utils';
import { ListItem, UserListItem } from '../DialogTypes';

const getRels = (editor: Editor, initialTarget: Optional<string>): Optional<ListItem[]> => {
  const list = Options.getRelList(editor);
  if (list.length > 0) {
    const isTargetBlank = Optionals.is(initialTarget, '_blank');
    const enforceSafe = Options.allowUnsafeLinkTarget(editor) === false;
    const safeRelExtractor = (item: UserListItem) => Utils.applyRelTargetRules(ListOptions.getValue(item), isTargetBlank);
    const sanitizer = enforceSafe ? ListOptions.sanitizeWith(safeRelExtractor) : ListOptions.sanitize;
    return sanitizer(list);
  }
  return Optional.none();
};

export const RelOptions = {
  getRels
};
