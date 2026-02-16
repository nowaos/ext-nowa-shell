import St from 'gi://St'
import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import SignalManager from '../../services/SignalManager.js'
import _BaseView from '../_BaseView.js'
import { Logger } from '../../services/Logger.js'

const DCLICK_TIMEOUT = 500

export class CustomCalendar extends _BaseView {
  _originalHeaderFormat
  _todayButton
  _activeButtonTimeouts = new Set()

  constructor (dateMenu, calendar) {
    super({ dateMenu, calendar })
  }

  onCreate () {
    this._signalManager = new SignalManager()
  }

  onDestroy () {
    this._updateHeader(false)
    this._removeTodayButton()
    this._clearAllButtonTimeouts()
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

    if (firstButton && !firstButton._nowaClickEvent) {
      this._clearAllButtonTimeouts()
      this._registerClickListeners()
    }
  }

  _registerClickListeners () {
    this.calendar._buttons.forEach(button => {
      if (button._nowaClickEvent) return

      button._nowaClickEvent = button.connect('clicked', () => {
        button._nowaClickCount = (button._nowaClickCount || 0) + 1

        if (button._nowaClickCount === 2) {
          this._openAppCalendar(button._date)
          button._nowaClickCount = 0

          if (button._nowaClickTimeout) {
            GLib.Source.remove(button._nowaClickTimeout)
            button._nowaClickTimeout = null
            this._activeButtonTimeouts.delete(button)
          }
        } else {
          if (button._nowaClickTimeout) GLib.Source.remove(button._nowaClickTimeout)

          button._nowaClickTimeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, DCLICK_TIMEOUT, () => {
            button._nowaClickCount = 0
            button._nowaClickTimeout = null
            this._activeButtonTimeouts.delete(button)


            return GLib.SOURCE_REMOVE
          })

          this._activeButtonTimeouts.add(button)
        }
      })
    })
  }

  _unregisterClickListeners () {
    this.calendar._buttons.forEach(button => {
      if (button._nowaClickEvent) {
        button.disconnect(button._nowaClickEvent)
        button._nowaClickEvent = null
      }
    })
  }

  _clearAllButtonTimeouts () {
    this._activeButtonTimeouts.forEach(button => {
      if (button._nowaClickTimeout) {
        GLib.Source.remove(button._nowaClickTimeout)
        button._nowaClickTimeout = null
      }
    })

    this._activeButtonTimeouts.clear()
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
      Logger.error('Failed to open GNOME Calendar:', e)
    }
  }
}
