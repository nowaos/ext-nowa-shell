import { Logger } from '../../services/Logger.js'
import GObject from 'gi://GObject'
import St from 'gi://St'
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js'

import EmptyState from './_EmptyState.js'
import NotificationControls from './_NotificationControls.js'
import NotificationList from './_NotificationList.js'
import { NotificationService } from '../../services/NotificationService.js'

export default GObject.registerClass(
  class NotificationButton extends PanelMenu.Button {
    _init (main) {
      super._init(0.5, 'Notifications')

      this.add_child(new St.Icon({
        icon_name: 'notification-symbolic',
        style_class: 'system-status-icon',
      }))

      this.menu.box.add_style_class_name('notification-menu')

      this._service = new NotificationService(main)
      this._service.init()
      this._service.connect('notify::empty', () => this._syncEmpty(), this)
      this._service.connect('notify::can-clear', () => this._syncClear(), this)
      this._service.onChangeMute(() => this._updateIcon())
      this._service.onListChanged(() => this._updateIcon())

      this._buildMenu()
    }

    _buildMenu () {
      try {
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
      } catch (e) {
        Logger.log(`Error building menu: ${e}`)
        Logger.log(`Stack: ${e.stack}`)
      }
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
      const icon = this.get_child_at_index(0)

      if (!icon) return

      const isMuted = this._service.isMuted()
      const messagesCount = this._service.messagesCount()

      if (isMuted) {
        icon.icon_name = 'notification-disabled-symbolic'
      } else if (messagesCount > 0) {
        icon.icon_name = 'notification-active'
      } else {
        icon.icon_name = 'notification-symbolic'
      }
    }
  }
)
