import { Arr, Fun, Obj } from '@ephox/katamari';

const notImplemented = () => {
  throw new Error('Mockup function is not implemented.');
};

const createDataTransferItem = (mime, content) => {
  return {
    kind: 'string',
    type: mime,
    getAsFile: notImplemented,
    getAsString: Fun.constant(content)
  };
};

const create = (inputData) => {
  let data = {};

  const clearData = () => {
    data = {};
    result.items = [];
    result.types = [];
  };

  const getData = (mime) => {
    return mime in data ? data[mime] : '';
  };

  const setData = (mime, content) => {
    data[mime] = content;
    result.types = Obj.keys(data);
    result.items = Arr.map(result.types, (type) => {
      return createDataTransferItem(type, data[type]);
    });
  };

  const result = {
    dropEffect: '',
    effectAllowed: 'all',
    files: [],
    items: [],
    types: [],
    clearData,
    getData,
    setData,
    setDragImage: notImplemented,
    addElement: notImplemented
  };

  Obj.each(inputData, (value, key) => {
    setData(key, value);
  });

  return result;
};

export {
  create
};
