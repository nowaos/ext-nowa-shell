// SPDX-FileCopyrightText: Nowa Desktop Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import { Logger } from '../services/Logger.js'

/**
 * Base class for all Nowa Desktop modules
 */
export class _BaseModule {
  get name () {
    return this.constructor.name
  }

  log (message) {
    Logger.debug(this.name, message)
  }
}
