/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2017, MapCreator
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

import test from 'ava';
import {DeletedState} from '../../src/enums';
import RequestParameters from '../../src/RequestParameters';

RequestParameters.resetDefaults();
const cleanParams = new RequestParameters();

test('RequestParameters should use defaults', t => {
  t.plan(RequestParameters.keys().length);

  const params = new RequestParameters();

  RequestParameters.keys().forEach(key => {
    t.deepEqual(params[key], RequestParameters[key]);
  });
});


test.serial('RequestParameters should be able to reset defaults', t => {
  const newPage = Math.round(Math.random() * 100000);

  RequestParameters.page = newPage;
  t.is(RequestParameters.page, newPage);

  RequestParameters.resetDefaults();
  t.is(RequestParameters.page, 1);
});

test('RequestParameters can generate cache tokens', t => {
  const params = cleanParams.copy();

  t.is(params.token(), 'd243d801'); // Default token

  // Page and perPage shouldn't affect the token
  params.page = Math.round(Math.random() * 100000);
  params.perPage = Math.round(Math.random() * 50);

  t.is(params.token(), 'd243d801');

  params.sort = 'quick,-brown,fox';

  t.is(params.token(), 'a900b290');
});

const validationTests = {
  page: {
    good: [-1, 1, 2, 3, 4, 100],
    bad: [new Date(), {}, [], '1', 13.37],
  },
  perPage: {
    good: [[-1, 1], 1, 2, 3, 4, [100, 50]],
    bad: [new Date(), {}, [], '1', 13.37],
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
      [{a: [], b: '', c: null}, {b: ''}],
    ],
    bad: [
      {o: {}},
      {f: () => false},
      420,
      'Hello World!',
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
    good: [{}, {foo: 'bar'}],
    bad: ['', 123],
  },
};

for (const key of Object.keys(validationTests)) {
  test(`RequestParameters validation for ${key}`, t => {
    const params = cleanParams.copy();
    const target = validationTests[key];

    target.good.forEach(input => {
      if (input instanceof Array) {
        params[key] = input[0];
        t.deepEqual(params[key], input[1]);
      } else {
        params[key] = input;
        t.deepEqual(params[key], input);
      }
    });

    target.bad.forEach(input => {
      t.throws(() => {
        params[key] = input;
      });
    });
  });
}

test('issue #93', t => {
  const params = new RequestParameters({sort: '-name'});

  t.deepEqual(params.toObject().sort, ['-name']);
  t.is(params.encode(), 'deleted=none&page=1&per_page=12&sort=-name');
});

test('extra parameters overwrite others', t => {
  const params = new RequestParameters({
    deleted: 'none',
    extra: {
      deleted: 'some',
      pirateFlag: 'cool',
    },
  });

  t.is(params.toObject().deleted, 'none');
  t.is(params.toParameterObject().deleted, 'some');
  t.is(params.encode(), 'deleted=some&page=1&per_page=12&pirateFlag=cool&sort=');
});

test('encoded search keys must be snake_case', t => {
  const params = cleanParams.copy();

  params.search = {
    'fooBar,Baz': 'test',
  };

  t.is(params.encode(), 'deleted=none&page=1&per_page=12&search[foo_bar,baz]=test&sort='.replace(',', '%2C'));
});

test('null is properly encoded', t => {
  const params = cleanParams.copy();

  params.extra = {
    foo: null,
  };

  t.is(params.encode(), 'deleted=none&foo&page=1&per_page=12&sort='.replace(',', '%2C'));
});

test('RequestParameters can have properties applied to it', t => {
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

  t.is(params.deleted, 'none');
  t.is(params.toParameterObject().pirateFlag, 'cool');
  t.is(params.foo, undefined);
});
