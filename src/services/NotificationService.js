// SPDX-FileCopyrightText: Nowa Shell Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import { Logger } from './Logger.js'
import * as MessageList from 'resource:///org/gnome/shell/ui/messageList.js'
import Gio from 'gi://Gio'
import GdkPixbuf from 'gi://GdkPixbuf'

/**
 * NotificationService - Manages system notifications
 *
 * Provides access to GNOME Shell's notification system using MessageList
 */
export class NotificationService {
  #main
  #messageList = null
  #settings
  #signalIds = []

  constructor (main) {
    this.#main = main
    this.#settings = new Gio.Settings({ schema: 'org.gnome.desktop.notifications' })
  }

  get #name () {
    return this.constructor.name
  }

  /**
   * Get the MessageList widget
   * This is what you add to your UI
   *
   * @returns {MessageList.MessageView}
   */
  getMessageList () {
    return this.#messageList
  }

  /**
   * Get Do Not Disturb status
   *
   * @returns {boolean}
   */
  getDnd () {
    return !this.#settings.get_boolean('show-banners')
  }

  /**
   * Initialize the service and create MessageList
   */
  init () {
    try {
      // Create our own independent MessageList.MessageView
      // This creates a completely new notification list, separate from the calendar
      this.#messageList = new MessageList.MessageView()

      return true
    } catch (e) {
      Logger.debug(this.#name, `Error initializing: ${e}`)
      Logger.debug(this.#name, `Stack: ${e.stack}`)

      return false
    }
  }

  /**
   * Cleanup the service
   */
  destroy () {
    this.#signalIds.forEach(id => {
      try { this.#settings.disconnect(id) } catch {}
    })

    this.#signalIds = []

    if (this.#messageList) {
      try {
        this.#messageList.destroy()
      } catch (e) {
        Logger.debug(this.#name, `Error destroying MessageList: ${e}`)
      }
    }

    this.#messageList = null
  }

  /**
   * Connect to notification events
   *
   * @param {string} signal - Signal name ('notify::empty', 'notify::can-clear', etc)
   * @param {Function} callback - Callback function
   * @param {object} owner - Owner object for connectObject
   */
  connect (signal, callback, owner) {
    if (!this.#messageList) {
      Logger.log('NotificationService: Cannot connect - not initialized')

      return
    }

    try {
      this.#messageList.connectObject(signal, callback, owner)
    } catch (e) {
      Logger.log(`NotificationService: Error connecting to signal: ${e}`)
    }
  }

  onChangeDnd (callback, firstSync = true) {
    if (firstSync) callback(this.getDnd())

    const id = this.#settings.connect('changed::show-banners', () => callback(this.getDnd()))

    this.#signalIds.push(id)
  }

  /**
   * Check if the notification list is empty
   *
   * @returns {boolean}
   */
  isEmpty () {
    if (!this.#messageList) {
      return true
    }
    return this.#messageList.empty
  }

  /**
   * Check if notifications can be cleared
   *
   * @returns {boolean}
   */
  canClear () {
    if (!this.#messageList) return false

    return this.#messageList.canClear
  }

  /**
   * Clear all notifications
   */
  clearAll () {
    if (!this.#messageList) {
      Logger.debug(this.#name, 'Cannot clear - not initialized')

      return
    }

    try {
      this.#messageList.clear()
    } catch (e) {
      Logger.debug(this.#name, `Error clearing notifications: ${e}`)
    }
  }

  /**
   * Toggle Do Not Disturb
   */
  toggleDnd () {
    const isBannersShown = this.#settings.get_boolean('show-banners')

    this.#settings.set_boolean('show-banners', !isBannersShown)
  }
}
