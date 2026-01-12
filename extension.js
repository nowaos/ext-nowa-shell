// SPDX-FileCopyrightText: Nowa Shell Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'
import * as Main from 'resource:///org/gnome/shell/ui/main.js'

import { Logger } from './src/services/Logger.js'
import { CalendarManager } from './src/modules/CalendarManager.js'
import { PowerButtonManager } from './src/modules/PowerButtonManager.js'
import { NotificationsManager } from './src/modules/NotificationsManager.js'
import { RoundedScreen } from './src/modules/RoundedScreen.js'
import { ShellTweaks } from './src/modules/ShellTweaks.js'
import { ThemeScheduler } from './src/modules/ThemeScheduler.js'

/**
 * Nowa Shell - GNOME Shell interface customizations
 *
 * Features:
 * - Modern rounded design for Quick Settings
 * - Calendar styling
 * - System buttons styling
 * - Calendar minification (hide World Clocks and Weather)
 * - Custom Power button with direct actions
 * - Notification indicator with badge
 */
export default class NowaShellExtension extends Extension {
  #calendarManager
  #powerButtonManager
  #notificationsManager
  #roundedScreen
  #shellTweaks
  #themeScheduler

  enable () {
    const settings = this.getSettings()

    // Initialize Rounded Screen
    this.#roundedScreen = new RoundedScreen(this.dir)
    this.#roundedScreen.enable()

    // Initialize Shell Tweaks
    this.#shellTweaks = new ShellTweaks(settings)
    this.#shellTweaks.enable()

    // Initialize Calendar Manager
    this.#calendarManager = new CalendarManager(settings, Main)
    this.#calendarManager.enable()

    // Initialize Power Button Manager
    this.#powerButtonManager = new PowerButtonManager(settings, this.dir)
    this.#powerButtonManager.enable()

    // Initialize Notification Manager
    this.#notificationsManager = new NotificationsManager(Main)
    this.#notificationsManager.enable()

    // Initialize Theme Scheduler
    this.#themeScheduler = new ThemeScheduler(settings)
    this.#themeScheduler.enable()
  }

  disable () {
    // Disable Rounded Screen
    if (this.#roundedScreen) {
      this.#roundedScreen.disable()
      this.#roundedScreen = null
    }

    // Disable Shell Tweaks
    if (this.#shellTweaks) {
      this.#shellTweaks.disable()
      this.#shellTweaks = null
    }

    // Disable Notification Manager
    if (this.#notificationsManager) {
      this.#notificationsManager.disable()
      this.#notificationsManager = null
    }

    // Disable Power Button Manager
    if (this.#powerButtonManager) {
      this.#powerButtonManager.disable()
      this.#powerButtonManager = null
    }

    // Disable Calendar Manager
    if (this.#calendarManager) {
      this.#calendarManager.disable()
      this.#calendarManager = null
    }

    if (this.#themeScheduler) {
      this.#themeScheduler.disable()
      this.#themeScheduler = null
    }
  }
}
