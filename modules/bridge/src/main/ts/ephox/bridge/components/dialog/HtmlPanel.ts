import { FieldSchema, ValueSchema } from '@ephox/boulder';

// The htmlpanel can either have role: presentation or role: document and associated behaviours
export type HtmlPanelPresetTypes = 'presentation' | 'document';

export interface HtmlPanelApi {
  type: 'htmlpanel';
  html: string;
  presets?: HtmlPanelPresetTypes;
}

export interface HtmlPanel {
  type: 'htmlpanel';
  html: string;
  presets: HtmlPanelPresetTypes;
}

export const htmlPanelFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('html'),
  FieldSchema.defaultedStringEnum('presets', 'presentation', ['presentation', 'document'])
];

export const htmlPanelSchema = ValueSchema.objOf(htmlPanelFields);

export const createHtmlPanel = (spec: HtmlPanelApi) => {
  return ValueSchema.asRaw<HtmlPanel>('htmlpanel', htmlPanelSchema, spec);
};