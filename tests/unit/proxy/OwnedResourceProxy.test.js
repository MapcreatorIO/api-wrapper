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


import moxios from 'moxios';
import Maps4News from '../../../src/Maps4News';

const api = new Maps4News('token', 'https://example.com');

test('attach/sync/detach items to the organisation', async () => {
  expect.assertions(9);

  const keys = [1, 2, 3, 4];

  function getHandler(method) {
    return () => {
      const request = moxios.requests.mostRecent();

      expect(request.config.method).toEqual(method);
      expect(request.config.url).toEqual('https://example.com/v1/organisations/mine/colors');

      const {keys} = JSON.parse(request.config.data);

      expect(keys).toEqual(keys);

      request.respondWith({status: 204});
    };
  }

  moxios.wait(getHandler('post'));
  await api.organisations.select('mine').colors.attach(keys);

  moxios.wait(getHandler('patch'));
  await api.organisations.select('mine').colors.sync(keys);

  moxios.wait(getHandler('delete'));
  await api.organisations.select('mine').colors.detach(keys);
});

test('attach/sync/detach parses items properly', async () => {
  expect.assertions(9);

  const input = [
    api.languages.select(1), // Uses a different resource key
    {id: 2},
    api.users.select(3),
    4,
  ];

  function getHandler(method) {
    return () => {
      const request = moxios.requests.mostRecent();

      expect(request.config.method).toEqual(method);
      expect(request.config.url).toEqual('https://example.com/v1/organisations/mine/colors');

      const {keys} = JSON.parse(request.config.data);

      expect(keys).toEqual([1, 2, 3, 4]);

      request.respondWith({status: 204});
    };
  }

  moxios.wait(getHandler('post'));
  await api.organisations.select('mine').colors.attach(input);

  moxios.wait(getHandler('patch'));
  await api.organisations.select('mine').colors.sync(input);

  moxios.wait(getHandler('delete'));
  await api.organisations.select('mine').colors.detach(input);
});

test('attach/sync/detach single items', async () => {
  expect.assertions(9);

  const key = 123;

  function getHandler(method) {
    return () => {
      const request = moxios.requests.mostRecent();

      expect(request.config.method).toEqual(method);
      expect(request.config.url).toEqual('https://example.com/v1/organisations/mine/colors');

      const {keys} = JSON.parse(request.config.data);

      expect(keys).toEqual([key]);

      request.respondWith({status: 204});
    };
  }

  moxios.wait(getHandler('post'));
  await api.organisations.select('mine').colors.attach(key);

  moxios.wait(getHandler('patch'));
  await api.organisations.select('mine').colors.sync(key);

  moxios.wait(getHandler('delete'));
  await api.organisations.select('mine').colors.detach(key);
});

test('invalid values throw TypeErrors', async () => {
  expect.assertions(1);

  try {
    await api.organisations.select('mine').colors.attach({foo: 'bar'});
  } catch (error) {
    expect(error).toBeInstanceOf(TypeError);
  }
});

test('attachAll/detachAll items to the organisation', async () => {
  expect.assertions(4);

  function getHandler(method) {
    return () => {
      const request = moxios.requests.mostRecent();

      expect(request.config.method).toEqual(method);
      expect(request.config.url).toEqual('https://example.com/v1/organisations/mine/colors/all');

      request.respondWith({status: 204});
    };
  }

  moxios.wait(getHandler('post'));
  await api.organisations.select('mine').colors.attachAll();

  moxios.wait(getHandler('delete'));
  await api.organisations.select('mine').colors.detachAll();
});
