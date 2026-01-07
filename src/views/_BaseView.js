export default class _BaseView {
  constructor (props = {}) {
    this.el = null

    Object.entries(props).forEach(([key, value]) => { this[key] = value })

    this.onCreate()
  }

  onCreate () {
    throw new Error('must be implemented.')
  }

  onDestroy () {
    this.el?.destroy?.()
  }
}
