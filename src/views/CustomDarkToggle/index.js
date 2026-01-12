import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js'
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js'

import SignalManager from '../../services/SignalManager.js'
import _BaseView from '../_BaseView.js'
import { TimersSettingsDialog } from './TimersSettingsDialog.js'

export class CustomDarkToggle extends _BaseView {
  // props = settings

  get currentScheme () {
    return this._interfaceSettings.get_string('color-scheme')
  }

  get isEnabled () {
    return this.props.settings.get_boolean('enable-theme-timers')
  }

  get sunriseTime () {
    return this.props.settings.get_string('sunrise-time')
  }

  get sunsetTime () {
    return this.props.settings.get_string('sunset-time')
  }

  onCreate () {
    this._qs = this.main.panel.statusArea.quickSettings
    this._originalItem = null
    this._interfaceSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' })
    this._signalManager = new SignalManager()
    this._isReplaced = false

    this._sunsetMenuItem = null
    this._sunriseMenuItem = null
    this._disabledMessage = null

    this.el = new QuickSettings.QuickMenuToggle({
      title: 'Dark Style',
      iconName: 'dark-mode-symbolic',
      toggleMode: true,
      checked: this.currentScheme === 'prefer-dark'
    })

    this._buildMenu()
    this._listenEvents()
    this._updateVisibility()
  }

  onDestroy () {
    if (this._isReplaced)
      this.restore()

    this._signalManager.disconnectAll()
  }

  replace () {
    if (this._isReplaced)
      return

    this._isReplaced = true

    this._originalItem = this._qs._darkMode.quickSettingsItems[0]

    this._originalItem.hide()
    this._qs.menu.addItem(this.el)
  }

  restore () {
    if (!this._isReplaced)
      return

    this._qs.menu._grid.remove_child(this.el)
    this._originalItem.show()

    this._isReplaced = false
  }

  toggle () {
    if (this.currentScheme === 'prefer-dark') {
      this._interfaceSettings.set_string('color-scheme', 'default')
    } else {
      this._interfaceSettings.set_string('color-scheme', 'prefer-dark')
    }
  }

  _buildMenu () {
    const menu = this.el.menu

    menu.setHeader('dark-mode-symbolic', 'Dark Style', null)

    // Timers enabled - sunset/sunrise items
    this._sunsetMenuItem = new PopupMenu.PopupImageMenuItem(
      this.sunsetTime,
      'weather-clear-night-symbolic'
    )
    this._sunsetMenuItem.reactive = false

    this._sunriseMenuItem = new PopupMenu.PopupImageMenuItem(
      this.sunriseTime,
      'weather-clear-symbolic'
    )
    this._sunriseMenuItem.reactive = false

    menu.addMenuItem(this._sunsetMenuItem)
    menu.addMenuItem(this._sunriseMenuItem)

    // Timers disabled - message
    this._disabledMessage = new PopupMenu.PopupMenuItem(
      'Sunset/Sunrise timers are disabled.'
    )
    this._disabledMessage.reactive = false

    menu.addMenuItem(this._disabledMessage)

    // Separator
    menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem())

    // Settings
    const settingsItem = new PopupMenu.PopupMenuItem('Style Settings')

    settingsItem.connect('activate', () => {
      this._settingsDialog = new TimersSettingsDialog({
        sunsetTime: this.sunsetTime,
        sunriseTime: this.sunriseTime,
        isEnabled: this.isEnabled,
        onSave: (sunsetTime, sunriseTime, isEnabled) => {
          this.settings.set_string('sunset-time', sunsetTime)
          this.settings.set_string('sunrise-time', sunriseTime)
          this.settings.set_boolean('enable-theme-timers', isEnabled)
        }
      })

      // Delay mínimo pra dialog estar no stage
      GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
        this._settingsDialog.open()
        return GLib.SOURCE_REMOVE
      })
    })

    menu.addMenuItem(settingsItem)
  }

  _listenEvents () {
    this._signalManager.connectOn(this.el, 'clicked', () => this.toggle())

    this._signalManager.connectOn(this._interfaceSettings, 'changed::color-scheme', () => {
      this.el.checked = (this.currentScheme === 'prefer-dark')
    })

    this._signalManager.connectOn(this.props.settings, 'changed::sunset-time', () => {
      if (this._sunsetMenuItem) this._sunsetMenuItem.label.text = this.sunsetTime
    })

    this._signalManager.connectOn(this.props.settings, 'changed::sunrise-time', () => {
      if (this._sunriseMenuItem) this._sunriseMenuItem.label.text = this.sunriseTime
    })

    this._signalManager.connectOn(this.props.settings, 'changed::enable-theme-timers', () => {
      this._updateVisibility()
    })
  }

  _updateVisibility () {
    if (this.isEnabled) {
      this._sunsetMenuItem.show()
      this._sunriseMenuItem.show()
      this._disabledMessage.hide()
    } else {
      this._sunsetMenuItem.hide()
      this._sunriseMenuItem.hide()
      this._disabledMessage.show()
    }
  }
}
