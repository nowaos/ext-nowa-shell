import _BaseView from "../_BaseView.js"
import St from 'gi://St'
import Clutter from 'gi://Clutter'

export default class EmptyState extends _BaseView {
  onCreate () {
    this.el = new St.BoxLayout({
      vertical: true,
      x_expand: true,
      y_expand: true,
      x_align: Clutter.ActorAlign.CENTER,
      y_align: Clutter.ActorAlign.CENTER,
    })

    const icon = new St.Icon({
      icon_name: 'notification-symbolic',
      style_class: 'notification-menu-emptystate-icon',
      icon_size: 64,
    })

    const title = new St.Label({
      text: 'No notifications',
      style_class: 'notification-menu-emptystate-title',
      x_align: Clutter.ActorAlign.CENTER,
      y_align: Clutter.ActorAlign.CENTER,
    })

    const label = new St.Label({
      text: "You'll see all notifications here.",
      style_class: 'notification-menu-emptystate-label',
      x_align: Clutter.ActorAlign.CENTER,
      y_align: Clutter.ActorAlign.CENTER,
    })

    this.el.add_child(icon)
    this.el.add_child(title)
    this.el.add_child(label)
  }
}
