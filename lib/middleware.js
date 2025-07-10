/*!
 * Copyright (C) 2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {asyncHandler} from '@bedrock/express';
import {httpClient} from '@digitalbazaar/http-client';
import {namespace} from './config.js';

// Constants
const {config, util: {BedrockError}} = bedrock;

// Verify site recaptcha token
export function siteVerify({
  query = 'recaptcha-token',
  header = 'x-recaptcha-token'
} = {}) {
  return asyncHandler(async (req, res, next) => {
    const {url, secretKey, enabled} = config[namespace];
    // Pass middleware if disabled
    if(!enabled) {
      next();
      return;
    }
    const recaptchaToken =
      req.headers[header] || req.query[query];
    if(!recaptchaToken) {
      throw new BedrockError('reCAPTCHA token is missing', {
        name: 'NotFoundError',
        details: {httpStatusCode: 404, public: true},
      });
    }
    try {
      const recaptchaParams = new URLSearchParams({
        secret: secretKey,
        response: recaptchaToken
      });
      const response = await httpClient.post(url, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: recaptchaParams
      });
      const {data} = response;
      // if token is unacceptable, throw
      if(!(data?.success && data?.score >= 0.5)) {
        throw new BedrockError('reCAPTCHA verification failed', {
          name: 'NotAllowedError',
          details: {httpStatusCode: 403, public: true, score: data?.score}
        });
      }
      // proceed to the next middleware
      next();
    } catch(cause) {
      if(cause instanceof BedrockError) {
        throw cause;
      }
      throw new BedrockError('reCAPTCHA verification error ' + cause.message, {
        name: 'OperationError',
        details: {httpStatusCode: 500, public: true},
        cause,
      });
    }
  });
}
