/*
 * Copyright (c) 2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import nock from 'nock';
import sinon from 'sinon';

const {config} = bedrock;
const url = new URL(config.recaptcha.url);
export const api = nock(url.origin);

export const req = {
  headers: {
    'x-recaptcha-token': 'token',
  },
  query: {
    'recaptcha-token': 'token'
  }
};

export function mockRecaptcha({code = 200, success = true, score = 1} = {}) {
  api.post(url.pathname).once().reply(code, {success, score});
}

export const next = sinon.spy();

