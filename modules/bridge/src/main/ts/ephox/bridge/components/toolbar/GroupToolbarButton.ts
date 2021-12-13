import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
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

export const groupToolbarButtonSchema = StructureSchema.objOf([
  ComponentSchema.type,
  FieldSchema.requiredOf('items', StructureSchema.oneOf([
    StructureSchema.arrOfObj([
      ComponentSchema.name,
      FieldSchema.requiredArrayOf('items', ValueType.string)
    ]),
    ValueType.string
  ]))
].concat(baseToolbarButtonFields));

export const createGroupToolbarButton = (spec: GroupToolbarButtonSpec): Result<GroupToolbarButton, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<GroupToolbarButton>('GroupToolbarButton', groupToolbarButtonSchema, spec);
