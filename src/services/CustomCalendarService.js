import St from 'gi://St'
import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import SignalManager from './SignalManager.js'

export class CustomCalendarService {
  #main
  #dateMenu
  #calendar
  #originalHeaderFormat
  #todayButton
  #signalManager

  constructor (main) {
    this.#main = main
    this.#dateMenu = this.#main.panel.statusArea.dateMenu
    this.#calendar = this.#dateMenu._calendar
    this.#signalManager = new SignalManager()
  }

  enable () {
    this.#updateHeader(true)
    this.#insertTodayButton()
    this.#registerClickListeners()

    this.#todayButton.connect('clicked', () => {
      this.#calendar.setDate(new Date())
    })

    this.#signalManager.connectOn(this.#calendar, 'selected-date-changed', () => {
      this.#checkAndReregisterListeners()
    })
  }

  disable () {
    this.#updateHeader(false)
    this.#removeTodayButton()
    this.#unregisterClickListeners()
    this.#signalManager.disconnectAll()
  }

  #updateHeader (value) {
    if (value) {
      this.#originalHeaderFormat = this.#calendar._headerFormatWithoutYear
      this.#calendar._headerFormatWithoutYear = "%OB %Y"
    } else {
      this.#calendar._headerFormatWithoutYear = this.#originalHeaderFormat
    }

    this.#calendar._update()
  }

  #insertTodayButton () {
    const backButton = this.#calendar._backButton
    const forwardButton = this.#calendar._forwardButton
    const header = forwardButton.get_parent()

    this.#todayButton = new St.Button({
      style_class: 'pager-button',
      can_focus: true,
      child: new St.Icon({
        icon_name: 'x-office-calendar-symbolic'
      })
    })

    backButton.get_parent().remove_child(backButton)

    header.insert_child_below(this.#todayButton, forwardButton)
    header.insert_child_below(backButton, this.#todayButton)
  }

  #removeTodayButton () {
    const backButton = this.#calendar._backButton
    const header = backButton.get_parent()

    this.#todayButton.destroy()

    backButton.get_parent().remove_child(backButton)
    header.insert_child_at_index(backButton, 0)
  }

  #checkAndReregisterListeners () {
    const firstButton = this.#calendar._buttons[0]

    if (firstButton && !firstButton._nowaBPE) {
      this.#registerClickListeners()
    }
  }

  #registerClickListeners () {
    this.#calendar._buttons.forEach(button => {
      if (button._nowaBPE) return

      button._nowaBPE = button.connect('clicked', () => {
        button._nowaClickCount = (button._nowaClickCount || 0) + 1

        if (button._nowaClickCount === 2) {
          this.#openAppCalendar(button._date)
          button._nowaClickCount = 0
          if (button._nowaClickTimeout) {
            GLib.Source.remove(button._nowaClickTimeout)
            button._nowaClickTimeout = null
          }
        } else {
          if (button._nowaClickTimeout) GLib.Source.remove(button._nowaClickTimeout)

          button._nowaClickTimeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 300, () => {
            button._nowaClickCount = 0
            button._nowaClickTimeout = null

            return GLib.SOURCE_REMOVE
          })
        }
      })
    })
  }

  #unregisterClickListeners () {
    this.#calendar._buttons.forEach(button => {
      if (button._nowaBPE) {
        button.disconnect(button._nowaBPE)
        button._nowaBPE = null
      }
    })
  }

  #openAppCalendar (date) {
    try {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      Gio.Subprocess.new(
        ['gnome-calendar', '-d', `${month}/${day}/${year}`],
        Gio.SubprocessFlags.NONE
      )

      this.#dateMenu.menu.close()
    } catch (e) {
      console.error('Failed to open GNOME Calendar:', e)
    }
  }
}
