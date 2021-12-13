import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface HtmlPanelSpec {
  type: 'htmlpanel';
  html: string;
  presets?: 'presentation' | 'document';
}

export interface HtmlPanel {
  uid: string;
  type: 'htmlpanel';
  html: string;
  // The htmlpanel can either have the attribute role = "presentation" or role = "document" and associated behaviours
  presets: 'presentation' | 'document';
}

const htmlPanelFields = [
  ComponentSchema.uid,
  ComponentSchema.type,
  FieldSchema.requiredString('html'),
  FieldSchema.defaultedStringEnum('presets', 'presentation', [ 'presentation', 'document' ])
];

export const htmlPanelSchema = StructureSchema.objOf(htmlPanelFields);

export const createHtmlPanel = (spec: HtmlPanelSpec): Result<HtmlPanel, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<HtmlPanel>('htmlpanel', htmlPanelSchema, spec);
