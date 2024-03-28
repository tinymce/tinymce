import { Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';

type KeyStatus = 'VALID' | 'INVALID';

const isGplKey = (key: string) => key.toLowerCase() === 'gpl';

const isValidGeneratedKey = (key: string): boolean => key.length >= 64 && key.length <= 255;

export const validateLicenseKey = (key: string): KeyStatus => isGplKey(key) || isValidGeneratedKey(key) ? 'VALID' : 'INVALID';

export const validateEditorLicenseKey = (editor: Editor): void => {
  const licenseKey = Options.getLicenseKey(editor);
  const hasApiKey = Type.isString(Options.getApiKey(editor));
  if (!hasApiKey && (Type.isUndefined(licenseKey) || validateLicenseKey(licenseKey) === 'INVALID')) {
    // eslint-disable-next-line no-console
    console.warn(`TinyMCE is running in evaluation mode. Provide a valid license key or add license_key: 'gpl' to the init config to agree to the open source license terms. Read more at https://www.tiny.cloud/license-key/`);
  }
};
