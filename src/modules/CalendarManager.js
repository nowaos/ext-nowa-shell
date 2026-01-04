// SPDX-FileCopyrightText: Nowa Shell Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import { Logger } from '../services/Logger.js'

/**
 * CalendarManager - Manages calendar minification features
 *
 * Handles hiding/showing World Clocks and Weather sections
 */
export class CalendarManager {
  #settings
  #main
  #signalIds = []
  #originals = {}

  constructor(settings, main) {
    this.#settings = settings
    this.#main = main
  }

  /**
   * Enable calendar management
   */
  enable() {
    Logger.log('CalendarManager: Enabling')

    // Listen for settings changes
    const signalId = this.#settings.connect('changed::minify-calendar', () => {
      this.#applyMinifyCalendar()
    })
    this.#signalIds.push(signalId)

    // Apply initial state
    this.#applyMinifyCalendar()
  }

  /**
   * Disable calendar management and restore original state
   */
  disable() {
    Logger.log('CalendarManager: Disabling')

    // Disconnect all signals
    this.#signalIds.forEach(id => this.#settings.disconnect(id))
    this.#signalIds = []

    // Restore original states
    this.#showWeather()
    this.#showWorldClocks()
  }

  /**
   * Apply minify calendar setting
   */
  #applyMinifyCalendar() {
    const minify = this.#settings.get_boolean('minify-calendar')

    if (minify) {
      Logger.log('CalendarManager: Minifying calendar')
      this.#hideWeather()
      this.#hideWorldClocks()
    } else {
      Logger.log('CalendarManager: Restoring calendar')
      this.#showWeather()
      this.#showWorldClocks()
    }
  }

  /**
   * Hide weather section using CSS class
   */
  #hideWeather() {
    this.#main.layoutManager.uiGroup.add_style_class_name('nowa-shell-no-weather')
  }

  /**
   * Show weather section
   */
  #showWeather() {
    this.#main.layoutManager.uiGroup.remove_style_class_name('nowa-shell-no-weather')
  }

  /**
   * Hide world clocks section by overriding the sync method
   */
  #hideWorldClocks() {
    const dateMenu = this.#main.panel.statusArea.dateMenu
    if (!dateMenu || !dateMenu._clocksItem) {
      Logger.log('CalendarManager: clocksItem not found')
      return
    }

    const clocksItem = dateMenu._clocksItem

    // Store original _sync method if not already stored
    if (!this.#originals.clocksItemSync) {
      this.#originals.clocksItemSync = clocksItem._sync
    }

    // Override _sync to hide the item
    clocksItem._sync = function() {
      this.visible = false
    }

    // Apply the sync
    clocksItem._sync()
  }

  /**
   * Show world clocks section by restoring original sync method
   */
  #showWorldClocks() {
    const dateMenu = this.#main.panel.statusArea.dateMenu
    if (!dateMenu || !dateMenu._clocksItem) {
      return
    }

    const clocksItem = dateMenu._clocksItem

    // Restore original _sync if we have it
    if (this.#originals.clocksItemSync) {
      clocksItem._sync = this.#originals.clocksItemSync
      delete this.#originals.clocksItemSync
      clocksItem._sync()
    }
  }
}
