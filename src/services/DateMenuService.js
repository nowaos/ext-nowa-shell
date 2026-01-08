import St from 'gi://St'

export class DateMenuService {
  #main
  #originalCalendarParent = null

  constructor (main) {
    this.#main = main
    this.#originalCalendarParent = this.calendar.get_parent()
  }

  get dateMenu () {
    return this.#main.panel.statusArea.dateMenu
  }

  get messageList () {
    return this.dateMenu._messageList
  }

  get todayButton () {
    return this.dateMenu._date
  }

  get calendar () {
    return this.dateMenu._calendar
  }

  get eventsItem () {
    return this.dateMenu._eventsItem
  }

  get clocksItem () {
    return this.dateMenu._clocksItem
  }

  get weatherItem () {
    return this.dateMenu._weatherItem
  }

  reorder () {
    const vbox = new St.BoxLayout({ vertical: true })

    this.todayButton.get_parent().remove_child(this.todayButton)
    this.calendar.get_parent().remove_child(this.calendar)
    this.clocksItem.get_parent().remove_child(this.clocksItem)
    this.weatherItem.get_parent().remove_child(this.weatherItem)

    vbox.add_child(this.todayButton)
    vbox.add_child(this.calendar)
    vbox.add_child(this.clocksItem)
    vbox.add_child(this.weatherItem)

    this.messageList.get_parent().insert_child_at_index(vbox, 0)
    this.todayButton.hide()
  }

  undoChanges () {
    const vbox = this.calendar.get_parent()

    vbox.remove_child(this.todayButton)
    vbox.remove_child(this.calendar)
    vbox.remove_child(this.clocksItem)
    vbox.remove_child(this.weatherItem)
    vbox.get_parent().remove_child(vbox)

    this.#originalCalendarParent.insert_child_at_index(this.todayButton, 0)
    this.#originalCalendarParent.insert_child_at_index(this.calendar, 1)
    this.#originalCalendarParent.add_child(this.clocksItem)
    this.#originalCalendarParent.add_child(this.weatherItem)

    this.todayButton.show()

    vbox.destroy()
  }
}
