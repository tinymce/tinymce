import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

export interface AlertBannerApi {
  type: 'alertbanner';
  level: 'info' | 'warn' | 'error' | 'success';
  text: string;
  icon: string;
  url?: string;
}

export interface AlertBanner {
  type: 'alertbanner';
  level: 'info' | 'warn' | 'error' | 'success';
  text: string;
  icon: string;
  url: string;
}

const alertBannerFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('text'),
  FieldSchema.strictStringEnum('level', [ 'info', 'warn', 'error', 'success' ]),
  FieldSchema.strictString('icon'),
  FieldSchema.defaulted('url', ''),
];

export const alertBannerSchema = ValueSchema.objOf(alertBannerFields);

export const createAlertBanner = (spec: AlertBannerApi): Result<AlertBanner, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<AlertBanner>('alertbanner', alertBannerSchema, spec);
};
