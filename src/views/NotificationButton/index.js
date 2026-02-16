import { Logger } from '../../services/Logger.js'
import GObject from 'gi://GObject'
import St from 'gi://St'
import Clutter from 'gi://Clutter'
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js'

import EmptyState from './_EmptyState.js'
import NotificationControls from './_NotificationControls.js'
import NotificationList from './_NotificationList.js'
import { NotificationService } from '../../services/NotificationService.js'

export default GObject.registerClass(
  class NotificationButton extends PanelMenu.Button {
    _init (main) {
      super._init(0.5, 'Notifications')

      this._buildIcon()

      this._service = new NotificationService()
      this._service.init()
      this._service.connect('notify::empty', () => this._syncEmpty(), this)
      this._service.connect('notify::can-clear', () => this._syncClear(), this)
      this._service.onChangeMute(() => this._updateIcon())
      this._service.onListChanged(() => this._updateIcon())

      this._buildMenu()
    }

    _buildIcon () {
      this._iconBox = new St.Widget({
        layout_manager: new Clutter.BinLayout(),
        y_align: Clutter.ActorAlign.CENTER
      })

      this._icon = new St.Icon({
        icon_name: 'org.gnome.Settings-notifications-symbolic',
        style_class: 'system-status-icon',
        x_align: Clutter.ActorAlign.CENTER,
        y_align: Clutter.ActorAlign.CENTER
      })

      this._indicatorDot = new St.Bin({
        style_class: 'notification-indicator-dot',
        x_align: Clutter.ActorAlign.END,
        y_align: Clutter.ActorAlign.START,
        x_expand: true,
        y_expand: true,
        opacity: 0
      })

      this._iconBox.add_child(this._icon)
      this._iconBox.add_child(this._indicatorDot)

      this.add_child(this._iconBox)
      this.add_style_class_name('notification-panel-button')
    }

    _buildMenu () {
      this.menu.box.add_style_class_name('notification-menu')

      this._notifControl = new NotificationControls({
        onToggleMute: () => this._service.toggleMute(),
        onClear: () => this._service.clearAll(),
      })
      this._notifList = new NotificationList(this._service.getMessageList())
      this._placeholder = new EmptyState()

      // append elements

      this.menu.box.add_child(this._notifList.el)
      this.menu.box.add_child(this._placeholder.el)
      this.menu.box.add_child(this._notifControl.el)

      // bind events

      this._syncEmpty()
      this._syncClear()
      this._service.onChangeMute((state) => this._notifControl.updateMuteButton(state))
    }

    destroy () {
      super.destroy()
    }

    _syncEmpty () {
      const isEmpty = this._service.isEmpty()

      if (isEmpty) {
        this._notifList.el.hide()
        this._placeholder.el.show()
      } else {
        this._placeholder.el.hide()
        this._notifList.el.show()
      }

      this._updateIcon()
    }

    _syncClear () {
      const canClear = this._service.canClear()

      this._notifControl.clearButton.reactive = canClear
      this._notifControl.clearButton.can_focus = canClear

      if (canClear) {
        this._notifControl.clearButton.remove_style_class_name('disabled')
      } else {
        this._notifControl.clearButton.add_style_class_name('disabled')
      }
    }

    _updateIcon () {
      const isMuted = this._service.isMuted()
      const messagesCount = this._service.messagesCount()

      if (isMuted) {
        this._icon.icon_name = 'notifications-disabled-symbolic'
        this._indicatorDot.opacity = 0
      } else if (messagesCount > 0) {
        this._icon.icon_name = 'org.gnome.Settings-notifications-symbolic'
        this._indicatorDot.opacity = 255
      } else {
        this._icon.icon_name = 'org.gnome.Settings-notifications-symbolic'
        this._indicatorDot.opacity = 0
      }
    }
  }
)
