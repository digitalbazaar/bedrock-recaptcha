/*
 * Copyright (c) 2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {mockRecaptcha, next, req} from './mock.js';
import {strict as assert} from 'node:assert';
import nock from 'nock';
import {recaptcha} from '@bedrock/recaptcha';
import {setTimeout} from 'node:timers/promises';

const {util: {BedrockError}} = bedrock;

nock.disableNetConnect();

describe('middleware', () => {
  const mw = recaptcha.siteVerify();
  beforeEach(() => {
    next.resetHistory();
    bedrock.config.recaptcha.enabled = true;
    mockRecaptcha();
  }),
  it('should proceed to next middleware when disabled', async () => {
    bedrock.config.recaptcha.enabled = false;
    await mw(req, {}, next);
    assert.ok(next.calledOnce);
    assert.ok(!next.threw());
  });
  it('should succeed and proceed to next middleware', async () => {
    await mw(req, {}, next);
    assert.ok(next.calledOnce);
    assert.ok(!next.threw());
  });
  it('should throw an error when recaptcha response indicates failure',
    async () => {
      nock.cleanAll();
      mockRecaptcha({success: false});
      await mw(req, {}, next);
      await _tick();
      assert.ok(next.calledOnce);
      const err = _getErr();
      assert.ok(err instanceof BedrockError);
      assert.equal(err.name, 'NotAllowedError');
    }
  );
  it('should throw an error when score is below configured threshold',
    async () => {
      nock.cleanAll();
      mockRecaptcha({score: 0});
      await mw(req, {}, next);
      await _tick();
      assert.ok(next.calledOnce);
      const err = _getErr();
      assert.ok(err instanceof BedrockError);
      assert.equal(err.name, 'NotAllowedError');
    }
  );
  it('should throw an error when token is missing', async () => {
    await mw({}, {}, next);
    await _tick();
    assert.ok(next.calledOnce);
    const err = _getErr();
    assert.ok(err instanceof BedrockError);
    assert.equal(err.name, 'NotFoundError');
  });
});

// force next tick so that 'next' fn evaluates
async function _tick() {
  return setTimeout(0);
}

// get args passed to first call of spy, and then get first arg from that
function _getErr() {
  return next.args[0][0];
}
