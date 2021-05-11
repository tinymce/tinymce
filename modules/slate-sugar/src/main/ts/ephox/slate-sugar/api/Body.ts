import { ModelApi, SlateLoc } from './Api';

const getBody = (api: ModelApi): SlateLoc => api.body.getBody();

export {
  getBody
};
