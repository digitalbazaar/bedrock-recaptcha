/*!
 * Copyright (C) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import {config, loggers} from '@bedrock/core';

export const logger = loggers.get('app').child(config.namespace);
