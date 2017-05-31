/*
 * Utilities: A classic collection of JavaScript utilities
 * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/
var uri = require('../lib/uri')
  , array = require('../lib/array')
  , assert = require('assert')
  , tests = {};

tests = {

  'test getFileExtension for uri': function () {
    var data = uri.getFileExtension('users.json')
      , actual = 'json';
    assert.equal(actual, data);
  }

, 'test paramify for uri': function () {
    var data = uri.paramify({username: 'user', token: 'token', secret: 'secret'})
      , actual = 'username=user&token=token&secret=secret';
    assert.equal(actual, data);
  }

, 'test paramify with conslidate option for uri': function () {
    var data = uri.paramify({username: 'user', auth: ['token', 'secret']}, {conslidate: true})
      , actual = 'username=user&auth=token&auth=secret';
    assert.equal(actual, data);
  }

, 'test paramify with includeEmpty option for uri': function () {
    var data = uri.paramify({username: 'user', token: ''}, {includeEmpty: true})
      , actual = 'username=user&token=';
    assert.equal(actual, data);
  }

, 'test paramify with includeEmpty as 0 option for uri': function () {
    var data = uri.paramify({username: 'user', token: 0}, {includeEmpty: true})
      , actual = 'username=user&token=0';
    assert.equal(actual, data);
  }

, 'test paramify with includeEmpty as null option for uri': function () {
    var data = uri.paramify({username: 'user', token: null}, {includeEmpty: true})
      , actual = 'username=user&token=';
    assert.equal(actual, data);
  }

, 'test paramify with includeEmpty as undefined option for uri': function () {
    var data = uri.paramify({username: 'user', token: undefined}, {includeEmpty: true})
      , actual = 'username=user&token=';
    assert.equal(actual, data);
  }

, 'test paramify with snakeize option for uri': function () {
    var data = uri.paramify({username: 'user', authToken: 'token'}, {snakeize: true})
      , actual = 'username=user&auth_token=token';
    assert.equal(actual, data);
  }

, 'test paramify with escapeVals option for uri': function () {
    var data = uri.paramify({username: 'user', token: '<token'}, {escapeVals: true})
      , actual = 'username=user&token=%26lt%3Btoken';
    assert.equal(actual, data);
  }

, 'test objectify for uri': function () {
    var expected = {name: 'user'}
      , actual = uri.objectify('name=user');
    assert.deepEqual(actual, expected);
  }

, 'test objectify with multiple matching keys for uri': function () {
    var expected = {name: ['user', 'user2']}
      , actual = uri.objectify('name=user&name=user2');
    assert.deepEqual(actual, expected);
  }

, 'test objectify with no conslidation for uri': function () {
    var expected= {name: 'user2'}
      , actual = uri.objectify('name=user&name=user2', {consolidate: false});
    assert.deepEqual(actual, expected);
  }

};

module.exports = tests;
