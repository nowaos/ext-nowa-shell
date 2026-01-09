export default class SignalManager {
  #signals = new Map()

  connectOn (target, ...args) {
    const signalId = target.connect(...args)

    if (!this.#signals.has(target)) {
      this.#signals.set(target, [])
    }

    this.#signals.get(target).push(signalId)

    return signalId
  }

  disconnectFrom (target) {
    const signalIds = this.#signals.get(target)

    if (signalIds) {
      signalIds.forEach(id => target.disconnect(id))
      this.#signals.delete(target)
    }
  }

  disconnectAll () {
    for (const [target, signalIds] of this.#signals) {
      signalIds.forEach(id => target.disconnect(id))
    }

    this.#signals.clear()
  }
}
