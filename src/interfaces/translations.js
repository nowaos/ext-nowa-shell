import * as Gettext from 'gettext'

Gettext.textdomain('gnome-shell')

export function t (text) {
  return Gettext.gettext(text)
}
