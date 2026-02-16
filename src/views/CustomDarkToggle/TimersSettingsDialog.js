import St from 'gi://St'
import Clutter from 'gi://Clutter'
import * as ModalDialog from 'resource:///org/gnome/shell/ui/modalDialog.js'
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js'

import BaseView from '../_BaseView.js'

export default class TimersSettingsDialog extends BaseView {
  // props: sunsetTime, sunriseTime, isEnabled
  // callbacks: onSave(sunsetTime, sunriseTime, isEnabled)

  onCreate () {
    this._dialog = new ModalDialog.ModalDialog()
    this._isDisabled = false
    this._buildDialog()
  }

  onDestroy () {
    if (this._dialog) {
      this._dialog.destroy()
      this._dialog = null
    }
  }

  open () {
    this._isDisabled = !this.props.isEnabled

    this._updateInputsState()
    this._dialog.open()
  }

  close () {
    this._dialog.close()
  }

  _buildDialog () {
    const content = new St.BoxLayout({
      vertical: true,
      style_class: 'timers-dialog-content'
    })

    // Disable timers checkbox
    this._disableTimersItem = new PopupMenu.PopupMenuItem('Disable timers')
    this._disableTimersItem.setOrnament(PopupMenu.Ornament.NONE)

    this._disableTimersItem.connect('activate', () => {
      this._isDisabled = !this._isDisabled

      this._updateInputsState()
    })

    content.add_child(this._disableTimersItem)

    // Inputs container
    const inputsBox = new St.BoxLayout({
      vertical: true,
      style_class: 'timers-dialog-inputs'
    })

    // Sunset input
    const sunsetBox = new St.BoxLayout({
      style_class: 'timers-dialog-input-row'
    })

    const sunsetLabel = new St.Label({
      text: 'Sunset',
      y_align: Clutter.ActorAlign.CENTER
    })

    this._sunsetEntry = new St.Entry({
      text: this.props.sunsetTime,
      hint_text: 'HH:MM',
      can_focus: true
    })

    this._sunsetEntry.clutter_text.connect('key-focus-out', (field) => {
      if (field.has_focus) return

      this._sunsetEntry.text = this._fixDateInput(this._sunsetEntry.text)
    })

    sunsetBox.add_child(sunsetLabel)
    sunsetBox.add_child(this._sunsetEntry)
    inputsBox.add_child(sunsetBox)

    // Sunrise input
    const sunriseBox = new St.BoxLayout({
      style_class: 'timers-dialog-input-row'
    })

    const sunriseLabel = new St.Label({
      text: 'Sunrise',
      y_align: Clutter.ActorAlign.CENTER,
    })

    this._sunriseEntry = new St.Entry({
      text: this.props.sunriseTime,
      hint_text: 'HH:MM',
      can_focus: true
    })

    this._sunriseEntry.clutter_text.connect('key-focus-out', (field) => {
      if (field.has_focus) return

      this._sunriseEntry.text = this._fixDateInput(this._sunriseEntry.text)
    })

    sunriseBox.add_child(sunriseLabel)
    sunriseBox.add_child(this._sunriseEntry)
    inputsBox.add_child(sunriseBox)

    this._inputsBox = inputsBox
    content.add_child(inputsBox)

    this._dialog.contentLayout.add_child(content)

    // Buttons
    this._dialog.addButton({
      label: 'Cancel',
      action: () => this.close(),
      key: Clutter.KEY_Escape
    })

    this._dialog.addButton({
      label: 'Save',
      action: () => this._save(),
      default: true
    })
  }

  _updateInputsState () {
    this._disableTimersItem.setOrnament(this._isDisabled
      ? PopupMenu.Ornament.CHECK
      : PopupMenu.Ornament.NONE)

    this._inputsBox.opacity = this._isDisabled ? 100 : 255
    this._sunsetEntry.reactive = !this._isDisabled
    this._sunsetEntry.can_focus = !this._isDisabled

    this._sunriseEntry.reactive = !this._isDisabled
    this._sunriseEntry.can_focus = !this._isDisabled
  }

  _save () {
    const sunsetTime = this._fixDateInput(this._sunsetEntry.text.trim())
    const sunriseTime = this._fixDateInput(this._sunriseEntry.text.trim())

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/

    if (!this._isDisabled && (!timeRegex.test(sunsetTime) || !timeRegex.test(sunriseTime))) {
      return
    }

    if (this.props.onSave) {
      this.props.onSave(sunsetTime, sunriseTime, !this._isDisabled)
    }

    this.close()
  }

  _fixDateInput (text) {
    switch (text.length) {
      case 5:
        return text

      case 4:
        return text.replace(/(\d{2})(\d{2})/, "$1:$2")

      case 3:
        return text.replace(/(\d{1})(\d{2})/, "0$1:$2")

      case 2:
        return `${text}:00`

      case 1:
        return `0${text}:00`

      default:
        return text
    }
  }
}
