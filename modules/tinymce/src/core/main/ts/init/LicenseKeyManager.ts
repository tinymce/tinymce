import { Hash, Obj, Type } from '@ephox/katamari';

import AddOnManager, { AddOnConstructor } from '../api/AddOnManager';
import Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as ForceReadonly from './ForceReadonly';

export type LicenseKeyManagerAddon = AddOnConstructor<LicenseKeyHandler>;

interface LicenseKeyManager {
  readonly load: (editor: Editor, suffix: string) => void;
  readonly isLoaded: (editor: Editor) => boolean;
  readonly add: (addOn: LicenseKeyManagerAddon) => void;
  readonly init: (editor: Editor) => void;
}

export interface LicenseKeyHandler {
  readonly verify: (editor: Editor) => Promise<void>;
  readonly validate: (editor: Editor) => Promise<void>;
}

const displayNotification = (editor: Editor, message: string) => {
  editor.notificationManager.open({
    type: 'error',
    text: message
  });
};

const GplLicenseKeyHandler: LicenseKeyHandler = {
  verify: (editor) => {
    const licenseKey = Options.getLicenseKey(editor);
    if (licenseKey !== 'gpl') {
      ForceReadonly.forceReadonly(editor);
      // eslint-disable-next-line no-console
      console.error('License key expected to be "gpl"');
    }
    return Promise.resolve();
  },
  validate: (_editor) => {
    return Promise.resolve();
    // return true;
  }
};

const setup = (): LicenseKeyManager => {
  const ENTERPRISE_KEY = 'enterprise';
  // TODO: Work out how to get actual accurate checksum values
  const enterpriseHandlerIntegirtyChecksums = [ 'a' ];

  const addOnManager = AddOnManager<LicenseKeyHandler>();

  const add = (addOn: AddOnConstructor<LicenseKeyHandler>): void => {
    const contents = addOn.toString();
    Hash.hash('SHA-256', contents).then((hash) => {
      const isValidChecksum = enterpriseHandlerIntegirtyChecksums.includes(hash);
      // eslint-disable-next-line no-console
      console.log(hash, isValidChecksum);
      if (!isValidChecksum) {
        addOnManager.remove(ENTERPRISE_KEY);
        // eslint-disable-next-line no-console
        console.error(`${ENTERPRISE_KEY} license handler does not match known checksums`);
      }
      // TODO: Only add when a valid checksum
      addOnManager.add(ENTERPRISE_KEY, addOn);
    }).catch(() => {
      // eslint-disable-next-line no-console
      console.error(`${ENTERPRISE_KEY} license handler checksum cannot be calculated`);
    });
  };

  const load = (editor: Editor, suffix: string): void => {
    const licenseKey = Options.getLicenseKey(editor);
    if (licenseKey !== 'gpl' && !Obj.has(addOnManager.urls, ENTERPRISE_KEY)) {
      const licenseKeyUrl = Options.getLicenseKeyUrl(editor);
      // TODO: Vefiy url contains 'licensing/enterprise/license${suffix}.js` in it
      const url = Type.isString(licenseKeyUrl)
        ? editor.documentBaseURI.toAbsolute(licenseKeyUrl)
        : `licensing/${ENTERPRISE_KEY}/license${suffix}.js`;

      addOnManager.load(ENTERPRISE_KEY, url).catch(() => {
        // eslint-disable-next-line no-console
        console.error(`Failed to load license key manager: ${ENTERPRISE_KEY} from url ${url}`);
        displayNotification(editor, 'Failed to load license key manager');
      });
    }
  };

  // TODO: Can probably do more here
  const isLoaded = (editor: Editor) => {
    const licenseKey = Options.getLicenseKey(editor);
    if (licenseKey === 'gpl') {
      return true;
    } else {
      return Type.isNonNullable(addOnManager.get(ENTERPRISE_KEY));
    }
  };

  // TODO: Need to handle when no license key is provided at all
  // or the promise of a license key fails
  const init = (editor: Editor): void => {
    const licenseKey = Options.getLicenseKey(editor);
    if (licenseKey === 'gpl') {
      editor.licenseKeyManager = GplLicenseKeyHandler;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      editor.licenseKeyManager.verify(editor);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      editor.licenseKeyManager.validate(editor);
    } else {
      const EnterpriseHandler = addOnManager.get(ENTERPRISE_KEY);
      if (Type.isNonNullable(EnterpriseHandler)) {
        const EnterpriseHandlerApi = EnterpriseHandler(editor, addOnManager.urls.enterprise);
        editor.licenseKeyManager = EnterpriseHandlerApi;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        editor.licenseKeyManager.verify(editor);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        editor.licenseKeyManager.validate(editor);
      } else {
        // TODO: Add message
        ForceReadonly.forceReadonly(editor);
      }
    }
  };

  return {
    load,
    isLoaded,
    add,
    init
  };
};

const LicenseKeyManager: LicenseKeyManager = Object.freeze(setup());

export default LicenseKeyManager;
