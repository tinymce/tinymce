import { FieldSchema, ValueSchema } from '@ephox/boulder';

export interface HtmlPanelApi {
  type: 'htmlpanel';
  html: string;
  presets?: 'presentation' | 'document';
}

export interface HtmlPanel {
  type: 'htmlpanel';
  html: string;
  // The htmlpanel can either have the attribute role = "presentation" or role = "document" and associated behaviours
  presets: 'presentation' | 'document';
}

const htmlPanelFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('html'),
  FieldSchema.defaultedStringEnum('presets', 'presentation', [ 'presentation', 'document' ])
];

export const htmlPanelSchema = ValueSchema.objOf(htmlPanelFields);

export const createHtmlPanel = (spec: HtmlPanelApi) => ValueSchema.asRaw<HtmlPanel>('htmlpanel', htmlPanelSchema, spec);