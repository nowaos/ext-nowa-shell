import Gio from 'gi://Gio'
import St from 'gi://St'
import * as Main from 'resource:///org/gnome/shell/ui/main.js'

import BaseModule from './_BaseModule.js'

const CORNER_RADIUS = 6

/**
* RoundedScreen module - adds rounded corners to screen edges
*/
export class RoundedScreen extends BaseModule {
  #corners = {}
  #monitorListener = null

  enable () {
    // Monitor changes to redraw corners
    this.#monitorListener = Gio.DBus.session.signal_subscribe(
      'org.gnome.Mutter.DisplayConfig',
      'org.gnome.Mutter.DisplayConfig',
      'MonitorsChanged',
      '/org/gnome/Mutter/DisplayConfig',
      null,
      Gio.DBusSignalFlags.NONE,
      () => this.#draw()
    )

    this.#draw()
  }

  disable () {
    if (this.#monitorListener) {
      Gio.DBus.session.signal_unsubscribe(this.#monitorListener)
      this.#monitorListener = null
    }

    this.#destroy()
  }

  #draw () {
    this.#destroy()

    const radius = CORNER_RADIUS
    const cornerDir = this.dir.get_child('assets').get_child('corners').get_path()

    for (let monitor of Main.layoutManager.monitors) {
      let geometryScale = monitor.geometry_scale || 1

      for (let corner of ['tl', 'tr', 'bl', 'br']) {
        let x = monitor.x + ((corner[1] == 'l') ? 0 : monitor.width - geometryScale * radius)
        let y = monitor.y + ((corner[0] == 't') ? 0 : monitor.height - geometryScale * radius)

        let cornerDecoration = this.#corners[`${monitor.index}-${corner}`] = new St.Bin({
          style_class: `corner-decoration corner-${corner}`,
          reactive: false,
          x, y,
          width: geometryScale * radius,
          height: geometryScale * radius,
          can_focus: false,
          track_hover: false,
          style: `
            background-image: url("${cornerDir}/corner-${corner}.svg");
            background-size: contain;
          `
        })

        Main.uiGroup.add_child(cornerDecoration)
      }
    }
  }

  #destroy () {
    for (let corner of Object.values(this.#corners)) {
      corner.destroy()
    }
    this.#corners = {}
  }
}
