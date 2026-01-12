// SPDX-FileCopyrightText: Nowa Desktop Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import * as Main from 'resource:///org/gnome/shell/ui/main.js'

import { Logger } from '../services/Logger.js'

/**
 * Base class for all Nowa Desktop modules
 */
export class _BaseModule {
  constructor (settings, extensionDir) {
    this.settings = settings
    this.dir = extensionDir
  }

  get name () {
    return this.constructor.name
  }

  get main () {
    return Main
  }

  log (message) {
    Logger.debug(this.name, message)
  }

  warn (message) {
    Logger.error(this.name, message)
  }
}
