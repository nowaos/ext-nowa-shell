// SPDX-FileCopyrightText: Nowa Shell Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import { Logger } from '../services/Logger.js'
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js'
import * as SystemActions from 'resource:///org/gnome/shell/misc/systemActions.js'

/**
 * PowerButtonManager - Modifies the Power Off button menu
 *
 * Replaces the default menu items with simpler, direct actions
 */
export class PowerButtonManager {
  #main
  #quickSettings
  #shutdownItem = null
  #lockItem = null
  #settingsButton = null
  #originalMenuItems = []
  #customMenuItems = []
  #systemActions = null

  constructor (main) {
    this.#main = main
    this.#systemActions = SystemActions.getDefault()
  }

  get #name () {
    return this.constructor.name
  }

  enable () {
    this.#quickSettings = this.#main.panel.statusArea.quickSettings

    if (!this.#quickSettings?._system?._systemItem) {
      Logger.debug(this.#name, 'Quick Settings system not found')

      return
    }

    const containerRow = this.#quickSettings._system._systemItem.child
    if (!containerRow) {
      Logger.debug(this.#name, 'Container row not found')

      return
    }

    // Find the shutdown button
    const systemItems = containerRow.get_children()
    this.#shutdownItem = systemItems.find(child => child.constructor?.name === 'ShutdownItem')

    if (!this.#shutdownItem) {
      Logger.debug(this.#name, 'Shutdown button not found')

      return
    }

    // Find and hide Lock button
    this.#lockItem = systemItems.find(child => child.constructor?.name === 'LockItem')
    if (this.#lockItem) {
      this.#lockItem.visible = false
    }

    // Find Settings button - try multiple approaches
    this.#settingsButton = systemItems.find(child =>
      child._icon && child._icon.icon_name === 'emblem-system-symbolic'
    )

    if (!this.#settingsButton) {
      // Try finding by class name
      this.#settingsButton = systemItems.find(child =>
        child.constructor?.name === 'SettingsItem'
      )
    }

    if (!this.#settingsButton) {
      systemItems.forEach((child, index) => {
        const iconName = child._icon ? child._icon.icon_name : 'no icon'
        const className = child.constructor?.name || 'no class'

        Logger.debug(this.#name, `[${index}] ${className} - icon: ${iconName}`)
      })
    }

    // Reorder: Settings should be right before Power
    if (this.#settingsButton && this.#shutdownItem) {
      containerRow.remove_child(this.#settingsButton)

      const shutdownIndex = containerRow.get_children().indexOf(this.#shutdownItem)

      containerRow.insert_child_at_index(this.#settingsButton, shutdownIndex)
    } else {
      Logger.debug(this.#name, `Could not reorder - settingsButton: ${!!this.#settingsButton}, shutdownItem: ${!!this.#shutdownItem}`)
    }

    this.#modifyMenu()
  }

  disable () {
    // Restore Lock button visibility
    if (this.#lockItem) {
      this.#lockItem.visible = true
      this.#lockItem = null
    }

    this.#settingsButton = null

    if (!this.#shutdownItem || !this.#shutdownItem.menu) {
      Logger.debug(this.#name, 'No shutdown item to restore')

      return
    }

    try {
      // Remove custom items safely
      this.#customMenuItems.forEach(item => {
        try {
          if (item && !item.is_finalized()) {
            this.#shutdownItem.menu.box.remove_child(item)
            item.destroy()
          }
        } catch (e) {
          Logger.debug(this.#name, `Error removing custom item: ${e}`)
        }
      })
      this.#customMenuItems = []

      // Clear the menu completely
      if (this.#shutdownItem.menu && !this.#shutdownItem.menu.is_finalized()) {
        this.#shutdownItem.menu.removeAll()

        // Restore original items safely
        this.#originalMenuItems.forEach(item => {
          try {
            if (item && !item.is_finalized()) {
              this.#shutdownItem.menu.addMenuItem(item)
            }
          } catch (e) {
            Logger.log(this.#name, `Error restoring item: ${e}`)
          }
        })
      }

      this.#originalMenuItems = []
    } catch (e) {
      Logger.log(this.#name, `Error during disable: ${e}`)
    }

    this.#shutdownItem = null
  }

  #modifyMenu () {
    if (!this.#shutdownItem.menu) {
      Logger.log(this.#name, 'Shutdown button has no menu')

      return
    }

    try {
      // Store original menu items
      const menuItems = this.#shutdownItem.menu._getMenuItems()

      this.#originalMenuItems = [...menuItems]

      // Remove all original items (but keep references for restore)
      menuItems.forEach(item => {
        this.#shutdownItem.menu.box.remove_child(item)
      })

      // Add custom menu items
      this.#addCustomMenuItem('Lock', 'system-lock-screen-symbolic', () => {
        this.#systemActions.activateLockScreen()
        this.#main.panel.closeQuickSettings()
      })

      this.#addCustomMenuItem('Sleep', 'weather-clear-night-symbolic', () => {
        this.#systemActions.activateSuspend()
        this.#main.panel.closeQuickSettings()
      })

      this.#addCustomMenuItem('Restart', 'system-reboot-symbolic', () => {
        this.#systemActions.activateRestart()
        this.#main.panel.closeQuickSettings()
      })

      this.#addCustomMenuItem('Log out', 'system-log-out-symbolic', () => {
        this.#systemActions.activateLogout()
        this.#main.panel.closeQuickSettings()
      })

      this.#addCustomMenuItem('Shut down', 'system-shutdown-symbolic', () => {
        this.#systemActions.activatePowerOff()
        this.#main.panel.closeQuickSettings()
      })
    } catch (e) {
      Logger.debug(this.#name, `Error modifying menu: ${e}`)
    }
  }

  #addCustomMenuItem (label, iconName, callback) {
    const item = new PopupMenu.PopupImageMenuItem(label, iconName)

    item.connect('activate', () => {
      Logger.debug(this.#name, `${label} activated`)

      callback()
    })

    this.#shutdownItem.menu.addMenuItem(item)
    this.#customMenuItems.push(item)
  }
}
