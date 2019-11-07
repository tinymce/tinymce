import { BaseToolbarButtonApi, BaseToolbarButtonInstanceApi, BaseToolbarButton, baseToolbarButtonFields } from './ToolbarButton';
import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

interface ToolbarGroupSetting {
  name?: string;
  items: string[];
}

type ToolbarConfig = Array<ToolbarGroupSetting> | string;

export interface FloatingToolbarButtonApi extends BaseToolbarButtonApi<BaseToolbarButtonInstanceApi> {
  type?: 'floatingtoolbarbutton';
  toolbar?: ToolbarConfig;
}

export interface FloatingToolbarButton extends BaseToolbarButton<BaseToolbarButtonInstanceApi>  {
  type: 'floatingtoolbarbutton';
  toolbar: ToolbarConfig;
}

export const floatingToolbarButtonSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.strictOf('toolbar', ValueSchema.oneOf([
    ValueSchema.arrOfObj([
      FieldSchema.strictString('name'),
      FieldSchema.strictArrayOf('items', ValueSchema.string)
    ]),
    ValueSchema.string,
  ])),
].concat(baseToolbarButtonFields));

export const createFloatingToolbarButton = (spec: any): Result<FloatingToolbarButton, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<FloatingToolbarButton>('FloatingToolbarButton', floatingToolbarButtonSchema, spec);
};
