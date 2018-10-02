import { setupDemo } from '../DemoHelpers';
import { GuiFactory } from '@ephox/alloy';
import { renderAlertBanner } from 'tinymce/themes/silver/ui/general/AlertBanner';
import * as Icons from '../../../../main/ts/ui/icons/Icons';

export default () => {
  const helpers = setupDemo();
  const sharedBackstage = helpers.extras.backstage.shared;

  const alert = GuiFactory.build(
    renderAlertBanner({
      text: 'I say I say yi ha',
      level: 'info', // info | warn | error | success
      icon: Icons.get('icon-close', sharedBackstage.providers.icons),
      actionLabel: 'I might close the banner'
    }, sharedBackstage.providers)
  );

  helpers.uiMothership.add(alert);
};
