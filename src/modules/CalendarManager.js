// SPDX-FileCopyrightText: Nowa Shell Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import { Logger } from '../services/Logger.js'
import { CustomCalendarService } from '../services/CustomCalendarService.js'
import { DateMenuService } from '../services/DateMenuService.js'

/**
 * CalendarManager - Manages calendar minification features
 *
 * Handles hiding/showing World Clocks and Weather sections
 */
export class CalendarManager {
  #settings
  #main
  #signalIds = []
  #customCalendar = null
  #dateMenuService = null

  constructor (settings, main) {
    this.#settings = settings
    this.#main = main
    this.#customCalendar = new CustomCalendarService(this.#main)
    this.#dateMenuService = new DateMenuService(this.#main)
  }

  get dateMenu () {
    return this.#main.panel.statusArea.dateMenu
  }

  get messageList () {
    return this.dateMenu._messageList
  }

  get todayButton () {
    return this.dateMenu._date
  }

  get clocksItem () {
    return this.dateMenu._clocksItem
  }

  get weatherItem () {
    return this.dateMenu._weatherItem
  }

  /**
   * Enable calendar management
   */
  enable () {
    const isHideClocks = this.#settings.get_boolean('hide-cal-clocks')
    const isHideWeather = this.#settings.get_boolean('hide-cal-weather')

    this.#listenEvents()

    setTimeout(() => {
      this.#hideMessageList(true)
      this.#hideClocks(isHideClocks)
      this.#hideWeater(isHideWeather)
    }, 200)

    this.#dateMenuService.reorder()
    this.#customCalendar.onToday(() => this.todayButton.emit('clicked', this.todayButton))
    this.#customCalendar.enable()
  }

  /**
   * Disable calendar management and restore original state
   */
  disable () {
    Logger.log('CalendarManager: Disabling')

    this.#unlistenEvents()
    this.#hideClocks(false)
    this.#hideWeater(false)
    this.#hideMessageList(false)

    this.#dateMenuService.undoChanges()
    this.#customCalendar.disable()
  }

  #listenEvents () {
    this.#signalIds.push(
      this.#settings.connect('changed::hide-cal-clocks', () => {
        const enabled = this.#settings.get_boolean('hide-cal-clocks')

        this.#hideClocks(enabled)
      })
    )

    this.#signalIds.push(
      this.#settings.connect('changed::hide-cal-weather', () => {
        const enabled = this.#settings.get_boolean('hide-cal-weather')

        this.#hideWeater(enabled)
      })
    )
  }

  #unlistenEvents () {
    this.#signalIds.forEach(id => this.#settings.disconnect(id))
    this.#signalIds = []
  }

  /**
   * Apply minify calendar setting
   */
  #hideClocks (enable) {
    if (enable) return this.clocksItem?.hide()

    this.clocksItem?.show()
  }

  /**
   * Apply minify calendar setting
   */
  #hideWeater (enable) {
    if (enable) return this.weatherItem?.hide()

    this.weatherItem?.show()
  }

  #hideMessageList (enable) {
    if (enable) return this.messageList?.hide()

    this.messageList?.show()
  }
}
