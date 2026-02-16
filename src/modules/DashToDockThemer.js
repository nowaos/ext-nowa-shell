import Gio from 'gi://Gio'
import St from 'gi://St'

import BaseModule from './_BaseModule.js'

/**
 * Dash to Dock Tweaks
 *
 * Simplifies Dash to Dock appearance by loading custom CSS
 */
export class DashToDockThemer extends BaseModule {
  #themeContext
  #appliedTheme

  constructor (...args) {
    super(...args)

    this.#themeContext = St.ThemeContext.get_for_stage(global.stage)
  }

  enable () {
    // Connect to settings changes
    this.signalManager.connectOn(this.settings, 'changed::enable-dash-to-dock-theme', () => {
      this.#onSettingChanged()
    })

    // Apply initial state
    this.#onSettingChanged()
  }

  disable () {
    // Disconnect settings
    this.signalManager.disconnectAll()

    // Remove styles
    this.#removeStyles()
  }

  #onSettingChanged () {
    const isEnabled = this.settings.get_boolean('enable-dash-to-dock-theme')

    if (isEnabled) {
      this.#applyStyles()
    } else {
      this.#removeStyles()
    }
  }

  #applyStyles () {
    if (this.#appliedTheme) {
      this.log('Styles already applied, skipping')

      return
    }

    const theme = this.#themeContext.get_theme()
    const stylesheetFile = this.#getStylesheetFile()

    if (!stylesheetFile.query_exists(null)) {
      this.log(`File NOT found: ${stylesheetFile.get_path()}`)

      return
    }

    theme.load_stylesheet(stylesheetFile)
    this.#appliedTheme = theme
  }

  #removeStyles () {
    if (!this.#appliedTheme) {
      this.log('No styles to remove')

      return
    }

    const stylesheetFile = this.#getStylesheetFile()

    this.#appliedTheme.unload_stylesheet(stylesheetFile)
    this.#appliedTheme = null
  }

  #getStylesheetFile () {
    const stylesheetPath = `${this.dir.get_path()}/assets/dash-to-dock-theme.css`

    return Gio.File.new_for_path(stylesheetPath)
  }
}
