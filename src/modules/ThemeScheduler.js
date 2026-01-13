import Gio from 'gi://Gio'
import GLib from 'gi://GLib'

import { _BaseModule } from './_BaseModule.js'
import { CustomDarkToggle } from '../views/CustomDarkToggle/index.js'

/**
* ThemeScheduler module - automatically switches between light/dark theme based on time
*/
export class ThemeScheduler extends _BaseModule {
  #interfaceSettings
  #layoutManager
  #alignmentTimer
  #themeCheckTimer
  #manuallySet = false
  #applying = false
  #customToggle

  constructor (...args) {
    super(...args)

    this.#interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface'})
    this.#layoutManager = this.main.layoutManager
  }

  get isEnabled () {
    return this.settings.get_boolean('enable-theme-timers')
  }

  enable () {
    this.signalManager.connectAs('manuallySet',
      this.#interfaceSettings, 'changed::color-scheme', () => this.#manuallySet = true
    )

    this.signalManager.connectOn(this.settings, 'changed::enable-theme-timers', () => {
      if (this.isEnabled) {
        this.#manuallySet = true

        this.#watchTime()
      } else {
        this.#unwatchTime()
      }
    })

    this.signalManager.connectOn(this.#layoutManager, 'startup-complete', () => {
      this.log('Startup complete, checking theme...')

      this.#checkAndApply()
    })

    if (this.isEnabled) {
      this.#watchTime()
    }

    this.#replaceToggle()
  }

  disable () {
    this.#unwatchTime()
    this.signalManager.disconnectAll()

    this.#restoreToggle()
    this.#interfaceSettings = null
    this.#manuallySet = true
  }

  #watchTime () {
    if (this.#themeCheckTimer) this.#unwatchTime()

    const TICK_DELAY = 1
    const now = new Date()
    const secondsUntilNextMinute = 60 - now.getSeconds() + TICK_DELAY

    this.#alignmentTimer = GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      secondsUntilNextMinute,
      () => {
        this.#checkAndApply()

        this.#themeCheckTimer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
          this.#checkAndApply()
          return GLib.SOURCE_CONTINUE
        })

        return GLib.SOURCE_REMOVE
      }
    )
  }

  #unwatchTime () {
    if (this.#alignmentTimer) {
      GLib.Source.remove(this.#alignmentTimer)

      this.#alignmentTimer = null
    }

    if (this.#themeCheckTimer) {
      GLib.Source.remove(this.#themeCheckTimer)

      this.#themeCheckTimer = null
    }
  }

  #checkAndApply () {
    if (this.#applying) return

    this.#applying = true

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeInMinutes = currentHour * 60 + currentMinute

    // Parse sunrise time (HH:MM)
    const sunriseTime = this.settings.get_string('sunrise-time')
    const [sunriseHour, sunriseMinute] = sunriseTime.split(':').map(n => parseInt(n))
    const sunriseInMinutes = sunriseHour * 60 + sunriseMinute

    // Parse sunset time (HH:MM)
    const sunsetTime = this.settings.get_string('sunset-time')
    const [sunsetHour, sunsetMinute] = sunsetTime.split(':').map(n => parseInt(n))
    const sunsetInMinutes = sunsetHour * 60 + sunsetMinute

    // Determine if it's day or night
    const isDayTime = currentTimeInMinutes >= sunriseInMinutes && currentTimeInMinutes < sunsetInMinutes

    const currentTheme = this.#interfaceSettings.get_string('color-scheme')

    // IMPORTANT: Use 'default' for light theme, not 'prefer-light'
    // 'prefer-light' forces light theme on Shell (Calendar/QS), 'default' doesn't
    const targetTheme = isDayTime ? 'default' : 'prefer-dark'

    // If manually set, only change if we crossed a transition time
    if (this.#manuallySet) {
      // Check if we just crossed sunrise or sunset
      const lastCheckMinutes = currentTimeInMinutes - 1

      const crossedSunrise = lastCheckMinutes < sunriseInMinutes && currentTimeInMinutes >= sunriseInMinutes
      const crossedSunset = lastCheckMinutes < sunsetInMinutes && currentTimeInMinutes >= sunsetInMinutes

      if (crossedSunrise || crossedSunset) {
        this.#manuallySet = false

        this.log('Transition time reached, resetting manual flag')
      } else { // Respect manual choice
        this.#applying = false

        return
      }
    }

    if (currentTheme !== targetTheme) {
      this.signalManager.pause('manuallySet')

      this.#interfaceSettings.set_string('color-scheme', targetTheme)

      if (this.isEnabled) {
        this.signalManager.resume('manuallySet')
      }
    }

    this.#applying = false
  }

  #replaceToggle () {
    this.#customToggle = new CustomDarkToggle({
      settings: this.settings
    })

    this.#customToggle.replace()
  }

  #restoreToggle () {
    if (this.#customToggle) {
      this.#customToggle.destroy()

      this.#customToggle = null
    }
  }
}
