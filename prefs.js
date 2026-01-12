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

    const calendarGroup = new Adw.PreferencesGroup({
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

    calendarGroup.add(hideClocksRow)
    calendarGroup.add(hideWeatherRow)

    // Notifications Group

    const notificationsGroup = new Adw.PreferencesGroup({
      title: 'Notifications',
      description: 'Configure notification behavior',
    })

    // Window demands attention focus
    const focusRow = new Adw.SwitchRow({
      title: 'Focus windows automatically',
      subtitle: 'Focus windows that demand attention instead of showing notification',
    })

    settings.bind(
      'window-demands-attention-focus',
      focusRow,
      'active',
      0 // Gio.SettingsBindFlags.DEFAULT
    )

    notificationsGroup.add(focusRow)

    // Dash to Dock theme

    const dashToDockGroup = new Adw.PreferencesGroup({
      title: 'Dash to Dock',
      description: 'Simplified appearance for Dash to Dock extension',
    })

    const dashTweaksRow = new Adw.SwitchRow({
      title: 'Simplify Dash to Dock',
      subtitle: 'Cleaner design: translucent background, no hover effects',
    })

    settings.bind(
      'enable-dash-to-dock-theme',
      dashTweaksRow,
      'active',
      0 // Gio.SettingsBindFlags.DEFAULT
    )

    dashToDockGroup.add(dashTweaksRow)

    // Page

    page.add(calendarGroup)
    page.add(notificationsGroup)
    page.add(dashToDockGroup)
    window.add(page)
  }
}
