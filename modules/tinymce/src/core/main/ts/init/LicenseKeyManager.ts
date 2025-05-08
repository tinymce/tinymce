import { Obj, Type } from '@ephox/katamari';

import AddOnManager, { AddOnConstructor } from '../api/AddOnManager';
import Editor from '../api/Editor';
import * as Options from '../api/Options';

import * as ForceReadonly from './ForceReadonly';

export type LicenseKeyManagerAddon = AddOnConstructor<LicenseKeyManager>;

interface LicenseKeyManagerLoader {
  readonly load: (editor: Editor, suffix: string) => void;
  readonly isLoaded: (editor: Editor) => boolean;
  readonly add: (addOn: LicenseKeyManagerAddon) => Promise<void>;
  readonly init: (editor: Editor) => void;
}

interface ValidateData {
  plugin?: string;
  [key: string]: any;
}

// TODO: Can we do better than just a Promise<boolean>?
export interface LicenseKeyManager {
  readonly verify?: (editor: Editor) => Promise<boolean>;
  readonly validate?: (editor: Editor, data?: ValidateData) => Promise<boolean>;
}

const displayNotification = (editor: Editor, message: string) => {
  editor.notificationManager.open({
    type: 'error',
    text: message
  });
};

const GplLicenseKeyManager: LicenseKeyManager = {
  verify: () => Promise.resolve(true),
  validate: (_editor, data) => {
    const { plugin } = data || {};
    // Premium plugins are not allowed if 'gpl' is given as the license_key
    if (Type.isString(plugin)) {
      return Promise.resolve(false);
    } else {
      return Promise.resolve(true);
    }
  },
};

const ADDON_KEY = 'commercial';
const PLUGIN_CODE = 'licensekeymanager';

// TODO: TINY-12081: Add tests for this

// // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest

// /**
//  * NOTE: Only works in a secure context
//  */
// const hash = async (algorithm: Algorithm, message: string): Promise<string> => {
//   const msgUint8 = new window.TextEncoder().encode(message); // encode as (utf-8) Uint8Array
//   const hashBuffer = await window.crypto.subtle.digest(algorithm, msgUint8); // hash the message
//   const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
//   const hashHex = hashArray
//     .map((b) => b.toString(16).padStart(2, '0'))
//     .join(''); // convert bytes to hex string
//   return hashHex;
// };

// TODO: TINY-12081: Work out how to get actual accurate checksum values
// const ENTERPRISE_CHECKSUMS = [ 'a' ];
// const verifyAddon = async (checksums: string[], addOn: LicenseKeyManagerAddon): Promise<boolean> => {
//   if (window.isSecureContext) {
//     const contents = addOn.toString();
//     try {
//       const hash = await Hash.hash('SHA-256', contents);
//       const isValidChecksum = checksums.includes(hash);
//       return isValidChecksum;
//     } catch {
//       // eslint-disable-next-line no-console
//       console.error('Unable to verify integrity of license key manager');
//       return false;
//     }
//   } else {
//     return true;
//   }
// };

const setup = (): LicenseKeyManagerLoader => {
  const addOnManager = AddOnManager<LicenseKeyManager>();

  // TODO: TINY-12081: Add integrity/checksum check
  const add = async (addOn: LicenseKeyManagerAddon): Promise<void> => {
    addOnManager.add(ADDON_KEY, addOn);
  };

  const load = (editor: Editor, suffix: string): void => {
    const licenseKey = Options.getLicenseKey(editor);
    if (licenseKey !== 'gpl' && !Obj.has(addOnManager.urls, ADDON_KEY)) {
      // const externalUrl = Options.getExternalPlugins(editor)[PLUGIN_CODE];
      const url = `plugins/${PLUGIN_CODE}/plugin${suffix}.js`;

      addOnManager.load(ADDON_KEY, url).catch(() => {
        // eslint-disable-next-line no-console
        console.error(`Failed to load license key manager from url ${url}`);
        displayNotification(editor, 'Failed to load license key manager');
      });
    }
  };

  const isLoaded = (editor: Editor) => {
    const licenseKey = Options.getLicenseKey(editor);
    if (licenseKey === 'gpl') {
      return true;
    } else {
      return Type.isNonNullable(addOnManager.get(ADDON_KEY));
    }
  };

  // TODO: Should there be a sanity check the license key string starts with some prefix?
  const init = (editor: Editor): void => {
    const licenseKey = Options.getLicenseKey(editor);
    if (licenseKey === 'gpl') {
      editor.licenseKeyManager = GplLicenseKeyManager;
      return;
    }

    // CommercialLicenseKeyManager should be nonnullable here as the
    // editor will not load without a license key manager constructor
    const CommercialLicenseKeyManager = addOnManager.get(ADDON_KEY);
    if (Type.isNullable(CommercialLicenseKeyManager)) {
      return;
    }

    const commercialLicenseKeyManagerApi = CommercialLicenseKeyManager(editor, addOnManager.urls[ADDON_KEY]);
    editor.licenseKeyManager = commercialLicenseKeyManagerApi || {};
    // TODO: Freeze editor.licenseKeyManager property
    const verify = editor.licenseKeyManager.verify;
    const validate = editor.licenseKeyManager.validate;
    if (!Type.isFunction(verify) || !Type.isFunction(validate)) {
      // eslint-disable-next-line no-console
      console.error(`Incorrect license key manager API`);
      displayNotification(editor, 'Failed to intialize license key manager');
      ForceReadonly.forceReadonly(editor);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    verify(editor);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    validate(editor);
  };

  return {
    load,
    isLoaded,
    add,
    init
  };
};

const LicenseKeyManagerLoader: LicenseKeyManagerLoader = Object.freeze(setup());

export default LicenseKeyManagerLoader;
