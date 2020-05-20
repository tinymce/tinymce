import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { FormComponentApi, FormComponent, formComponentFields } from './FormComponent';

export interface HtmlPanelApi extends FormComponentApi {
  type: 'htmlpanel';
  html: string;
  presets?: 'presentation' | 'document';
}

export interface HtmlPanel extends FormComponent {
  type: 'htmlpanel';
  html: string;
  // The htmlpanel can either have the attribute role = "presentation" or role = "document" and associated behaviours
  presets: 'presentation' | 'document';
}

const htmlPanelFields = formComponentFields.concat([
  FieldSchema.strictString('html'),
  FieldSchema.defaultedStringEnum('presets', 'presentation', [ 'presentation', 'document' ])
]);

export const htmlPanelSchema = ValueSchema.objOf(htmlPanelFields);

export const htmlPanelDataProcessor = ValueSchema.string;

export const createHtmlPanel = (spec: HtmlPanelApi) => ValueSchema.asRaw<HtmlPanel>('htmlpanel', htmlPanelSchema, spec);
