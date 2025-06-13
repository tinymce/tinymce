import { Fun, Obj, Type } from '@ephox/katamari';

import AddOnManager, { AddOnConstructor } from '../api/AddOnManager';
import Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as ErrorReporter from '../ErrorReporter';

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

export interface LicenseKeyManager {
  readonly validate: (data: ValidateData) => Promise<boolean>;
}

const GplLicenseKeyManager: LicenseKeyManager = {
  validate: (data) => {
    const { plugin } = data;
    // Premium plugins are not allowed if 'gpl' is given as the license_key
    return Promise.resolve(!Type.isString(plugin));
  },
};

const ADDON_KEY = 'commercial';
const PLUGIN_CODE = 'licensekeymanager';

const setup = (): LicenseKeyManagerLoader => {
  const addOnManager = AddOnManager<LicenseKeyManager>();

  // TODO: TINY-12081: Add integrity/checksum check
  const add = async (addOn: LicenseKeyManagerAddon): Promise<void> => {
    addOnManager.add(ADDON_KEY, addOn);
  };

  const load = (editor: Editor, suffix: string): void => {
    const licenseKey = Options.getLicenseKey(editor);
    const plugins = new Set(Options.getPlugins(editor));
    const hasApiKey = Type.isString(Options.getApiKey(editor));

    // Early return if addonConstructor already exists
    if (Obj.has(addOnManager.urls, ADDON_KEY)) {
      return;
    }

    // Try loading external license key manager when
    // - license_key is not 'gpl'; or
    // - an API key is present; or
    // - the licensekeymanager has been explicity listed, most likely through the forced_plugins option
    if (licenseKey?.toLowerCase() !== 'gpl' || hasApiKey || plugins.has(PLUGIN_CODE)) {
      const url = `plugins/${PLUGIN_CODE}/plugin${suffix}.js`;
      addOnManager.load(ADDON_KEY, url).catch(() => {
        ErrorReporter.licenseKeyManagerLoadError(editor, url, ADDON_KEY);
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      add(Fun.constant(GplLicenseKeyManager));
    }
  };

  const isLoaded = (editor: Editor): boolean => {
    const licenseKey = Options.getLicenseKey(editor);
    if (licenseKey === 'gpl') {
      return true;
    } else {
      return Type.isNonNullable(addOnManager.get(ADDON_KEY));
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

    // editor will not load without a license key manager constructor
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const LicenseKeyManager = addOnManager.get(ADDON_KEY)!;

    const licenseKeyManagerApi = LicenseKeyManager(editor, addOnManager.urls[ADDON_KEY]);
    setLicenseKeyManager(licenseKeyManagerApi);

    const validate = editor.licenseKeyManager.validate;

    // Validation of the license key is done asynchronously and does
    // not block initialization of the editor
    // The validate function is expected to set the editor to the correct
    // state depending on if the license key is valid or not
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    validate({});
  };

  return {
    load,
    isLoaded,
    add,
    init
  };
};

const LicenseKeyManagerLoader: LicenseKeyManagerLoader = setup();

export default LicenseKeyManagerLoader;
