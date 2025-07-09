/*
 * Copyright (C) 2024-2025 Digital Bazaar, Inc. All rights reserved..
 */
import {config} from '@bedrock/core';
import path from 'node:path';

// MongoDB
config.mongodb.name = 'bedrock_module_template_http_test';
config.mongodb.dropCollections.onInit = true;
config.mongodb.dropCollections.collections = [];

config.mocha.tests.push(path.join(import.meta.dirname, 'mocha'));

// allow self-signed certs in test framework
config['https-agent'].rejectUnauthorized = false;
