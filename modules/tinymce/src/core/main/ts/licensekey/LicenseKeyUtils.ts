import { Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';

export type OnlineStatus = 'online' | 'offline';
export type LicenseKeyType = 'no_key' | 'gpl' | 'non_gpl';

interface LicenseState {
  readonly onlineStatus: OnlineStatus;
  readonly licenseKeyType: LicenseKeyType;
  readonly forcePlugin: boolean;
}

interface UsePlugin extends LicenseState {
  readonly type: 'use_plugin';
}

interface UseGpl {
  readonly type: 'use_gpl';
  readonly onlineStatus: 'offline';
  readonly licenseKeyType: 'gpl';
  readonly forcePlugin: false;
}

type UseKeyManager = UsePlugin | UseGpl;

const PLUGIN_CODE = 'licensekeymanager';

const getOnlineStatus = (editor: Editor): OnlineStatus => {
  const hasApiKey = Type.isString(Options.getApiKey(editor));
  return hasApiKey ? 'online' : 'offline';
};

const getLicenseKeyType = (editor: Editor): LicenseKeyType => {
  const licenseKey = Options.getLicenseKey(editor)?.toLowerCase();
  if (licenseKey === 'gpl') {
    return 'gpl';
  } else if (Type.isNullable(licenseKey)) {
    return 'no_key';
  } else {
    return 'non_gpl';
  }
};

const determineStrategy = (editor: Editor): UseKeyManager => {
  const onlineStatus = getOnlineStatus(editor);
  const licenseKeyType = getLicenseKeyType(editor);
  const forcePlugin = (new Set(Options.getPlugins(editor))).has(PLUGIN_CODE);

  if (licenseKeyType !== 'gpl' || onlineStatus === 'online' || forcePlugin) {
    return {
      type: 'use_plugin',
      onlineStatus,
      licenseKeyType,
      forcePlugin
    };
  } else {
    return {
      type: 'use_gpl',
      onlineStatus,
      licenseKeyType,
      forcePlugin
    };
  }
};

export {
  PLUGIN_CODE,
  determineStrategy
};
