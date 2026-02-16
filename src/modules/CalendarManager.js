import BaseModule from './_BaseModule.js'

import DateMenuService from '../services/DateMenuService.js'

/**
 * CalendarManager - Manages calendar minification features
 *
 * Handles hiding/showing World Clocks and Weather sections
 */
export class CalendarManager extends BaseModule {
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

    this.#hideMessageList(true)
    this.#hideClocks(isHideClocks)
    this.#hideWeater(isHideWeather)

    this.#dateMenuService.enable()
  }

  /**
   * Disable calendar management and restore original state
   */
  disable () {
    this.signalManager.disconnectAll()
    this.#hideClocks(false)
    this.#hideWeater(false)
    this.#hideMessageList(false)

    this.#dateMenuService.disable()
  }

  #hideClocks (enabled) {
    if (enabled) {
      this.clocksItem.add_style_class_name('calendar-widgets-hidden')
    } else {
      this.clocksItem.remove_style_class_name('calendar-widgets-hidden')
    }
  }

  #hideWeater (enabled) {
    if (enabled) {
      this.weatherItem.add_style_class_name('calendar-widgets-hidden')
    } else {
      this.weatherItem.remove_style_class_name('calendar-widgets-hidden')
    }
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
