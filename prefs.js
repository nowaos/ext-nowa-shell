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

    // Calendar group

    const group = new Adw.PreferencesGroup({
      title: 'Calendar',
    })

    const hideClocksRow = new Adw.ActionRow({
      title: 'Hide Clocks',
      subtitle: 'Hide World Clocks from the calendar',
    })

    const hideClocksSwitch = new Gtk.Switch({
      active: settings.get_boolean('hide-cal-clocks'),
      valign: Gtk.Align.CENTER,
    })

    settings.bind(
      'hide-cal-clocks',
      hideClocksSwitch,
      'active',
      Gio.SettingsBindFlags.DEFAULT
    )

    hideClocksRow.add_suffix(hideClocksSwitch)
    hideClocksRow.activatable_widget = hideClocksSwitch

    // ---

    const hideWeatherRow = new Adw.ActionRow({
      title: 'Hide Weather',
      subtitle: 'Hide Weather from the calendar',
    })

    const hideWeatherSwitch = new Gtk.Switch({
      active: settings.get_boolean('hide-cal-weather'),
      valign: Gtk.Align.CENTER,
    })

    settings.bind(
      'hide-cal-weather',
      hideWeatherSwitch,
      'active',
      Gio.SettingsBindFlags.DEFAULT
    )

    hideWeatherRow.add_suffix(hideWeatherSwitch)
    hideWeatherRow.activatable_widget = hideWeatherSwitch

    // ---

    group.add(hideClocksRow)
    group.add(hideWeatherRow)
    page.add(group)
    window.add(page)
  }
}
