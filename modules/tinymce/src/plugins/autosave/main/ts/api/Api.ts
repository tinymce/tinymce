import Editor from 'tinymce/core/api/Editor';

import * as Storage from '../core/Storage';

export interface Api {
  readonly hasDraft: () => boolean;
  readonly storeDraft: () => void;
  readonly restoreDraft: () => void;
  readonly removeDraft: (fire?: boolean) => void;
  readonly isEmpty: () => boolean;
}

const get = (editor: Editor): Api => ({
  hasDraft: () => Storage.hasDraft(editor),
  storeDraft: () => Storage.storeDraft(editor),
  restoreDraft: () => Storage.restoreDraft(editor),
  removeDraft: (fire?: boolean) => Storage.removeDraft(editor, fire),
  isEmpty: (html?: string) => Storage.isEmpty(editor, html)
});

export {
  get
};
