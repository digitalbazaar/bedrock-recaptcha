/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {asyncHandler} from '@bedrock/express';
import {namespace} from './config.js';

bedrock.events.on('bedrock-express.configure.routes', app => {
  const {config} = bedrock;
  const {routes} = config[namespace];

  app.get(`${routes.basePath}/config`, asyncHandler(async (req, res) => {
    const cfg = config[namespace];
    res.json({
      recaptcha: {
        enabled: cfg.enabled,
        siteKey: cfg.siteKey
      }
    });
  }));
});
