import { Logger } from './Logger.js'
import * as MessageList from 'resource:///org/gnome/shell/ui/messageList.js'
import Gio from 'gi://Gio'

/**
 * NotificationService - Manages system notifications
 *
 * Provides access to GNOME Shell's notification system using MessageList
 */
export class NotificationService {
  #messageList = null
  #messagesCount = 0
  #settings
  #signalIds = { list: [], settings: [] }
  #callbacks = { onUpdate: [], onMuteChange: [] }

  constructor () {
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
   * Initialize the service and create MessageList
   */
  init () {
    try {
      let sid

      // Create our own independent MessageList.MessageView
      // This creates a completely new notification list, separate from the calendar
      this.#messageList = new MessageList.MessageView()

      sid = this.#settings.connect('changed::show-banners', () => {
        this.#callbacks.onMuteChange.forEach(fn => fn(this.isMuted()))
      })

      this.#signalIds.settings.push(sid)

      sid = this.#messageList.connect('child-added', (_list, child) => {
        const message = child.get_child()

        if (message._player) {
          child._isMedia = true

          return
        }

        this.#messagesCount += 1
        this.#callbacks.onUpdate.forEach(fn => fn())
      })

      this.#signalIds.list.push(sid)

      sid = this.#messageList.connect('child-removed', (_list, child) => {
        if (child._isMedia) return

        this.#messagesCount -= 1
        this.#callbacks.onUpdate.forEach(fn => fn())
      })

      this.#signalIds.list.push(sid)

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
    this.#signalIds.list.forEach(id => {
      try { this.#messageList.disconnect(id) } catch {}
    })

    this.#signalIds.settings.forEach(id => {
      try { this.#settings.disconnect(id) } catch {}
    })

    this.#messagesCount = 0
    this.#signalIds.list = []
    this.#signalIds.settings = []
    this.#callbacks.onUpdate = []
    this.#callbacks.onChangeMute = []

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

  onChangeMute (callback, firstSync = true) {
    if (firstSync) callback()

    this.#callbacks.onMuteChange.push(callback)
  }

  onListChanged (callback, firstSync = true) {
    if (firstSync) callback()

    this.#callbacks.onUpdate.push(callback)
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
   * Get Do Not Disturb status
   *
   * @returns {boolean}
   */
  isMuted () {
    return !this.#settings.get_boolean('show-banners')
  }

  /**
   * Check if the notification list is empty
   *
   * @returns {boolean}
   */
  messagesCount () {
    return this.#messagesCount
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
  toggleMute () {
    const isBannersShown = this.#settings.get_boolean('show-banners')

    this.#settings.set_boolean('show-banners', !isBannersShown)
  }
}
