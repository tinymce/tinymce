import { FieldSchema, ValueSchema } from '@ephox/boulder';

export interface HtmlPanelApi {
  type: 'htmlpanel';
  html: string;
}

export interface HtmlPanel {
  type: 'htmlpanel';
  html: string;
}

export const htmlPanelFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictString('html')
];

export const htmlPanelSchema = ValueSchema.objOf(htmlPanelFields);

export const createHtmlPanel = (spec: HtmlPanelApi) => {
  return ValueSchema.asRaw<HtmlPanel>('htmlpanel', htmlPanelSchema, spec);
};