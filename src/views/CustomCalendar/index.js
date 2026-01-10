import St from 'gi://St'
import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import SignalManager from '../../services/SignalManager.js'
import _BaseView from '../_BaseView.js'

export class CustomCalendar extends _BaseView {
  _originalHeaderFormat
  _todayButton

  constructor (dateMenu, calendar) {
    super({ dateMenu, calendar })
  }

  onCreate () {
    this._signalManager = new SignalManager()
  }

  onDestroy () {
    this._updateHeader(false)
    this._removeTodayButton()
    this._unregisterClickListeners()
    this._signalManager.disconnectAll()
  }

  customize () {
    this._updateHeader(true)
    this._insertTodayButton()
    this._registerClickListeners()

    this._todayButton.connect('clicked', () => {
      this.calendar.setDate(new Date())
    })

    this._signalManager.connectOn(this.calendar, 'selected-date-changed', () => {
      this._checkAndReregisterListeners()
    })
  }

  _updateHeader (value) {
    if (value) {
      this._originalHeaderFormat = this.calendar._headerFormatWithoutYear
      this.calendar._headerFormatWithoutYear = "%OB %Y"
    } else {
      this.calendar._headerFormatWithoutYear = this._originalHeaderFormat
    }

    this.calendar._update()
  }

  _insertTodayButton () {
    const backButton = this.calendar._backButton
    const forwardButton = this.calendar._forwardButton
    const header = forwardButton.get_parent()

    this._todayButton = new St.Button({
      style_class: 'pager-button',
      can_focus: true,
      child: new St.Icon({
        icon_name: 'x-office-calendar-symbolic'
      })
    })

    backButton.get_parent().remove_child(backButton)

    header.insert_child_below(this._todayButton, forwardButton)
    header.insert_child_below(backButton, this._todayButton)
  }

  _removeTodayButton () {
    const backButton = this.calendar._backButton
    const header = backButton.get_parent()

    this._todayButton.destroy()

    backButton.get_parent().remove_child(backButton)
    header.insert_child_at_index(backButton, 0)
  }

  _checkAndReregisterListeners () {
    const firstButton = this.calendar._buttons[0]

    if (firstButton && !firstButton._nowaBPE) {
      this._registerClickListeners()
    }
  }

  _registerClickListeners () {
    this.calendar._buttons.forEach(button => {
      if (button._nowaBPE) return

      button._nowaBPE = button.connect('clicked', () => {
        button._nowaClickCount = (button._nowaClickCount || 0) + 1

        if (button._nowaClickCount === 2) {
          this._openAppCalendar(button._date)
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

  _unregisterClickListeners () {
    this.calendar._buttons.forEach(button => {
      if (button._nowaBPE) {
        button.disconnect(button._nowaBPE)
        button._nowaBPE = null
      }
    })
  }

  _openAppCalendar (date) {
    try {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      Gio.Subprocess.new(
        ['gnome-calendar', '-d', `${month}/${day}/${year}`],
        Gio.SubprocessFlags.NONE
      )

      this.dateMenu.menu.close()
    } catch (e) {
      console.error('Failed to open GNOME Calendar:', e)
    }
  }
}
