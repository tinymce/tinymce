import Editor from 'tinymce/core/api/Editor';
import { fontSelectMenu } from './complex/FontSelect';
import { styleSelectMenu } from './complex/StyleSelect';
import { formatSelectMenu } from './complex/FormatSelect';
import { fontsizeSelectMenu } from './complex/FontsizeSelect';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import { alignSelectMenu } from './complex/AlignSelect';

const register = (editor: Editor, backstage: UiFactoryBackstage) => {
  alignSelectMenu(editor, backstage);
  fontSelectMenu(editor, backstage);
  styleSelectMenu(editor, backstage);
  formatSelectMenu(editor, backstage);
  fontsizeSelectMenu(editor, backstage);
};

export {
  register
};
