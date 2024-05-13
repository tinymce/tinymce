import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Fun, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface HtmlPanelSpec {
  type: 'htmlpanel';
  html: string;
  onInit?: (el: HTMLElement) => void;
  presets?: 'presentation' | 'document';
  stretched?: boolean;
}

export interface HtmlPanel {
  type: 'htmlpanel';
  html: string;
  // The htmlpanel can either have the attribute role = "presentation" or role = "document" and associated behaviours
  onInit: (el: HTMLElement) => void;
  presets: 'presentation' | 'document';
  stretched: boolean;
}

const htmlPanelFields = [
  ComponentSchema.type,
  FieldSchema.requiredString('html'),
  FieldSchema.defaultedStringEnum('presets', 'presentation', [ 'presentation', 'document' ]),
  FieldSchema.defaultedFunction('onInit', Fun.noop),
  FieldSchema.defaultedBoolean('stretched', false),
];

export const htmlPanelSchema = StructureSchema.objOf(htmlPanelFields);

export const createHtmlPanel = (spec: HtmlPanelSpec): Result<HtmlPanel, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<HtmlPanel>('htmlpanel', htmlPanelSchema, spec);
