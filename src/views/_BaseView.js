export default class _BaseView {
  constructor (props = {}) {
    this.el = null

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
