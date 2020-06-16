import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { BaseToolbarButton, BaseToolbarButtonApi, baseToolbarButtonFields, BaseToolbarButtonInstanceApi } from './ToolbarButton';

interface ToolbarGroupSetting {
  name: string;
  items: string[];
}

type ToolbarConfig = string | ToolbarGroupSetting[];

// tslint:disable-next-line:no-empty-interface
export interface GroupToolbarButtonInstanceApi extends BaseToolbarButtonInstanceApi {

}

export interface GroupToolbarButtonApi extends BaseToolbarButtonApi<GroupToolbarButtonInstanceApi> {
  type?: 'grouptoolbarbutton';
  items?: ToolbarConfig;
}

export interface GroupToolbarButton extends BaseToolbarButton<GroupToolbarButtonInstanceApi> {
  type: 'grouptoolbarbutton';
  items: ToolbarConfig;
}

export const groupToolbarButtonSchema = ValueSchema.objOf([
  FieldSchema.strictString('type'),
  FieldSchema.strictOf('items', ValueSchema.oneOf([
    ValueSchema.arrOfObj([
      FieldSchema.strictString('name'),
      FieldSchema.strictArrayOf('items', ValueSchema.string)
    ]),
    ValueSchema.string
  ]))
].concat(baseToolbarButtonFields));

export const createGroupToolbarButton = (spec: any): Result<GroupToolbarButton, ValueSchema.SchemaError<any>> => ValueSchema.asRaw<GroupToolbarButton>('GroupToolbarButton', groupToolbarButtonSchema, spec);
