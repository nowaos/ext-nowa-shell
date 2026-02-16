import * as Gettext from 'gettext'

Gettext.textdomain('gnome-shell')

export function gettext (text) {
  return Gettext.gettext(text)
}
