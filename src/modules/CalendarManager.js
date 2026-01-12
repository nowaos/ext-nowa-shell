// SPDX-FileCopyrightText: Nowa Shell Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import { _BaseModule } from './_BaseModule.js'
import { Logger } from '../services/Logger.js'
import { DateMenuService } from '../services/DateMenuService.js'

/**
 * CalendarManager - Manages calendar minification features
 *
 * Handles hiding/showing World Clocks and Weather sections
 */
export class CalendarManager extends _BaseModule {
  #dateMenuService = null

  constructor (...args) {
    super(...args)

    this.#dateMenuService = new DateMenuService(this.main)

    this.dateMenu = this.main.panel.statusArea.dateMenu
    this.messageList = this.dateMenu._messageList
    this.todayButton = this.dateMenu._date
    this.clocksItem = this.dateMenu._clocksItem
    this.weatherItem = this.dateMenu._weatherItem
  }

  get #name () {
    return this.constructor.name
  }

  /**
   * Enable calendar management
   */
  enable () {
    const isHideClocks = this.settings.get_boolean('hide-cal-clocks')
    const isHideWeather = this.settings.get_boolean('hide-cal-weather')

    this.signalManager.connectOn(this.settings, 'changed::hide-cal-clocks', () => {
      const enabled = this.settings.get_boolean('hide-cal-clocks')

      this.#hideClocks(enabled)
    })

    this.signalManager.connectOn(this.settings, 'changed::hide-cal-weather', () => {
      const enabled = this.settings.get_boolean('hide-cal-weather')

      this.#hideWeater(enabled)
    })

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

    this.signalManager.disconnectAll()
    this.#hideClocks(false)
    this.#hideWeater(false)
    this.#hideMessageList(false)

    this.#dateMenuService.disable()
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

    delete this.weatherItem._nowaOriginalShow
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

    delete this.messageList._nowaOriginalShow
  }
}
