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

export interface LicenseKeyManager {
  readonly verify?: (editor: Editor) => Promise<void>;
  readonly validate?: <T>(editor: Editor, data?: T) => Promise<void>;
}

const displayNotification = (editor: Editor, message: string) => {
  editor.notificationManager.open({
    type: 'error',
    text: message
  });
};

// Gracefully handle any exceptions for promise rejections
// const getLicenseKeySafe = async (editor: Editor): Promise<Optional<string>> => {
//   try {
//     const licenseKey = await Options.getLicenseKey(editor);
//     return Optional.from(licenseKey).filter(Type.isString);
//   } catch {
//     return Optional.none();
//   }
// };

const promiseNoop = () => Promise.resolve();

const GplLicenseKeyManager: LicenseKeyManager = {
  verify: promiseNoop,
  // TODO: TINY-11819: Consider blocking of premium plugins
  validate: promiseNoop,
};

const ENTERPRISE_KEY = 'enterprise';

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

  const add = async (addOn: LicenseKeyManagerAddon): Promise<void> => {
    // TODO: TINY-12081: Only add when have a valid checksum
    // const isValid = await verifyAddon(ENTERPRISE_CHECKSUMS, addOn);
    // if (!isValid) {
    //   addOnManager.remove(ENTERPRISE_KEY);
    //   // eslint-disable-next-line no-console
    //   console.error(`${ENTERPRISE_KEY} license handler does not match known checksums`);
    // }
    addOnManager.add(ENTERPRISE_KEY, addOn);
  };

  const load = (editor: Editor, suffix: string): void => {
    const licenseKey = Options.getLicenseKey(editor);
    if (licenseKey !== 'gpl' && !Obj.has(addOnManager.urls, ENTERPRISE_KEY)) {
      const licenseKeyManagerUrl = Options.getLicenseKeyManagerUrl(editor);
      const url = Type.isString(licenseKeyManagerUrl)
        ? editor.documentBaseURI.toAbsolute(licenseKeyManagerUrl)
        : `licensing/${ENTERPRISE_KEY}/license${suffix}.js`;

      addOnManager.load(ENTERPRISE_KEY, url).catch(() => {
        // eslint-disable-next-line no-console
        console.error(`Failed to load license key manager: ${ENTERPRISE_KEY} from url ${url}`);
        displayNotification(editor, 'Failed to load license key manager');
      });
    }
  };

  const isLoaded = (editor: Editor) => {
    const licenseKey = Options.getLicenseKey(editor);
    if (licenseKey === 'gpl') {
      return true;
    } else {
      return Type.isNonNullable(addOnManager.get(ENTERPRISE_KEY));
    }
  };

  // TODO: Should there be a sanity check the license key string starts with some prefix?
  const init = (editor: Editor): void => {
    const licenseKey = Options.getLicenseKey(editor);
    if (Type.isNullable(licenseKey)) {
      // eslint-disable-next-line no-console
      console.error(`License key missing`);
      displayNotification(editor, 'Failed to intialize license key manager');
      // TODO: Confirm this is the correct action
      ForceReadonly.forceReadonly(editor);
      return;
    }
    if (licenseKey === 'gpl') {
      editor.licenseKeyManager = GplLicenseKeyManager;
      return;
    }

    const EnterpriseLicenseKeyManager = addOnManager.get(ENTERPRISE_KEY);
    if (Type.isNonNullable(EnterpriseLicenseKeyManager)) {
      const EnterpriseLicenseKeyManagerApi = EnterpriseLicenseKeyManager(editor, addOnManager.urls.enterprise);
      editor.licenseKeyManager = EnterpriseLicenseKeyManagerApi || {};
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
    }
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
