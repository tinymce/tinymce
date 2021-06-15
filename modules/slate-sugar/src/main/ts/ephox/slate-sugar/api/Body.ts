import { ModelApi, ModelLocation } from './Api';

const getBody = (api: ModelApi): ModelLocation => api.body.getBody();

export {
  getBody
};
