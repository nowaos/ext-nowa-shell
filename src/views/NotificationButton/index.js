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
    _isDndActive = null

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
      this._service.onChangeDnd((isDndActive) => {
        this._isDndActive = isDndActive
        this._updateIcon()
      })

      this._buildMenu()
    }

    _buildMenu () {
      try {
        this._notifControl = new NotificationControls({
          onToggleDnd: () => this._service.toggleDnd(),
          onClear: () => this._service.clearAll()
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
        this._service.onChangeDnd((state) => this._notifControl.updateDnd(state))
      } catch (e) {
        Logger.log(`Error building menu: ${e}`)
        Logger.log(`Stack: ${e.stack}`)
      }
    }

    destroy () {
      Logger.log('NotificationButton destroyed')

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

      this._isEmpty = isEmpty
      this._updateIcon()

      Logger.log(`Empty state: ${isEmpty}`)
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

      Logger.log(`Can clear: ${canClear}`)
    }

    _updateIcon () {
      let icon = this.get_child_at_index(0)

      if (this._isDndActive) {
        icon.icon_name = 'notification-disabled-symbolic'
      } else if (this._isEmpty) {
        icon.icon_name = 'notification-symbolic'
      } else {
        icon.icon_name = 'notification-active'
      }
    }
  }
)
