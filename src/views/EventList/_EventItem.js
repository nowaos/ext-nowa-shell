// EventItem.js
import St from 'gi://St'

import BaseView from '../_BaseView.js'

export default class EventItem extends BaseView {
  constructor (event) {
    super({ event })
  }

  onCreate () {
    this.el = new St.BoxLayout({
      vertical: true,
      style_class: 'calendar-event'
    })

    const isAllDay = this.isAllDay(this.event)
    const title = new St.Label({ text: this.event.summary, style_class: 'event-title' })

    if (isAllDay) {
      const allDay = new St.Label({
        text: 'All Day',
        style_class: 'event-time'
      })
      this.el.add_child(title)
      this.el.add_child(allDay)
    } else {
      const time = new St.Label({
        text: `${this.formatTime(this.event.date)} - ${this.formatTime(this.event.end)}`,
        style_class: 'event-time'
      })
      this.el.add_child(title)
      this.el.add_child(time)
    }

    this.updateStatus()
  }

  onDestroy () {
    if (this.el) {
      this.el.destroy_all_children()
    }
  }

  isAllDay (event) {
    return event.date.getHours() === 0 && event.date.getMinutes() === 0 &&
           event.end.getHours() === 0 && event.end.getMinutes() === 0
  }

  getEventStatus (event) {
    const now = new Date()
    const isAllDay = this.isAllDay(event)

    if (isAllDay) {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const eventDate = new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate())

      if (eventDate < today) {
        return 'is-past'
      }
      return null
    }

    const eventStart = new Date(event.date)
    const eventEnd = new Date(event.end)

    if (now < eventStart) {
      return null
    } else if (now >= eventStart && now < eventEnd) {
      return 'is-ongoing'
    } else {
      return 'is-past'
    }
  }

  updateStatus () {
    this.el.remove_style_class_name('is-past')
    this.el.remove_style_class_name('is-ongoing')

    const status = this.getEventStatus(this.event)
    if (status) {
      this.el.add_style_class_name(status)
    }
  }

  formatTime (date) {
    const d = new Date(date)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')

    return `${hh}:${mm}`
  }
}
