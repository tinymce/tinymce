import { Arr, Fun, Obj, Strings } from '@ephox/katamari';

const cloudOptions: Record<string, any> = {};

const cloudOptionKeys = new Set([
  'api_key',
  'forced_plugins',
  'service_message'
]);

const cloudOptionPrefixes = [
  'chiffer_',
  'fluffy_',
  'tiny_cloud_'
];

const hasCloudPrefix = (key: string): boolean => Arr.exists(cloudOptionPrefixes, (prefix) => Strings.startsWith(key, prefix));

const isCloudOption = (key: string): boolean => cloudOptionKeys.has(key) || hasCloudPrefix(key);

export const storeCloudOptions = (options: Record<string, any>): void => {
  Obj.each(options, (value, key) => {
    if (isCloudOption(key)) {
      cloudOptions[key] = value;
    }
  });
};

export const getCloudOptions = Fun.constant(cloudOptions);

