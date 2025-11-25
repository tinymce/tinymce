import { Obj, Strings, Type } from '@ephox/katamari';

import AddOnManager, { type AddOnConstructor } from '../api/AddOnManager';
import type Editor from '../api/Editor';
import * as Options from '../api/Options';
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

const createFallbackLicenseKeyManager = (canValidate: boolean) => (editor: Editor): LicenseKeyManager => {
  let hasShownPluginNotification = false;
  return {
    validate: (data) => {
      const { plugin } = data;
      const hasPlugin = Type.isString(plugin);
      // Premium plugins are not allowed
      if (hasPlugin) {
        LicenseKeyReporting.reportInvalidPlugin(editor, plugin, hasShownPluginNotification);
        hasShownPluginNotification = true;
      }
      return Promise.resolve(canValidate && !hasPlugin);
    },
  };
};

const NoLicenseKeyManager = createFallbackLicenseKeyManager(false);
const GplLicenseKeyManager = createFallbackLicenseKeyManager(true);

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
      const externalUrl = Obj.get(Options.getExternalPlugins(editor), PLUGIN_CODE).map(Strings.trim).filter(Strings.isNotEmpty);
      const url = externalUrl.getOr(`plugins/${PLUGIN_CODE}/plugin${suffix}.js`);
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

    const LicenseKeyManager = addOnManager.get(ADDON_KEY);
    // Use plugin if it is already loaded as it can handle all license key types
    if (Type.isNonNullable(LicenseKeyManager)) {
      const licenseKeyManagerApi = LicenseKeyManager(editor, addOnManager.urls[ADDON_KEY]);
      setLicenseKeyManager(licenseKeyManagerApi);
    } else {
      switch (strategy.type) {
        case 'use_gpl': {
          setLicenseKeyManager(GplLicenseKeyManager(editor));
          break;
        }
        case 'use_plugin': {
          // We know the plugin hasn't loaded and it is required
          ForceDisable.forceDisable(editor);
          setLicenseKeyManager(NoLicenseKeyManager(editor));
          if (strategy.onlineStatus === 'offline' && strategy.licenseKeyType === 'no_key') {
            LicenseKeyReporting.reportNoKeyError(editor);
          } else {
            LicenseKeyReporting.reportLoadError(editor, strategy.onlineStatus);
          }
          break;
        }
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
