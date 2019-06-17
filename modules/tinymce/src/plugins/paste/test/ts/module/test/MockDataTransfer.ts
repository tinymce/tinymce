import { Arr, Obj } from '@ephox/katamari';

const notImplemented = function () {
  throw new Error('Mockup function is not implemented.');
};

const createDataTransferItem = function (mime, content) {
  return {
    kind: 'string',
    type: mime,
    getAsFile: notImplemented,
    getAsString () {
      return content;
    }
  };
};

const create = function (inputData) {
  let data = {}, result;

  const clearData = function () {
    data = {};
    result.items = [];
    result.types = [];
  };

  const getData = function (mime) {
    return mime in data ? data[mime] : '';
  };

  const setData = function (mime, content) {
    data[mime] = content;
    result.types = Obj.keys(data);
    result.items = Arr.map(result.types, function (type) {
      return createDataTransferItem(type, data[type]);
    });
  };

  result = {
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

  Obj.each(inputData, function (value, key) {
    setData(key, value);
  });

  return result;
};

export default {
  create
};