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

import {Enum} from '../../src/enums';

test('Enum should be numeric by default', () => {
  const values = ['RED', 'BLACK', 'GREEN', 'WHITE', 'BLUE'];
  const Colors = new Enum(values);

  expect.assertions(values.length + 1);

  for (const color of values) {
    expect(typeof Colors[color]).toEqual('number');
  }

  expect(Colors.keys()).toEqual(values);
});

test('Enum should accept dictionaries', () => {
  const ANSWER = new Enum({
    YES: true,
    NO: false,
    // Passing functions as values will turn them into getters
    // Getter results will appear in ::values
    MAYBE: () => !Math.round(Math.random()),
  });

  expect(ANSWER.YES).toEqual(true);
  expect(ANSWER.NO).toEqual(false);

  let aggr = [];

  for (let i = 0; i < 100; i++) {
    aggr.push(ANSWER.MAYBE);
  }

  aggr = aggr.filter((v, i, s) => s.indexOf(v) === i).sort();

  expect(aggr).toEqual([false, true]);
});

test('Enum::values should only return unique values', () => {
  const Test = new Enum({
    ME: 'CRESCENT_FRESH',
    YOU: 'CRESCENT_FRESH',
    RUDE_DUDE: 'NOT_CRESCENT_FRESH',
  });

  expect(Test.keys()).toHaveLength(3);
  expect(Test.values()).toHaveLength(2);

  expect(Test.values()).toEqual(['CRESCENT_FRESH', 'NOT_CRESCENT_FRESH']);
});

test('Enum should be able to automatically map values', () => {
  const FontStyles = new Enum(['italic', 'bold', 'underline', 'regular'], true);

  expect(Object.assign({}, FontStyles)).toEqual({
    ITALIC: 'italic',
    BOLD: 'bold',
    UNDERLINE: 'underline',
    REGULAR: 'regular',
  });
});

test('Enum should throw exception if values can not be mapped', () => {
  expect(() => {
    new Enum('example', true);
  }).toThrow(TypeError);
});
