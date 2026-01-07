import _BaseView from "../_BaseView.js"
import St from 'gi://St'

export default class NotificationControls extends _BaseView {
  constructor (callbacks) {
    super(callbacks)
  }

  onCreate () {
    const spacer = new St.Widget({ x_expand: true })

    this.el = new St.BoxLayout({
      style_class: 'notification-controls',
      x_expand: true
    })

    // Mute button

    this.muteButton = new St.Button({
      style_class: 'icon-button notification-constrols-toggle',
      child: new St.Icon({
        icon_name: 'notification-disabled-symbolic',
        icon_size: 16,
      }),
      can_focus: true,
    })

    // Clear button

    this.clearButton = new St.Button({
      style_class: 'icon-button',
      child: new St.Icon({
        icon_name: 'edit-clear-symbolic',
        icon_size: 16
      }),
      can_focus: true,
    })

    // bind callbacks

    if (this.onToggleMute) {
      this.muteButton.connect('clicked', () => this.onToggleMute())
    }

    if (this.onClear) {
      this.clearButton.connect('clicked', () => this.onClear())
    }

    this.el.add_child(this.muteButton)
    this.el.add_child(spacer)
    this.el.add_child(this.clearButton)
  }

  updateMuteButton (isActive) {
    if (isActive) {
      this.muteButton.add_style_class_name('is-active')
    } else {
      this.muteButton.remove_style_class_name('is-active')
    }
  }
}
