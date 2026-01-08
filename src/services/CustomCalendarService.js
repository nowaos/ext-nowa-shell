import St from 'gi://St'

export class CustomCalendarService {
  #main
  #calendar
  #originalHeaderFormat
  #todayButton
  #callbacks = { onToday: [] }

  constructor (main) {
    this.#main = main
    this.#calendar = this.#main.panel.statusArea.dateMenu._calendar
  }
  enable () {
    this.#updateHeader(true)
    this.#insertTodayButton()
  }

  disable () {
    this.#updateHeader(false)
    this.#removeTodayButton()
  }

  onToday (callback) {
    this.#callbacks.onToday.push(callback)
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
        icon_name: 'calendar-today-symbolic'
      })
    })

    this.#todayButton.connect('clicked', () => {
      this.#callbacks.onToday.forEach(fn => fn())
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
}
