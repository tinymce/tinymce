import { FieldSchema, ValueSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { BaseToolbarButton, baseToolbarButtonFields, BaseToolbarButtonInstanceApi, BaseToolbarButtonSpec } from './ToolbarButton';

interface ToolbarGroupSetting {
  name: string;
  items: string[];
}

type ToolbarConfig = string | ToolbarGroupSetting[];

// tslint:disable-next-line:no-empty-interface
export interface GroupToolbarButtonInstanceApi extends BaseToolbarButtonInstanceApi {

}

export interface GroupToolbarButtonSpec extends BaseToolbarButtonSpec<GroupToolbarButtonInstanceApi> {
  type?: 'grouptoolbarbutton';
  items?: ToolbarConfig;
}

export interface GroupToolbarButton extends BaseToolbarButton<GroupToolbarButtonInstanceApi> {
  type: 'grouptoolbarbutton';
  items: ToolbarConfig;
}

export const groupToolbarButtonSchema = ValueSchema.objOf([
  FieldSchema.requiredString('type'),
  FieldSchema.requiredOf('items', ValueSchema.oneOf([
    ValueSchema.arrOfObj([
      FieldSchema.requiredString('name'),
      FieldSchema.requiredArrayOf('items', ValueType.string)
    ]),
    ValueType.string
  ]))
].concat(baseToolbarButtonFields));

export const createGroupToolbarButton = (spec: GroupToolbarButtonSpec): Result<GroupToolbarButton, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<GroupToolbarButton>('GroupToolbarButton', groupToolbarButtonSchema, spec);
