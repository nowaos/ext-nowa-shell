// SPDX-FileCopyrightText: Nowa Shell Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import { Logger } from '../services/Logger.js'
import Clutter from 'gi://Clutter'
import St from 'gi://St'
import Gio from 'gi://Gio'

/**
 * CalendarManager - Manages calendar minification features
 *
 * Handles hiding/showing World Clocks and Weather sections
 */
export class CalendarManager {
  #settings
  #main
  #extension
  #signalIds = []
  #originals = {}
  #monthLabelClickId = null
  #stylesheetLoaded = false

  constructor(settings, main, extension) {
    this.#settings = settings
    this.#main = main
    this.#extension = extension
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
    this.#unloadStylesheet()
    this.#showWorldClocks()
    this.#removeMonthLabelClick()
  }

  /**
   * Apply minify calendar setting
   */
  #applyMinifyCalendar() {
    const minify = this.#settings.get_boolean('minify-calendar')

    if (minify) {
      Logger.log('CalendarManager: Minifying calendar')
      this.#loadStylesheet()
      this.#hideWorldClocks()
      this.#addMonthLabelClick()
    } else {
      Logger.log('CalendarManager: Restoring calendar')
      this.#unloadStylesheet()
      this.#showWorldClocks()
      this.#removeMonthLabelClick()
    }
  }

  /**
   * Load minified calendar stylesheet
   */
  #loadStylesheet() {
    if (this.#stylesheetLoaded) {
      return
    }

    try {
      const stylesheetPath = `${this.#extension.dir.get_path()}/assets/minified-calendar.css`
      const stylesheetFile = Gio.File.new_for_path(stylesheetPath)

      if (!stylesheetFile.query_exists(null)) {
        Logger.log(`CalendarManager: CSS file not found: ${stylesheetPath}`)
        return
      }

      const theme = St.ThemeContext.get_for_stage(global.stage).get_theme()
      theme.load_stylesheet(stylesheetFile)

      this.#stylesheetLoaded = true
      Logger.log('CalendarManager: Stylesheet loaded')
    } catch (e) {
      Logger.log(`CalendarManager: Error loading stylesheet: ${e}`)
    }
  }

  /**
   * Unload minified calendar stylesheet
   */
  #unloadStylesheet() {
    if (!this.#stylesheetLoaded) {
      return
    }

    try {
      const stylesheetPath = `${this.#extension.dir.get_path()}/assets/minified-calendar.css`
      const stylesheetFile = Gio.File.new_for_path(stylesheetPath)
      const theme = St.ThemeContext.get_for_stage(global.stage).get_theme()

      theme.unload_stylesheet(stylesheetFile)
      this.#stylesheetLoaded = false
      Logger.log('CalendarManager: Stylesheet unloaded')
    } catch (e) {
      Logger.log(`CalendarManager: Error unloading stylesheet: ${e}`)
    }
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

  /**
   * Add click event to month label to return to today
   */
  #addMonthLabelClick() {
    const dateMenu = this.#main.panel.statusArea.dateMenu
    if (!dateMenu || !dateMenu._calendar) {
      Logger.log('CalendarManager: calendar not found')
      return
    }

    const calendar = dateMenu._calendar
    const monthLabel = calendar._monthLabel

    if (!monthLabel) {
      Logger.log('CalendarManager: monthLabel not found')
      return
    }

    // Make it reactive
    monthLabel.reactive = true

    // Add click handler
    this.#monthLabelClickId = monthLabel.connect('button-press-event', () => {
      Logger.log('CalendarManager: Month label clicked - going to today')
      // Set calendar to today's date
      const today = new Date()
      calendar.setDate(today)
      return Clutter.EVENT_STOP
    })

    Logger.log('CalendarManager: Month label click enabled')
  }

  /**
   * Remove click event from month label
   */
  #removeMonthLabelClick() {
    if (!this.#monthLabelClickId) {
      return
    }

    const dateMenu = this.#main.panel.statusArea.dateMenu
    if (!dateMenu || !dateMenu._calendar) {
      return
    }

    const monthLabel = dateMenu._calendar._monthLabel
    if (monthLabel) {
      monthLabel.disconnect(this.#monthLabelClickId)
      monthLabel.reactive = false
    }

    this.#monthLabelClickId = null
    Logger.log('CalendarManager: Month label click disabled')
  }
}
