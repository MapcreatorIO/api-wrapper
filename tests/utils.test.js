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
import {fnv32b, hashObject} from '../src/utils/hash';
import {isNode} from '../src/utils/node';
import {getTypeName, isParentOf} from '../src/utils/reflection';
import {encodeQueryString} from '../src/utils/requests';
import Singleton from '../src/utils/Singleton';
import StaticClass from '../src/utils/StaticClass';
import Uuid from '../src/utils/uuid';

test('fnv32b hashes properly', t => {
  t.is(fnv32b('MapCreator'), 'f6a48d4e');
});

test('objects are correctly hashed', t => {
  const obj1 = {c: 8, b: [{z: 6, y: 5, x: 4}, 7], a: 3};
  const obj2 = {a: 3, c: 8, b: [{z: 6, y: 5, x: 4}, 7]};

  t.is(hashObject(obj1), hashObject(obj2));
});

test('nodejs is correctly detected', t => {
  t.true(isNode());
});

test('isParentOf correctly detects inheritance', t => {
  class A {
  }

  class B extends A {
  }

  class C extends B {
  }

  t.true(isParentOf(A, C));
  t.true(isParentOf(A, B));
  t.true(isParentOf(B, C));
  t.true(isParentOf(C, C));
  t.false(isParentOf(B, A));
  t.false(isParentOf(C, A));
  t.false(isParentOf(C, B));
});

test('getTypeName correctly returns the name', t => {
  class FooBar {
  }

  t.is(getTypeName(FooBar), 'FooBar');
  t.is(getTypeName(new FooBar()), 'FooBar');
});

test('encodeQueryString works correctly', t => {
  const data = {
    foo: 'bar',
    beer: '🍻',
    obj: {hello: 'world!'},
    arr: [1, 2, 3, 4],
  };

  const query = 'arr[0]=1&arr[1]=2&arr[2]=3&arr[3]=4&beer=%F0%9F%8D%BB&foo=bar&obj[hello]=world!';

  t.is(encodeQueryString(data), query);
});

test('singleton returns same instance', t => {
  class Foo extends Singleton {

  }

  t.is(new Foo(), new Foo());

  const foo = new Foo();

  foo.bar = Math.random();

  t.is((new Foo()).bar, foo.bar);
});


test('static class can\'t be Instantiated', t => {
  class Foo extends StaticClass {

  }

  t.throws(() => new Foo());
});

test('uuid4 returns a new random uuid', t => {
  const iterations = 10000;
  const data = [];

  for (let i = 0; i < iterations; i++) {
    data.push(Uuid.uuid4());
  }

  const duplicates = data.reduce((out, id, i) => {
    if (data.findIndex(z => z === id) !== i) {
      out.push(id);
    }

    return out;
  }, []);

  t.deepEqual(duplicates, []);
});

test('uuid0 returns a null uuid', t => {
  t.is(Uuid.nil(), '0000000-0000-0000-0000-000000000000');
});
