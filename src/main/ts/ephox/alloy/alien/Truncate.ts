import { Html, Replication } from '@ephox/sugar';

const getHtml = (element) => {
  const clone = Replication.shallow(element);
  return Html.getOuter(clone);
};

export {
  getHtml
};