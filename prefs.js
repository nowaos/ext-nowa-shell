// SPDX-FileCopyrightText: Nowa Shell Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';

export default class NowaShellPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings()

    const page = new Adw.PreferencesPage({
      title: 'General',
      icon_name: 'dialog-information-symbolic',
    })

    const group = new Adw.PreferencesGroup({
      title: 'Calendar',
    })

    // Minify Calendar toggle
    const minifyCalendarRow = new Adw.ActionRow({
      title: 'Minify Calendar',
      subtitle: 'Hide World Clocks and Weather sections',
    })

    const minifyCalendarSwitch = new Gtk.Switch({
      active: settings.get_boolean('minify-calendar'),
      valign: Gtk.Align.CENTER,
    })

    settings.bind(
      'minify-calendar',
      minifyCalendarSwitch,
      'active',
      Gio.SettingsBindFlags.DEFAULT
    )

    minifyCalendarRow.add_suffix(minifyCalendarSwitch)
    minifyCalendarRow.activatable_widget = minifyCalendarSwitch

    group.add(minifyCalendarRow)
    page.add(group)
    window.add(page)
  }
}
