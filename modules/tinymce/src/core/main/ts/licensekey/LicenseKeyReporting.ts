import Editor from '../api/Editor';
import * as MessageReporter from '../MessageReporter';

import { OnlineStatus } from './LicenseKeyUtils';

const DOCS_URL = 'https://www.tiny.cloud/docs/tinymce/latest/license-key/';
const DOCS_URL_MESSAGE = `Read more: ${DOCS_URL}`;

const PROVIDE_LICENSE_KEY_MESSAGE = `Make sure to provide a valid license key or add license_key: 'gpl' to the init config to agree to the open source license terms.`;

const reportNoKeyError = (editor: Editor): void => {
  const baseMessage = 'The editor is disabled because a TinyMCE license key has not been provided.';
  MessageReporter.reportMessage(editor, {
    console: {
      type: 'error',
      message: [
        `${baseMessage}`,
        PROVIDE_LICENSE_KEY_MESSAGE,
        DOCS_URL_MESSAGE
      ].join(' ')
    },
    editor: {
      type: 'warning',
      message: `${baseMessage}`
    }
  });
};

const reportLoadError = (editor: Editor, onlineStatus: OnlineStatus): void => {
  const key = `${onlineStatus === 'online' ? 'API' : 'license'} key`;
  const baseMessage = `The editor is disabled because the TinyMCE ${key} could not be validated.`;
  MessageReporter.reportMessage(editor, {
    console: {
      type: 'error',
      message: [
        `${baseMessage}`,
        `The TinyMCE Commercial License Key Manager plugin is required for the provided ${key} to be validated but could not be loaded.`,
        DOCS_URL_MESSAGE
      ].join(' ')
    },
    editor: {
      type: 'warning',
      message: `${baseMessage}`
    }
  });
};

const reportInvalidPlugin = (editor: Editor, pluginCode: string): void => {
  const baseMessage = `The "${pluginCode}" plugin requires a valid TinyMCE license key.`;
  MessageReporter.reportMessage(editor, {
    console: {
      type: 'error',
      message: [
        `${baseMessage}`,
        DOCS_URL_MESSAGE
      ].join(' ')
    }
  });
};

export {
  reportNoKeyError,
  reportLoadError,
  reportInvalidPlugin
};
