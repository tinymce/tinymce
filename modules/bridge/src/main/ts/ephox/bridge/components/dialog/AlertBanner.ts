import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface AlertBannerSpec {
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
  ComponentSchema.type,
  ComponentSchema.text,
  FieldSchema.requiredStringEnum('level', [ 'info', 'warn', 'error', 'success' ]),
  ComponentSchema.icon,
  FieldSchema.defaulted('url', '')
];

export const alertBannerSchema = StructureSchema.objOf(alertBannerFields);

export const createAlertBanner = (spec: AlertBannerSpec): Result<AlertBanner, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<AlertBanner>('alertbanner', alertBannerSchema, spec);
