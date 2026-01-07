// SPDX-FileCopyrightText: Nowa Shell Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import Clutter from 'gi://Clutter'
import NotificationButton from '../views/NotificationButton/index.js'

export class NotificationsManager {
  #main
  #button
  #messageTray

  constructor (main) {
    this.#main = main
    this.#messageTray = this.#main.messageTray
  }

  enable () {
    const { box, position } = this.#getPositionRelativeToQS('left')

    this.#messageTray.bannerAlignment = Clutter.ActorAlign.END

    this.#button = new NotificationButton(this.#main)
    this.#main.panel.addToStatusArea('nowa-notifications', this.#button, position, box)
    this.#hideDefaultDnd()
  }

  disable () {
    this.#button?.destroy?.()
    this.#button = null
  }

  #getPositionRelativeToQS (relativeTo = 'left') {
    try {
      const quickSettings = this.#main.panel.statusArea.quickSettings

      if (!quickSettings) {
        return { box: 'right', position: 0 }
      }

      // Quick Settings is in the right box
      const rightBox = this.#main.panel._rightBox
      const children = rightBox.get_children()
      const qsIndex = children.indexOf(quickSettings)

      if (qsIndex === -1) {
        return { box: 'right', position: 0 }
      }

      if (relativeTo === 'left') {
        // Place right before Quick Settings

        return { box: 'right', position: qsIndex }
      } else {
        // Place right after Quick Settings

        return { box: 'right', position: qsIndex + 1 }
      }
    } catch (e) {
      return { box: 'right', position: 0 }
    }
  }

  #hideDefaultDnd () {
    const dateMenu = this.#main.panel?.statusArea?.dateMenu

    if (!dateMenu) return

    // In GNOME 43+ the indicator is usually stored in _dndIndicator
    const indicator = dateMenu._indicator

    if (!indicator) return

    indicator.destroy()
    dateMenu._indicator = null
  }
}
