import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'

import { CalendarManager } from './src/modules/CalendarManager.js'
import { PowerButtonManager } from './src/modules/PowerButtonManager.js'
import { NotificationsManager } from './src/modules/NotificationsManager.js'
import { RoundedScreen } from './src/modules/RoundedScreen.js'
import { ShellTweaks } from './src/modules/ShellTweaks.js'
import { ThemeScheduler } from './src/modules/ThemeScheduler.js'
import { DashToDockThemer } from './src/modules/DashToDockThemer.js'

import Logger from './src/services/Logger.js'

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
  #moduleClasses = [
    RoundedScreen,
    ShellTweaks,
    NotificationsManager,
    CalendarManager,
    PowerButtonManager,
    ThemeScheduler,
    DashToDockThemer
  ]
  #modules = []

  enable () {
    const settings = this.getSettings()

    this.#moduleClasses.forEach(Constructor => {
      const module = new Constructor(settings, this.dir)

      try {
        module.enable()

        this.#modules.push(module)
      } catch (error) {
        Logger.error(`Failed to enable ${module.name}`, error)
      }
    })
  }

  disable () {
    this.#modules.reverse().forEach(module => {
      try {
        module.disable()
      } catch (error) {
        Logger.error(`Failed to disable ${module.name}`, error)
      }
    })

    this.#modules = []
  }
}
