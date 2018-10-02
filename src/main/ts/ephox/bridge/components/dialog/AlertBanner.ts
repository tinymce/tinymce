import { FieldSchema, FieldPresence, ValueSchema } from '@ephox/boulder';
import { Arr, Result } from '@ephox/katamari';
export interface AlertBannerApi {
  type: 'alertbanner';
  level: 'info' | 'warn' | 'error' | 'success';
  text: string;
  icon: string;
}

export interface AlertBanner {
  level: 'info' | 'warn' | 'error' | 'success';
  text: string;
  icon: string;
  url: string;
}

const validateLevel = (level: string) => {
  return Arr.contains([ 'info', 'warn', 'error', 'success' ], level) ?
    Result.value(level) :
    Result.error(`Unsupported level: "${level}", choose one of "info", "warn", "error", "success".`);
};

export const alertBannerFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('text'),
  FieldSchema.field(
    'level',
    'level',
    FieldPresence.strict(),
    ValueSchema.valueOf(validateLevel)
  ),
  FieldSchema.strictString('icon'),
  FieldSchema.defaulted('url', ''),
];

export const alertBannerSchema = ValueSchema.objOf(alertBannerFields);

export const createAlertBanner = (spec: AlertBannerApi): Result<AlertBanner, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<AlertBanner>('alertbanner', alertBannerSchema, spec);
};
