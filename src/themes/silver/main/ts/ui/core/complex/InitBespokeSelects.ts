import { Editor } from '../../../../../../../core/main/ts/api/Editor';
import { fontSelectMenu } from './FontSelect';
import { styleSelectMenu } from './StyleSelect';
import { formatSelectMenu } from './FormatSelect';
import { fontsizeSelectMenu } from './FontsizeSelect';
import { UiFactoryBackstage } from '../../../backstage/Backstage';

const initBespokes = (editor: Editor, backstage: UiFactoryBackstage) => {
  fontSelectMenu(editor, backstage);
  styleSelectMenu(editor, backstage);
  formatSelectMenu(editor, backstage);
  fontsizeSelectMenu(editor, backstage);
};

export default initBespokes;
