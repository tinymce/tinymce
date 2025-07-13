import { Type } from '@ephox/katamari';

import AddOnManager, { AddOnConstructor } from '../api/AddOnManager';
import Editor from '../api/Editor';
import * as ErrorReporter from '../ErrorReporter';
import * as ForceDisable from '../ForceDisable';

import * as LicenseKeyReporting from './LicenseKeyReporting';
import * as LicenseKeyUtils from './LicenseKeyUtils';

export type LicenseKeyManagerAddon = AddOnConstructor<LicenseKeyManager>;

interface LicenseKeyManagerLoader {
  readonly load: (editor: Editor, suffix: string) => void;
  readonly add: (addOn: LicenseKeyManagerAddon) => void;
  readonly init: (editor: Editor) => void;
}

interface ValidateData {
  plugin?: string;
  [key: string]: any;
}

export interface LicenseKeyManager {
  readonly validate: (data: ValidateData) => Promise<boolean>;
}

const NoLicenseKeyManager: LicenseKeyManager = {
  validate: () => {
    return Promise.resolve(false);
  },
};

const GplLicenseKeyManager: LicenseKeyManager = {
  validate: (data) => {
    const { plugin } = data;
    // Premium plugins are not allowed if 'gpl' is given as the license_key
    return Promise.resolve(!Type.isString(plugin));
  },
};

const ADDON_KEY = 'manager';
const PLUGIN_CODE = LicenseKeyUtils.PLUGIN_CODE;

const setup = (): LicenseKeyManagerLoader => {
  const addOnManager = AddOnManager<LicenseKeyManager>();

  const add = (addOn: LicenseKeyManagerAddon): void => {
    addOnManager.add(ADDON_KEY, addOn);
  };

  const load = (editor: Editor, suffix: string): void => {
    const strategy = LicenseKeyUtils.determineStrategy(editor);
    if (strategy.type === 'use_plugin') {
      const url = `plugins/${PLUGIN_CODE}/plugin${suffix}.js`;
      addOnManager.load(ADDON_KEY, url).catch(() => {
        ErrorReporter.licenseKeyManagerLoadError(editor, url);
      });
    }
  };

  const init = (editor: Editor): void => {
    const setLicenseKeyManager = (licenseKeyManager: LicenseKeyManager) => {
      Object.defineProperty(editor, 'licenseKeyManager', {
        value: licenseKeyManager,
        writable: false,
        configurable: false,
        enumerable: true,
      });
    };

    const strategy = LicenseKeyUtils.determineStrategy(editor);

    switch (strategy.type) {
      case 'use_gpl': {
        setLicenseKeyManager(GplLicenseKeyManager);
        break;
      }
      case 'use_plugin': {
        const LicenseKeyManager = addOnManager.get(ADDON_KEY);
        // Check if license key manager plugin is loaded
        if (Type.isNonNullable(LicenseKeyManager)) {
          const licenseKeyManagerApi = LicenseKeyManager(editor, addOnManager.urls[ADDON_KEY]);
          setLicenseKeyManager(licenseKeyManagerApi);
        } else {
          ForceDisable.forceDisable(editor);
          setLicenseKeyManager(NoLicenseKeyManager);
          if (strategy.onlineStatus === 'offline' && strategy.licenseKeyType === 'no_key') {
            LicenseKeyReporting.reportNoKeyError(editor);
          } else {
            LicenseKeyReporting.reportLoadError(editor, strategy.onlineStatus);
          }
        }
        break;
      }
    }

    // Validation of the license key is done asynchronously and does
    // not block initialization of the editor
    // The validate function is expected to set the editor to the correct
    // state depending on if the license key is valid or not
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    editor.licenseKeyManager.validate({});
  };

  return {
    load,
    add,
    init
  };
};

const LicenseKeyManagerLoader: LicenseKeyManagerLoader = setup();

export default LicenseKeyManagerLoader;
