import Editor from '../api/Editor';
import * as ApplyFormat from './ApplyFormat';
import { FormatVars } from './FormatTypes';
import * as MatchFormat from './MatchFormat';
import * as RemoveFormat from './RemoveFormat';

const toggle = (editor: Editor, name: string, vars?: FormatVars, node?: Node): void => {
  const fmt = editor.formatter.get(name);
  if (fmt) {
    if (MatchFormat.match(editor, name, vars, node) && (!('toggle' in fmt[0]) || fmt[0].toggle)) {
      RemoveFormat.removeFormat(editor, name, vars, node);
    } else {
      ApplyFormat.applyFormat(editor, name, vars, node);
    }
  }
};

export {
  toggle
};
