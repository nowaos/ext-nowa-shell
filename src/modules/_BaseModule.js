import * as Main from 'resource:///org/gnome/shell/ui/main.js'

import Logger from '../services/Logger.js'
import SignalManager from '../services/SignalManager.js'

/**
 * Base class for all Nowa Desktop modules
 */
export default class BaseModule {
  constructor (settings, extensionDir) {
    this.main = Main
    this.settings = settings
    this.dir = extensionDir
    this.signalManager = new SignalManager()
  }

  get name () {
    return this.constructor.name
  }

  log (message) {
    Logger.debug(this.name, message)
  }

  warn (message, error) {
    Logger.error(message, error)
  }
}
