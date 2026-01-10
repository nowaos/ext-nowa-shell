import _BaseView from "../_BaseView.js"
import St from 'gi://St'

export default class NotificationControls extends _BaseView {
  constructor (callbacks) {
    super(callbacks)
  }

  onCreate () {
    const spacer = new St.Widget({ x_expand: true })

    this.el = new St.BoxLayout({
      style_class: 'notification-menu-controls',
      x_expand: true
    })

    // Mute button

    this.muteButton = new St.Button({
      style_class: 'notification-control-button',
      child: new St.Icon({
        icon_name: 'notifications-disabled-symbolic',
        icon_size: 16,
      }),
      can_focus: true,
      toggle_mode: true,
      checked: false
    })

    // Clear button

    this.clearButton = new St.Button({
      style_class: 'notification-control-button',
      child: new St.Icon({
        icon_name: 'edit-clear-symbolic',
        icon_size: 16
      }),
      can_focus: true
    })

    // bind callbacks

    if (this.onToggleMute) {
      this.muteButton.connect('clicked', () => this.onToggleMute())
    }

    if (this.onClear) {
      this.clearButton.connect('clicked', () => this.onClear())
    }

    this.el.add_child(spacer)
    this.el.add_child(this.clearButton)
    this.el.add_child(this.muteButton)
  }

  updateMuteButton (isActive) {
    this.muteButton.checked = isActive
  }
}
