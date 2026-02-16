import * as Main from 'resource:///org/gnome/shell/ui/main.js'

export default class BaseView {
  constructor (props = {}) {
    this.el = null
    this.main = Main
    this.props = props

    Object.entries(props).forEach(([key, value]) => { this[key] = value })

    this.onCreate()
  }

  destroy () {
    this.onDestroy()
  }

  onCreate () {
    throw new Error('must be implemented.')
  }

  onDestroy () {}
}
