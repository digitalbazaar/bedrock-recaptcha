/*!
 * Copyright (C) 2025 Digital Bazaar, Inc. All rights reserved.
 */
import {loggers} from '@bedrock/core';
import {namespace} from './config.js';

export const logger = loggers.get('app').child(namespace);
