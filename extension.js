// SPDX-FileCopyrightText: Nowa Shell Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'
import * as Main from 'resource:///org/gnome/shell/ui/main.js'

import { Logger } from './src/services/Logger.js'
import { CalendarManager } from './src/modules/CalendarManager.js'
import { PowerButtonManager } from './src/modules/PowerButtonManager.js'

/**
 * Nowa Shell - GNOME Shell interface customizations
 *
 * Features:
 * - Modern rounded design for Quick Settings
 * - Calendar styling
 * - System buttons styling
 * - Calendar minification (hide World Clocks and Weather)
 * - Custom Power button with direct actions
 */
export default class NowaShellExtension extends Extension {
  #calendarManager = null
  #powerButtonManager = null

  enable () {
    Logger.log('Nowa Shell: === Extension Enabled ===')

    const settings = this.getSettings()

    // Initialize Calendar Manager
    this.#calendarManager = new CalendarManager(settings, Main, this)
    this.#calendarManager.enable()

    // Initialize Power Button Manager
    this.#powerButtonManager = new PowerButtonManager(Main)
    this.#powerButtonManager.enable()
  }

  disable () {
    Logger.log('Nowa Shell: === Extension Disabled ===')

    // Disable Power Button Manager
    if (this.#powerButtonManager) {
      this.#powerButtonManager.disable()
      this.#powerButtonManager = null
    }

    // Disable Calendar Manager
    if (this.#calendarManager) {
      this.#calendarManager.disable()
      this.#calendarManager = null
    }
  }
}
