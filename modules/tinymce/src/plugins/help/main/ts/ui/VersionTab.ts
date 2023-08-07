import EditorManager from 'tinymce/core/api/EditorManager';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import I18n from 'tinymce/core/api/util/I18n';

const tab = (): Dialog.TabSpec & { name: string } => {
  const getVersion = (major: string, minor: string) => major.indexOf('@') === 0 ? 'X.X.X' : major + '.' + minor;
  const version = getVersion(EditorManager.majorVersion, EditorManager.minorVersion);
  const changeLogLink = '<a data-alloy-tabstop="true" tabindex="-1" href="https://www.tiny.cloud/docs/tinymce/6/changelog/?utm_campaign=editor_referral&utm_medium=help_dialog&utm_source=tinymce" rel="noopener" target="_blank">TinyMCE ' + version + '</a>';

  const htmlPanel: Dialog.HtmlPanelSpec = {
    type: 'htmlpanel',
    html: '<p>' + I18n.translate([ 'You are using {0}', changeLogLink ]) + '</p>',
    presets: 'document'
  };

  return {
    name: 'versions',
    title: 'Version',
    items: [
      htmlPanel
    ]
  };
};

export {
  tab
};
