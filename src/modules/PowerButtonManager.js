import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js'
import * as SystemActions from 'resource:///org/gnome/shell/misc/systemActions.js'

import BaseModule from './_BaseModule.js'

/**
 * PowerButtonManager - Modifies the Power Off button menu
 *
 * Replaces the default menu items with simpler, direct actions
 */
export class PowerButtonManager extends BaseModule {
  #quickSettings
  #shutdownItem = null
  #lockItem = null
  #settingsButton = null
  #settingsButtonOriginalIndex = null
  #originalMenuItems = []
  #customMenuItems = []
  #systemActions = null

  constructor (...args) {
    super(...args)

    this.#systemActions = SystemActions.getDefault()
  }

  get #name () {
    return this.constructor.name
  }

  enable () {
    this.#quickSettings = this.main.panel.statusArea.quickSettings

    if (!this.#quickSettings?._system?._systemItem) {
      this.log('Quick Settings system not found')

      return
    }

    const containerRow = this.#quickSettings._system._systemItem.child
    if (!containerRow) {
      this.log('Container row not found')

      return
    }

    // Find the shutdown button
    const systemItems = containerRow.get_children()
    this.#shutdownItem = systemItems.find(child => child.constructor?.name === 'ShutdownItem')

    if (!this.#shutdownItem) {
      this.log('Shutdown button not found')

      return
    }

    // Find and hide Lock button
    this.#lockItem = systemItems.find(child => child.constructor?.name === 'LockItem')
    if (this.#lockItem) {
      this.#lockItem.visible = false
    }

    // Find and move Settings button
    this.#settingsButton = systemItems.find(child =>
      child.constructor?.name === 'SettingsItem'
    )

    // Reorder: Settings should be right before Power
    if (this.#settingsButton && this.#shutdownItem) {
      this.#settingsButtonOriginalIndex = containerRow.get_children().indexOf(this.#settingsButton)

      containerRow.remove_child(this.#settingsButton)

      const shutdownIndex = containerRow.get_children().indexOf(this.#shutdownItem)

      containerRow.insert_child_at_index(this.#settingsButton, shutdownIndex)
    } else {
      this.log(`Could not reorder - settingsButton: ${!!this.#settingsButton}, shutdownItem: ${!!this.#shutdownItem}`)
    }

    this.#modifyMenu()
  }

  disable () {
    // Restore Lock button visibility
    if (this.#lockItem) {
      this.#lockItem.visible = true
      this.#lockItem = null
    }

    if (this.#settingsButton) {
      const containerRow = this.#settingsButton.get_parent()

      containerRow.remove_child(this.#settingsButton)
      containerRow.insert_child_at_index(this.#settingsButton, this.#settingsButtonOriginalIndex)

      this.#settingsButton = null
    }


    if (!this.#shutdownItem) {
      return
    }

    this.#undoModifyMenu()

    this.#shutdownItem = null
  }

  #modifyMenu () {
    if (!this.#shutdownItem.menu) {
      Logger.debug(this.#name, 'Shutdown button has no menu')

      return
    }

    try {
      // Store original menu items
      const menuItems = this.#shutdownItem.menu._getMenuItems()

      this.#originalMenuItems = [...menuItems]

      // Remove all original items (but keep references for restore)
      menuItems.forEach(item => {
        item._nowaItemVisible = item.visible
        this.#shutdownItem.menu.box.remove_child(item)
      })

      // Add custom menu items
      this.#addCustomMenuItem('Lock', 'system-lock-screen-symbolic', () => {
        this.#systemActions.activateLockScreen()
        this.main.panel.closeQuickSettings()
      })

      this.#addCustomMenuItem('Sleep', 'weather-clear-night-symbolic', () => {
        this.#systemActions.activateSuspend()
        this.main.panel.closeQuickSettings()
      })

      this.#addCustomMenuItem('Restart', 'system-reboot-symbolic', () => {
        // this.#systemActions.activateRestart()
        this.#immediateRestart()
        this.main.panel.closeQuickSettings()
      })

      this.#addCustomMenuItem('Log out', 'system-log-out-symbolic', () => {
        // this.#systemActions.activateLogout()
        this.#immediateLogout()
        this.main.panel.closeQuickSettings()
      })

      this.#addCustomMenuItem('Shut down', 'system-shutdown-symbolic', () => {
        // this.#systemActions.activatePowerOff()
        this.#immediateShutdown()
        this.main.panel.closeQuickSettings()
      })
    } catch (e) {
      this.log(`Error modifying menu: ${e}`)
    }
  }

  #undoModifyMenu () {
    try {
      // Remove custom items safely
      this.#customMenuItems.forEach(item => {
        this.#shutdownItem.menu.box.remove_child(item)
        item.destroy()
      })
      this.#customMenuItems = []

      this.#shutdownItem.menu.removeAll()

      this.#originalMenuItems.forEach(item => {
        this.#shutdownItem.menu.addMenuItem(item)
        item.visible = item._nowaItemVisible

        delete item._nowaItemVisible
      })
      this.#originalMenuItems = []
    } catch (e) {
      Logger.error('PowerButtonManager undo changes', e)
    }
  }

  #addCustomMenuItem (label, iconName, callback) {
    const item = new PopupMenu.PopupImageMenuItem(label, iconName)

    item.connect('activate', () => {
      this.log(`${label} activated`)

      callback()
    })

    this.#shutdownItem.menu.addMenuItem(item)
    this.#customMenuItems.push(item)
  }

  #immediateRestart () {
    Gio.DBus.system.call(
			'org.freedesktop.login1',
			'/org/freedesktop/login1',
			'org.freedesktop.login1.Manager',
			'Reboot',
			new GLib.Variant("(b)", [false]),
			null,
			Gio.DBusCallFlags.NONE,
			-1,
			null,
			null
		)
  }

  #immediateLogout () {
    Gio.DBus.session.call(
			"org.gnome.SessionManager",
			"/org/gnome/SessionManager",
			"org.gnome.SessionManager",
			'Logout',
			new GLib.Variant("(u)", [2]),
			null,
			Gio.DBusCallFlags.NONE,
			-1,
			null,
			null
		)
  }

  #immediateShutdown () {
    Gio.DBus.system.call(
			'org.freedesktop.login1',
			'/org/freedesktop/login1',
			'org.freedesktop.login1.Manager',
			'PowerOff',
			new GLib.Variant("(b)", [false]),
			null,
			Gio.DBusCallFlags.NONE,
			-1,
			null,
			null
		)
  }
}
