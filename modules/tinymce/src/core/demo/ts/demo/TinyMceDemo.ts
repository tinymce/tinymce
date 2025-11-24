import { Class, Insert, SelectorFind, SugarBody, SugarElement, Value } from '@ephox/sugar';

import type { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {
  const textarea = SugarElement.fromTag('textarea');

  Value.set(textarea, `
<ol style="margin-top: 0px; margin-bottom: 0px; padding-inline-start: 48px;">
  <li style="font-size: 10pt; font-family: Arial, sans-serif;">
    <p style="margin-top: 10pt; margin-bottom: 0pt;"><span style="color: #e03e2d;">
    <em><span style="font-size: 10pt; font-family: 'Comic Sans MS', sans-serif; text-decoration: underline; text-decoration-skip-ink: none;">Login to application</span></em></span></p>
  </li>
  <li style="font-size: 10pt; font-family: 'Comic Sans MS', sans-serif; font-style: italic; color: #e03e2d;">
    <p style="margin-top: 0pt; margin-bottom: 0pt;"><span style="color: #e03e2d;"><em><span style="font-size: 10pt; text-decoration: underline; text-decoration-skip-ink: none;">Navigate to Dashboard</span></em></span></p>
  </li>
  <li style="font-size: 10pt; font-family: 'Comic Sans MS', sans-serif; font-style: italic; color: #e03e2d;">
    <p style="margin-top: 0pt; margin-bottom: 0pt;"><span style="color: #e03e2d;"><em><span style="font-size: 10pt; text-decoration: underline; text-decoration-skip-ink: none;">Click on Settings</span></em></span></p>
  </li>
  <li style="font-size: 10pt; font-family: 'Comic Sans MS', sans-serif; font-style: italic; color: #e03e2d;">
    <p style="margin-top: 0pt; margin-bottom: 0pt;"><span style="color: #e03e2d;"><em><span style="font-size: 10pt; text-decoration: underline; text-decoration-skip-ink: none;">Update Profile</span></em></span></p>
  </li>
  <li style="font-size: 10pt; font-family: 'Comic Sans MS', sans-serif; font-style: italic; color: #e03e2d;">
    <p style="margin-top: 0pt; margin-bottom: 10pt;"><span style="color: #e03e2d;"><em><span style="font-size: 10pt; text-decoration: underline; text-decoration-skip-ink: none;">Save changes</span></em></span></p>
  </li>
</ol>
`);
  Class.add(textarea, 'tinymce');
  const container = SelectorFind.descendant(SugarBody.body(), '#ephox-ui').getOrDie();
  Insert.append(container, textarea);

  tinymce.init({
    // imagetools_cors_hosts: ["moxiecode.cachefly.net"],
    // imagetools_proxy: "proxy.php",
    // imagetools_api_key: '123',

    // images_upload_url: 'postAcceptor.php',
    // images_upload_base_path: 'base/path',
    // images_upload_credentials: true,
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    setup: (ed) => {
      ed.ui.registry.addButton('demoButton', {
        text: 'Demo',
        onAction: () => {
          ed.insertContent('Hello world!');
        }
      });
    },

    selector: 'textarea.tinymce',
    plugins: [ 'lists', 'code' ],
    license_key: 'gpl',
    toolbar: 'bold italic numlist bullist | code',
  });
};
