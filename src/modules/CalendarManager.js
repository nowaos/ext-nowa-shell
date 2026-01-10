// SPDX-FileCopyrightText: Nowa Shell Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import { Logger } from '../services/Logger.js'
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
  #dateMenuService = null

  constructor (settings, main) {
    this.#settings = settings
    this.#main = main
    this.#dateMenuService = new DateMenuService(this.#main)
  }

  get #name () {
    return this.constructor.name
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

    this.#dateMenuService.enable()
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

    this.#dateMenuService.disable()
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

  #hideClocks (enable) {
    if (enable) {
      this.clocksItem._nowaOriginalShow = this.clocksItem.show
      this.clocksItem.show = () => {
        console.log(this.#name, 'Disabled by Nowa Shell')
      }
      this.clocksItem.hide()

      return
    }

    this.clocksItem.show = this.clocksItem._nowaOriginalShow
    this.clocksItem.show()
  }

  #hideWeater (enable) {
    if (enable) {
      this.weatherItem._nowaOriginalShow = this.weatherItem.show
      this.weatherItem.show = () => {
        console.debug(this.#name, 'Disabled by Nowa Shell')
      }
      this.weatherItem.hide()

      return
    }

    this.weatherItem.show = this.weatherItem._nowaOriginalShow
    this.weatherItem.show()
  }

  #hideMessageList (enable) {
    if (enable) {
      this.messageList._nowaOriginalShow = this.messageList.show
      this.messageList.show = () => {
        console.debug(this.#name, 'Disabled by Nowa Shell')
      }
      this.messageList.hide()

      return
    }

    this.messageList.show = this.messageList._nowaOriginalShow
    this.messageList.show()
  }
}
