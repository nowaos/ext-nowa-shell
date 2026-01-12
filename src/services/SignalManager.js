export default class SignalManager {
  #signals = new Map()                    // Map<target, signalId[]>
  #namedSignals = new Map()               // Map<key, { target, signalId, args }>
  #namedSignalsByTarget = new Map()       // Map<target, Set<key>>

  connectOn (target, ...args) {
    const signalId = target.connect(...args)

    if (!this.#signals.has(target)) {
      this.#signals.set(target, [])
    }

    this.#signals.get(target).push(signalId)

    return signalId
  }

  connectAs (key, target, ...args) {
    if (this.#namedSignals.has(key)) {
      this.remove(key)
    }

    const signalId = target.connect(...args)

    this.#namedSignals.set(key, { target, signalId, args })

    if (!this.#namedSignalsByTarget.has(target)) {
      this.#namedSignalsByTarget.set(target, new Set())
    }
    this.#namedSignalsByTarget.get(target).add(key)

    return signalId
  }

  pause (key) {
    const signal = this.#namedSignals.get(key)

    if (!signal || !signal.signalId) {
      return
    }

    signal.target.disconnect(signal.signalId)
    signal.signalId = null
  }

  resume (key) {
    const signal = this.#namedSignals.get(key)

    if (!signal || signal.signalId !== null) {
      return
    }

    signal.signalId = signal.target.connect(...signal.args)
  }

  isPaused (key) {
    const signal = this.#namedSignals.get(key)

    return signal ? signal.signalId === null : false
  }

  isConnected (key) {
    const signal = this.#namedSignals.get(key)

    return signal ? signal.signalId !== null : false
  }

  has (key) {
    return this.#namedSignals.has(key)
  }

  remove (key) {
    const signal = this.#namedSignals.get(key)

    if (!signal) {
      return
    }

    if (signal.signalId !== null) {
      signal.target.disconnect(signal.signalId)
    }

    const targetKeys = this.#namedSignalsByTarget.get(signal.target)
    if (targetKeys) {
      targetKeys.delete(key)

      if (targetKeys.size === 0) {
        this.#namedSignalsByTarget.delete(signal.target)
      }
    }

    this.#namedSignals.delete(key)
  }

  disconnectFrom (target) {
    const signalIds = this.#signals.get(target)

    if (signalIds) {
      signalIds.forEach(id => target.disconnect(id))

      this.#signals.delete(target)
    }

    const keys = this.#namedSignalsByTarget.get(target)

    if (keys) {
      keys.forEach(key => {
        const signal = this.#namedSignals.get(key)

        if (signal && signal.signalId !== null) {
          signal.target.disconnect(signal.signalId)
        }

        this.#namedSignals.delete(key)
      })
      this.#namedSignalsByTarget.delete(target)
    }
  }

  disconnectAll () {
    for (const [target, signalIds] of this.#signals) {
      signalIds.forEach(id => target.disconnect(id))
    }
    this.#signals.clear()

    for (const [key, signal] of this.#namedSignals) {
      if (signal.signalId !== null) {
        signal.target.disconnect(signal.signalId)
      }
    }

    this.#namedSignals.clear()
    this.#namedSignalsByTarget.clear()
  }
}
