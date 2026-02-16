import Clutter from 'gi://Clutter'

import BaseModule from './_BaseModule.js'
import NotificationButton from '../views/NotificationButton/index.js'

export class NotificationsManager extends BaseModule {
  #button
  #messageTray
  #originalBannerAlignment

  constructor (...args) {
    super(...args)

    this.#messageTray = this.main.messageTray
    this.#originalBannerAlignment = this.#messageTray.bannerAlignment
  }

  enable () {
    this.#messageTray.bannerAlignment = Clutter.ActorAlign.END
    this.#hideDefaultMuteIndicator(true)

    this.#button = new NotificationButton(this.main)

    this.main.panel.addToStatusArea('nowa-notifications', this.#button, 0, 'right')
  }

  disable () {
    if (this.#button) {
      this.#button.destroy()
      this.#button = null
    }

    this.#messageTray.bannerAlignment = this.#originalBannerAlignment
    this.#hideDefaultMuteIndicator(false)
  }

  #hideDefaultMuteIndicator (value) {
    const dateMenu = this.main.panel?.statusArea?.dateMenu

    if (!dateMenu) return

    const indicator = dateMenu._indicator

    if (!indicator) return

    if (value) {
      indicator.add_style_class_name('notification-default-mute-indicator')
    } else {
      indicator.remove_style_class_name('notification-default-mute-indicator')
    }
  }
}
