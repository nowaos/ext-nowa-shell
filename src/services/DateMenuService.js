import St from 'gi://St'
import { EventList } from '../views/EventList/index.js'

export class DateMenuService {
  #main
  #eventList

  constructor (main) {
    this.#main = main
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

  enable () {
    this.#eventList = new EventList(this.calendar)

    this.#reorder()
    this.#replaceEvents()
  }

  disable () {
    this.#undoReorder()
    this.#undoReplaceEvents()

    if (this.#eventList) {
      this.#eventList.destroy()

      this.#eventList = null
    }
  }

  #reorder () {
    const vbox = new St.BoxLayout({ vertical: true })

    this.#saveRemoveFromParent(this.todayButton)
    this.#saveRemoveFromParent(this.calendar)
    this.#saveRemoveFromParent(this.clocksItem)
    this.#saveRemoveFromParent(this.weatherItem)

    vbox.add_child(this.todayButton)
    vbox.add_child(this.calendar)
    vbox.add_child(this.clocksItem)
    vbox.add_child(this.weatherItem)

    this.todayButton.hide()

    this.messageList.get_parent().insert_child_at_index(vbox, 0)
  }

  #undoReorder () {
    const vbox = this.calendar.get_parent()

    this.#restoreOriginalParent(this.todayButton, 0)
    this.#restoreOriginalParent(this.calendar, 1)
    this.#restoreOriginalParent(this.clocksItem)
    this.#restoreOriginalParent(this.weatherItem)

    this.todayButton.show()

    vbox.get_parent().remove_child(vbox)
    vbox.destroy()
  }

  #saveRemoveFromParent (child) {
    const parent = child.get_parent()

    child._nowaOriginalParent = parent

    parent.remove_child(child)
  }

  #restoreOriginalParent (child, index = null) {
    const parent = child.get_parent()
    const originalParent = child._nowaOriginalParent

    if (!originalParent) return
    if (parent) parent.remove_child(child)

    if (index === null) {
      originalParent.add_child(child)

      return
    }

    originalParent.insert_child_at_index(child, index)
  }

  #getOriginalParentFrom (child) {
    return child._nowaOriginalParent
  }

  #replaceEvents () {
    this.#saveRemoveFromParent(this.eventsItem)
    this.#getOriginalParentFrom(this.eventsItem).add_child(this.#eventList.el)

    this.#eventList.setDate(new Date())
  }

  #undoReplaceEvents () {
    this.#getOriginalParentFrom(this.eventsItem).remove_child(this.#eventList.el)
    this.#restoreOriginalParent(this.eventsItem, 2)
  }
}
