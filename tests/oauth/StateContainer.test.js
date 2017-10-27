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
import StateContainer from '../../src/oauth/StateContainer';

test.before(t => {
  StateContainer.clean();

  t.deepEqual(StateContainer.list(), {});
});

// We can just test everything in here
test('StateContainer validates tokens', t => {
  const token = StateContainer.generate();

  t.true(StateContainer.validate(token, false)); // Token shouldn't be purged
  t.true(StateContainer.validate(token)); // Token should be purged
  t.false(StateContainer.validate(token)); // Token should not be found anymore
});

test.serial('StateContainer should list all keys', t => {
  const tokens = [];

  StateContainer.clean();
  t.deepEqual(StateContainer.list(), {});

  for (let i = 0; i < 100; i++) {
    tokens.push(StateContainer.generate());
  }

  // This array should contain all unmatched tokens
  const out = Object
    .keys(StateContainer.list())
    .filter(x => !tokens.includes(x));

  t.deepEqual(out, []);

  StateContainer.clean();
  t.deepEqual(StateContainer.list(), {});
});


test.after('cleanup', t => {
  StateContainer.clean();

  t.deepEqual(StateContainer.list(), {});
});
