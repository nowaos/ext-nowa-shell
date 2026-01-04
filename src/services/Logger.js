// SPDX-FileCopyrightText: Nowa Shell Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Logger service - Simple logging utilities
 */
export class Logger {
  static log (message, ...args) {
    console.log(`Nowa Shell: ${message}`, ...args)
  }

  static debug (module, message) {
    console.log(`Nowa Shell [${module}]: ${message}`)
  }

  static error (module, message) {
    console.error(`Nowa Shell [${module}]: ${message}`)
  }
}
