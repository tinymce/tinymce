import { setupDemo } from '../DemoHelpers';
import { GuiFactory } from '@ephox/alloy';
import { renderAlertBanner } from 'tinymce/themes/silver/ui/general/AlertBanner';

export default () => {
  const helpers = setupDemo();
  const sharedBackstage = helpers.extras.backstage.shared;

  const alert = GuiFactory.build(
    renderAlertBanner({
      text: 'I say I say yi ha',
      level: 'info', // info | warn | error | success
      icon: 'info',
      actionLabel: 'I might close the banner'
    }, sharedBackstage.providers)
  );

  helpers.uiMothership.add(alert);
};
