/*!
 * Copyright (C) 2025 Digital Bazaar, Inc. All rights reserved..
 */
import * as bedrock from '@bedrock/core';
import * as recaptcha from './middleware.js';
import {namespace} from './config.js';
import '@bedrock/express';
import './http.js';

export {recaptcha};

bedrock.events.on('bedrock.init', () => {
  const {config, util: {BedrockError}} = bedrock;
  const {enabled, secretKey} = config[namespace];

  if(enabled && !secretKey) {
    throw new BedrockError('reCAPTCHA enabled but missing "secretKey"');
  }
});
