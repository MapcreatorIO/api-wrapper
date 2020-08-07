/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2020, Mapcreator
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *  Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 *  Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import Mapcreator from '../../../src/Mapcreator';
import ResourceBase from '../../../src/resources/base/ResourceBase';

class DummyResource extends ResourceBase {
  static get resourceName() {
    return 'dummy';
  }
}

const api = new Mapcreator('token', 'example.com');

test('::toObject(false) should return snake_case keys', () => {
  const input = {
    helloWorld: 123,
    'foo_bar': 456,
  };

  const output = {
    'hello_world': 123,
    'foo_bar': 456,
  };

  const resource = new DummyResource(api, input);

  expect(resource.toObject(false)).toEqual(output);
});


test('::toObject(true) should return camelCase keys', () => {
  const input = {
    helloWorld: 123,
    'foo_bar': 456,
  };

  const output = {
    helloWorld: 123,
    fooBar: 456,
  };

  const resource = new DummyResource(api, input);

  expect(resource.toObject(true)).toEqual(output);
});

test('keys are normalized', () => {
  const input = {
    helloWorld: 123,
    'foo_bar': 456,
  };

  const resource = new DummyResource(api, input);

  expect(resource.helloWorld).toEqual(input.helloWorld);
  expect(resource.fooBar).toEqual(input['foo_bar']);
});

test('if deleted_at is present deleted should also exist', () => {
  const resource1 = new DummyResource(api, {'deleted_at': null});
  const resource2 = new DummyResource(api, {'deleted_at': new Date()});

  expect(resource1.deleted).toEqual(false);
  expect(resource2.deleted).toEqual(true);
});

test('protected fields should not be writable', () => {
  const resource = new DummyResource(api, {id: 123});

  expect(resource.id).toEqual(123);

  expect(() => {
    resource.id = 456;
  }).toThrow(TypeError);

  expect(resource.id).toEqual(123);
});

test('sanitize should commit updates locally', () => {
  const resource = new DummyResource(api, {'foo_bar': 0});

  expect(resource.fooBar).toEqual(0);

  resource.fooBar = 123;

  expect(resource.fooBar).toEqual(123);
  expect(resource._properties['foo_bar']).toEqual(123);

  resource.sanitize();

  expect(resource.fooBar).toEqual(123);
  expect(resource._baseProperties['foo_bar']).toEqual(123);
});

test('_updateProperties should move properties', () => {
  const resource = new DummyResource(api, {});

  expect(resource.fooBar).toBeUndefined();

  resource.fooBar = 123;

  expect(resource.fooBar).toEqual(123);
  expect(resource._properties['foo_bar']).toBeUndefined();

  resource._updateProperties();

  expect(resource.fooBar).toEqual(123);
  expect(resource._properties['foo_bar']).toEqual(123);
  expect(resource._knownFields).toContain('foo_bar');
});

test('reset should reset all fields', () => {
  const resource = new DummyResource(api, {foo: 1, bar: 2, baz: 3});

  expect(resource.foo).toEqual(1);
  expect(resource.bar).toEqual(2);
  expect(resource.baz).toEqual(3);

  resource.foo *= 10;
  resource.bar *= 10;
  resource.baz *= 10;

  expect(resource.foo).toEqual(10);
  expect(resource.bar).toEqual(20);
  expect(resource.baz).toEqual(30);

  resource.reset();

  expect(resource.foo).toEqual(1);
  expect(resource.bar).toEqual(2);
  expect(resource.baz).toEqual(3);
});

test('reset(field) should reset a single field', () => {
  const resource = new DummyResource(api, {foo: 1, bar: 2, baz: 3});

  expect(resource.foo).toEqual(1);
  expect(resource.bar).toEqual(2);
  expect(resource.baz).toEqual(3);

  resource.foo *= 10;
  resource.bar *= 10;
  resource.baz *= 10;

  expect(resource.foo).toEqual(10);
  expect(resource.bar).toEqual(20);
  expect(resource.baz).toEqual(30);

  resource.reset('foo');

  expect(resource.foo).toEqual(1);
  expect(resource.bar).toEqual(20);
  expect(resource.baz).toEqual(30);
});

test('url should bind instance variables', () => {
  const resource = new DummyResource(api, {id: 123});

  expect(resource.url).toEqual('example.com/v1/dummy/123');
});

test('fieldNames should return a list of all fields', () => {
  const resource = new DummyResource(api, {foo: 1, bar: 2, baz: 3});

  expect(resource.fieldNames).toEqual(['foo', 'bar', 'baz']);
});

