import _BaseView from "../_BaseView.js"
import St from 'gi://St'

export default class NotificationList extends _BaseView {
  constructor (messages) {
    super({ messages })
  }

  onCreate () {
    this.el = new St.ScrollView({
      style_class: 'notification-scroll-view',
      overlay_scrollbars: true,
      y_expand: true
    })

    // Set constraints
    this.el.set_policy(St.PolicyType.NEVER, St.PolicyType.AUTOMATIC)
    this.el.add_child(this.messages)
  }
}
