import { console, Blob } from '@ephox/dom-globals';
import { Http, DataType, HttpData, HttpJwt } from 'ephox/jax/api/Main';
import { FutureResult } from '@ephox/katamari';

/* tslint:disable:no-console */

Http.get({
  url: 'https://httpbin.org/get',
  responseType: DataType.JSON
}).get((result) => {
  result.fold(
    () => console.log('error'),
    (json) => {
      console.log('get json', json);
    }
  );
});

Http.post({
  url: 'https://httpbin.org/post',
  body: HttpData.jsonData({ cool: 'data' }),
  responseType: DataType.JSON
}).get((result) => {
  result.fold(
    () => console.log('error'),
    (json) => {
      console.log('post json', json);
    }
  );
});

Http.del({
  url: 'https://httpbin.org/delete',
  responseType: DataType.Text
}).get((result) => {
  result.fold(
    () => console.log('error'),
    (text) => {
      console.log('delete text', text);
    }
  );
});

Http.put({
  url: 'https://httpbin.org/put',
  body: HttpData.jsonData({ important: 'data' }),
  responseType: DataType.JSON
}).get((result) => {
  result.fold(
    () => console.log('error'),
    (json) => {
      console.log('put json', json);
    }
  );
});

Http.get({
  url: 'https://httpbin.org/bytes/10',
  responseType: DataType.Blob
}).get((result) => {
  result.fold(
    () => console.log('error'),
    (blob) => {
      console.log(`get blob size: ${blob.size}`);
    }
  );
});

Http.get({
  url: 'https://httpbin.org/robots.txt',
  responseType: DataType.Text
}).get((result) => {
  result.fold(
    () => console.log('error'),
    (text) => {
      console.log('get text', text);
    }
  );
});

Http.post({
  url: 'https://httpbin.org/post',
  body: HttpData.formData({
    param1: 'abc',
    param2: 'abc'
  }),
  responseType: DataType.JSON
}).get((result) => {
  result.fold(
    () => console.log('error'),
    (json) => {
      console.log('post form data', json);
    }
  );
});

Http.post({
  url: 'https://httpbin.org/post',
  body: HttpData.multipartFormData({
    param1: 'abc',
    param2: 'abc',
    blob1: new Blob([ 'text' ])
  }),
  responseType: DataType.JSON
}).get((result) => {
  result.fold(
    () => console.log('error'),
    (json) => {
      console.log('post multipart form data', json);
    }
  );
});

Http.download({
  url: 'http://httpbin.org/stream-bytes/1048576',
  progress: (loaded) => {
    console.log('download blob loaded bytes:', loaded);
  }
}).get((result) => {
  result.fold(
    (e) => console.log('download blob error', e),
    (blob) => {
      console.log('download blob', blob);
    }
  );
});

const jwtFactory = (_foo: boolean) => FutureResult.pure('123');

HttpJwt.put({
  url: 'https://httpbin.org/put',
  body: HttpData.jsonData({ important: 'data' }),
  responseType: DataType.JSON
}, jwtFactory).get((result) => {
  result.fold(
    () => console.log('error'),
    (json) => {
      console.log('put json with jwt auth header', json);
    }
  );
});
