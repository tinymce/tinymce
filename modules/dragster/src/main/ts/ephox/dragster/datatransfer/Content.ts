import { Optional } from '@ephox/katamari';

const getHtmlData = (dataTransfer: DataTransfer): Optional<string> => {
  const html = dataTransfer.getData('text/html');
  return html === '' ? Optional.none() : Optional.some(html);
};

const setHtmlData = (dataTransfer: DataTransfer, html: string): void =>
  dataTransfer.setData('text/html', html);

export {
  getHtmlData,
  setHtmlData
};
