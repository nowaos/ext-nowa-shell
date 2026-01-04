// SPDX-FileCopyrightText: Nowa Shell Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'
import * as Main from 'resource:///org/gnome/shell/ui/main.js'

import { Logger } from './src/services/Logger.js'
import { CalendarManager } from './src/modules/CalendarManager.js'

/**
 * Nowa Shell - GNOME Shell interface customizations
 *
 * Features:
 * - Modern rounded design for Quick Settings
 * - Calendar styling
 * - System buttons styling
 * - Calendar minification (hide World Clocks and Weather)
 */
export default class NowaShellExtension extends Extension {
  #calendarManager = null

  enable () {
    Logger.log('Nowa Shell: === Extension Enabled ===')

    const settings = this.getSettings()

    // Initialize Calendar Manager
    this.#calendarManager = new CalendarManager(settings, Main)
    this.#calendarManager.enable()
  }

  disable () {
    Logger.log('Nowa Shell: === Extension Disabled ===')

    // Disable Calendar Manager
    if (this.#calendarManager) {
      this.#calendarManager.disable()
      this.#calendarManager = null
    }
  }
}
