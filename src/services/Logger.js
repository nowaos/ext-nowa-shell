/**
 * Logger - Simple logging utilities
 */
export default class Logger {
  static log (message, ...args) {
    console.log(`Nowa Shell: ${message}`, ...args)
  }

  static error (message, e) {
    console.error(`Nowa Shell: ${message}`, e)
  }

  static debug (module, message) {
    console.log(`Nowa Shell [${module}]: ${message}`)
  }
}
