/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
const {config} = bedrock;

export const namespace = 'recaptcha';
const cfg = config[namespace] = {};

const basePath = '/recaptcha';
cfg.routes = {
  basePath
};
cfg.enabled = false;
cfg.url = 'https://www.google.com/recaptcha/api/siteverify';
cfg.siteKey = '';
cfg.secretKey = '';
