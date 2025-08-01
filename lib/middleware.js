/*!
 * Copyright (c) 2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {agent} from '@bedrock/https-agent';
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
    const {url, secretKey, enabled, scoreThreshold} = config[namespace];
    // Pass middleware if disabled
    if(!enabled) {
      return next();
    }
    const recaptchaToken = req.headers?.[header] || req.query?.[query];
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
        agent,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: recaptchaParams
      });
      const {data} = response;
      const success = data?.success;
      const score = data?.score;
      // Fail if:
      //   – The response was unsuccessful,
      //   – a score wasn't returned, or
      //   – the score is less than the configured threshold.
      if(!(success && Number.isFinite(score) && score >= scoreThreshold)) {
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
        details: {httpStatusCode: 500, public: false},
        cause,
      });
    }
  });
}
