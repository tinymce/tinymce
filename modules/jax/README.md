# Description

`jax` is a library for handling AJAX requests and responses. It does not bundle any commands. It is only a collection of modules.


# Installation

`jax` is available as an `npm` package. You can install it via the npm package `@ephox/jax`

## Install from npm

`npm install @ephox/jax`.

# Using the API


`jax` supports several methods, content types, and response types. More specifically,

Methods: GET, POST, PUT, DELETE
Content Types: none, form, json, plain, html
Response Types: json, blob, text, html, xml

In addition, `credentials` can be sent with the request. More information can be found [here](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials).

The `ephox.jax.api.Ajax` APIs provide the various methods for making AJAX requests. They all return a `LazyValue` (see [katamari](https://www.npmjs.com/package/@ephox/katamari)) which is a promise-like data structure with `get`, `map`, and `isReady` functions. The APIs also take an additional parameter at the end for any custom request headers, which defaults to `{}` if it is not provided.

`ContentType`, `ResponseType`, and `Credentials` are specified using the constructors inside `ephox.jax.api.ContentType`, `ephox.jax.api.ResponseType`, and `ephox.jax.api.Credentials` respectively.

## GET Requests

`Ajax.get(url, responseType, credentials, _custom)`

This fires a GET request with the specified response type. The content type is sent as `none`.

```
Ajax.get(
  'http://localhost/server/get/1',
  ResponseType.json(),
  Credentials.none(),
  { }
).get(function (result) {
  // result is a result, so you need to fold over it for Err or Succ(x)
  result.fold(function (err) {
    console.error('Server error', err);
  }, function (val) {
    console.log('Get response', val);
  })
});
```

## POST Requests

`Ajax.post(url, contentType, responseType, credentials, _custom)`

This fires a POST request with the specified response type and content type.

```
Ajax.post(
  'http://localhost/server/post',
  ContentType.json({
    'send-data': '10'
  }),
  ResponseType.xml(),
  Credentials.none(),
  { }
)).get(function (result) {
  // result is a result, so you need to fold over it for Err or Succ(x)
  result.fold(function (err) {
    console.error('Server error', err);
  }, function (xml) {
    console.log('Post response', xml);
  })
});
```

## PUT Requests

`Ajax.put(url, contentType, responseType, credentials, _custom)`

This fires a PUT request with the specified response type and content type.

```
Ajax.put(
  'http://localhost/server/put',
  ContentType.json({
    'send-data': '10'
  }),
  ResponseType.json(),
  Credentials.none(),
  { }
)).get(function (result) {
  // result is a result, so you need to fold over it for Err or Succ(x)
  result.fold(function (err) {
    console.error('Server error', err);
  }, function (val) {
    console.log('Put response', val);
  })
});
```

## DELETE requests

`Ajax.del(url, responseType, credentials, _custom)`

This fires a DELETE request with the specified response type.

```
Ajax.get(
  'http://localhost/server/del/1',
  ResponseType.json(),
  Credentials.none(),
  { }
).get(function (result) {
  // result is a result, so you need to fold over it for Err or Succ(x)
  result.fold(function (err) {
    console.error('Server error', err);
  }, function (val) {
    console.log('Delete response', val);
  })
});
```

# Running Tests

`$ yarn test`

These tests require [bedrock](https://www.npmjs.com/package/@ephox/bedrock) and phantomjs.
