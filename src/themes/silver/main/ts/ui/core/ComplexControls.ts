import { Editor } from '../../../../../../core/main/ts/api/Editor';
import { fontSelectMenu } from './complex/FontSelect';
import { styleSelectMenu } from './complex/StyleSelect';
import { formatSelectMenu } from './complex/FormatSelect';
import { fontsizeSelectMenu } from './complex/FontsizeSelect';
import { UiFactoryBackstage } from '../../backstage/Backstage';

const setup = (editor: Editor, backstage: UiFactoryBackstage) => {
  fontSelectMenu(editor, backstage);
  styleSelectMenu(editor, backstage);
  formatSelectMenu(editor, backstage);
  fontsizeSelectMenu(editor, backstage);
};

export default { setup };
