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
import nock from 'nock';

const api = new Mapcreator('token', 'https://example.com');

test('attach/sync/detach organisations to items', async () => {
  const keys = [1, 2, 3, 4];

  function nockRequest (method) {
    nock('https://example.com').intercept('/v1/mapstyles/sets/1234/organisations', method, { keys }).reply(200);
  }

  const resource = api.mapstyleSets.select(1234);

  nockRequest('post');
  await resource.organisations.attach(keys);

  nockRequest('patch');
  await resource.organisations.sync(keys);

  nockRequest('delete');
  await resource.organisations.detach(keys);
});

test('attach/sync/detach parses items properly', async () => {
  const keys = [1, 2, 3, 4];
  const input = [
    api.organisations.select(1),
    { id: 2 },
    { id: '3' },
    4,
  ];

  function nockRequest (method) {
    nock('https://example.com').intercept('/v1/mapstyles/sets/1234/organisations', method, { keys }).reply(200);
  }

  const resource = api.mapstyleSets.select(1234);

  nockRequest('post');
  await resource.organisations.attach(input);

  nockRequest('patch');
  await resource.organisations.sync(input);

  nockRequest('delete');
  await resource.organisations.detach(input);
});

test('attach/sync/detach single organisations', async () => {
  const key = 123;

  function nockRequest (method) {
    nock('https://example.com').intercept('/v1/mapstyles/sets/1234/organisations', method, { keys: [key] }).reply(200);
  }

  const resource = api.mapstyleSets.select(1234);

  nockRequest('post');
  await resource.organisations.attach(key);

  nockRequest('patch');
  await resource.organisations.sync(key);

  nockRequest('delete');
  await resource.organisations.detach(key);
});

test('invalid values throw TypeErrors', async () => {
  expect.assertions(1);

  const resource = api.mapstyleSets.select(1234);

  try {
    await resource.organisations.attach({ foo: 'bar' });
  } catch (error) {
    expect(error).toBeInstanceOf(TypeError);
  }
});

test('attachAll/detachAll organisation to items ', async () => {
  function nockRequest (method) {
    nock('https://example.com').intercept('/v1/mapstyles/sets/1234/organisations/all', method).reply(200);
  }

  const resource = api.mapstyleSets.select(1234);

  nockRequest('post');
  await resource.organisations.attachAll();

  nockRequest('delete');
  await resource.organisations.detachAll();
});
