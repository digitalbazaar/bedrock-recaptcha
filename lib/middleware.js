/*!
 * Copyright (C) 2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {asyncHandler} from '@bedrock/express';
import {httpClient} from '@digitalbazaar/http-client';
import {logger} from './logger.js';
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
      const recaptchaParams = new URLSearchParams();
      recaptchaParams.append('secret', secretKey);
      recaptchaParams.append('response', recaptchaToken);
      const response = await httpClient.post(url, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: recaptchaParams
      });
      logger.debug('reCAPTCHA verification response', {
        response: JSON.stringify(response)
      });
      const {data} = response;
      // If token is valid, proceed to the next middleware or route handler
      if(data?.success && data?.score >= 0.5) {
        next();
      } else {
        throw new BedrockError('reCAPTCHA verification failed', {
          name: 'Forbidden',
          details: {httpStatusCode: 403, public: true, score: data?.score},
        });
      }
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
