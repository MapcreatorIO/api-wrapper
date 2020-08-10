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

import { DeletedState } from '../../src/enums';
import RequestParameters from '../../src/RequestParameters';

RequestParameters.resetDefaults();

const cleanParams = new RequestParameters();

test('RequestParameters should use defaults', () => {
  expect.assertions(RequestParameters.keys().length);

  const params = new RequestParameters();

  RequestParameters.keys().forEach(key => {
    expect(params[key]).toEqual(RequestParameters[key]);
  });
});


test('RequestParameters should be able to reset defaults', () => {
  const newPage = Math.round(Math.random() * 100000);

  RequestParameters.page = newPage;
  expect(RequestParameters.page).toEqual(newPage);

  RequestParameters.resetDefaults();
  expect(RequestParameters.page).toEqual(1);
});

test('RequestParameters can generate cache tokens', () => {
  const params = cleanParams.copy();

  expect(params.token()).toEqual('0c574931'); // Default token

  // Page and perPage shouldn't affect the token
  params.page = Math.round(Math.random() * 100000);
  params.perPage = Math.round(Math.random() * 50);

  expect(params.token()).toEqual('0c574931');

  params.sort = 'quick,-brown,fox';

  expect(params.token()).toEqual('47115fb4');
});

const validationTests = {
  page: {
    good: [1, 2, 3, 4, 100],
    bad: [new Date(), {}, [], '1', 13.37, -1, NaN, Infinity],
  },
  perPage: {
    good: [1, 2, 3, 4, [100, 50]],
    bad: [new Date(), {}, [], '1', 13.37, -1, 0, NaN, Infinity],
  },
  offset: {
    good: [
      0, 1, 10, 100, 1000000,
    ],
    bad: [-1, NaN, Infinity, -Infinity, 13.37, [], {}, '1'],
  },
  search: {
    good: [
      {
        name: '^:test',
        scaleMin: ['>:1', '<:10'],
      },
      {},
      [{ a: [], b: '', c: null }, { b: '' }],
    ],
    bad: [
      { o: {} },
      { f: () => false },
      420,
      'Hello World!',
      ['foo'],
      { foo: [[]] },
    ],
  },
  sort: {
    good: [
      [['foo', '-bar', '+baz'], ['foo', '-bar', '+baz']],
      ['foo,-bar,+baz', ['foo', '-bar', '+baz']],
    ],
    bad: [0, null, {}, [1], [{}], [() => '']],
  },
  deleted: {
    good: DeletedState.values(),
    bad: ['foo', 'bar', {}, 123],
  },
  extra: {
    good: [{}, { foo: 'bar' }],
    bad: ['', 123],
  },
};

for (const key of Object.keys(validationTests)) {
  test(`RequestParameters validation for ${key}`, () => {
    const params = cleanParams.copy();
    const target = validationTests[key];

    target.good.forEach(input => {
      if (input instanceof Array) {
        params[key] = input[0];
        expect(params[key]).toEqual(input[1]);
      } else {
        params[key] = input;
        expect(params[key]).toEqual(input);
      }
    });

    target.bad.forEach(input => {
      expect(() => {
        params[key] = input;
      }).toThrow(TypeError);
    });
  });
}

test('issue #93', () => {
  const params = new RequestParameters({ sort: '-name' });

  expect(params.toObject().sort).toEqual(['-name']);
  expect(params.encode()).toEqual('page=1&per_page=12&sort=-name');
});

test('deleted will be omitted unless defined', () => {
  const params = new RequestParameters();

  expect(params.toObject().deleted).toBeUndefined();
  expect(params.encode()).toEqual('page=1&per_page=12&sort=');

  params.deleted = DeletedState.ALL;

  expect(params.toObject().deleted).toEqual(DeletedState.ALL);
  expect(params.encode()).toEqual('deleted=all&page=1&per_page=12&sort=');
});

test('extra parameters overwrite others', () => {
  const params = new RequestParameters({
    deleted: 'none',
    extra: {
      deleted: 'some',
      pirateFlag: 'cool',
    },
    search: {
      foo: true,
      bar: null,
    },
  });

  expect(params.toObject().deleted).toEqual('none');
  expect(params.toParameterObject().deleted).toEqual('some');
  expect(params.encode()).toEqual('deleted=some&page=1&per_page=12&pirateFlag=cool&search[foo]=1&sort=');
});

test('encoded search keys must be snake_case', () => {
  const params = cleanParams.copy();

  params.search = {
    'fooBar,Baz': 'test',
  };

  expect(params.encode()).toEqual('page=1&per_page=12&search[foo_bar,baz]=test&sort='.replace(',', '%2C'));
});

test('null is properly encoded', () => {
  const params = cleanParams.copy();

  params.extra = {
    foo: null,
  };

  expect(params.encode()).toEqual('foo&page=1&per_page=12&sort=');
});

test('RequestParameters can have properties applied to it', () => {
  const params = cleanParams.copy();

  params.apply({
    extra: {
      deleted: 'some',
      pirateFlag: 'cool',
    },
    foo: {
      bar: 'baz',
    },
    _deleted: 'only',
  });

  expect(params.deleted).toBeUndefined();
  expect(params.toParameterObject().pirateFlag).toEqual('cool');
  expect(params.foo).toBeUndefined();
});

test('RequestParameters can have properties applied to it from other RequestParameters', () => {
  const params = cleanParams.copy();

  params.apply(new RequestParameters({
    extra: {
      deleted: 'some',
      pirateFlag: 'cool',
    },
    foo: {
      bar: 'baz',
    },
    _deleted: 'only',
  }));

  expect(params.deleted).toBeUndefined();
  expect(params.toParameterObject().pirateFlag).toEqual('cool');
  expect(params.foo).toBeUndefined();
});
