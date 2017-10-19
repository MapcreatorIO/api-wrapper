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
import RequestParameters from '../src/RequestParameters';
import {DeletedState} from '../src/enums';

RequestParameters.resetDefaults();
const cleanParams = new RequestParameters();

test('RequestParameters should use defaults', t => {
  t.plan(RequestParameters.keys().length);

  const params = new RequestParameters();

  RequestParameters.keys().forEach(key => {
    t.log(`Testing ${key}`);
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

  t.is(params.token(), '359dbd24'); // Default token

  // Page and perPage shouldn't affect the token
  params.page = Math.round(Math.random() * 100000);
  params.perPage = Math.round(Math.random() * 50);

  t.is(params.token(), '359dbd24');

  params.sort = 'quick,-brown,fox';

  t.is(params.token(), '3d940592');
});

const validationTests = {
  page: {
    good: [-1, 1, 2, 3, 4, 100],
    bad: [new Date(), {}, [], '1'],
  },
  perPage: {
    good: [[-1, 1], 1, 2, 3, 4, [100, 50]],
    bad: [new Date(), {}, [], '1'],
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
      t.log(`Testing "${typeof input}" = "${input}"`);
      t.throws(() => {
        params[key] = input;
      });
    });
  });
}
