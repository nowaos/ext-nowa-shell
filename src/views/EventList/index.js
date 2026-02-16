// EventList.js
import St from 'gi://St'
import GLib from 'gi://GLib'
import Clutter from 'gi://Clutter'

import BaseView from '../_BaseView.js'
import SignalManager from '../../services/SignalManager.js'
import EventItem from './_EventItem.js'

export default class EventList extends BaseView {
  constructor (calendar) {
    super({ calendar })
  }

  onCreate () {
    this.signalManager = new SignalManager()
    this._timeoutId = null
    this._eventItems = []

    this.el = new St.BoxLayout({
      style_class: 'calendar-events',
      vertical: true,
      x_expand: true,
      y_expand: true,
      clip_to_allocation: true
    })

    this.signalManager.connectOn(this.calendar._eventSource, 'changed', () => {
      this.setDate(this.calendar._selectedDate)
    })

    this.signalManager.connectOn(this.calendar, 'selected-date-changed', () => {
      this.setDate(this.calendar._selectedDate)
    })

    this.startTimeWatch()
  }

  onDestroy () {
    this.stopTimeWatch()

    this._eventItems.forEach(item => item.destroy())
    this._eventItems = []

    if (this.el) {
      this.el.destroy_all_children()
    }

    this.signalManager.disconnectAll()
    this.el.destroy()
  }

  getEvents (date) {
    return this.calendar._eventSource.getEvents(
      new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
    )
  }

  updateEventStatuses () {
    this._eventItems.forEach(item => item.updateStatus())
  }

  startTimeWatch () {
    this.stopTimeWatch()

    const updateEveryMinute = () => {
      this.updateEventStatuses()

      this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
        updateEveryMinute()
        return GLib.SOURCE_REMOVE
      })
    }

    updateEveryMinute()
  }

  stopTimeWatch () {
    if (this._timeoutId) {
      GLib.Source.remove(this._timeoutId)
      this._timeoutId = null
    }
  }

  setDate (date) {
    const events = this.getEvents(date)

    this._eventItems.forEach(item => item.destroy())
    this._eventItems = []
    this.el.destroy_all_children()

    events.sort((a, b) => new Date(a.date) - new Date(b.date))

    events.forEach(ev => {
      const eventItem = new EventItem(ev)
      this._eventItems.push(eventItem)
      this.el.add_child(eventItem.el)
    })

    if (events.length === 0) {
      const noEvents = new St.Label({
        text: 'No events for this day.',
        style_class: 'no-events',
        y_expand: true,
        y_align: Clutter.ActorAlign.CENTER,
        x_align: Clutter.ActorAlign.CENTER
      })

      this.el.add_child(noEvents)
    }
  }
}
