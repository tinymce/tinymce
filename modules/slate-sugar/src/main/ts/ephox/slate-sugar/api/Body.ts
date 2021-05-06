import { ModelApi, SlateLoc, SlateEditor } from './Api';

const getBody = (api: ModelApi): SlateLoc => api.body.getBody();

const getEditor = (api: ModelApi): SlateEditor => api.body.getEditor();

export {
  getBody,
  getEditor
};
