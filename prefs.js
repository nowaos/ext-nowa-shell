// SPDX-FileCopyrightText: Nowa Shell Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Adw from 'gi://Adw';

export default class NowaShellPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const page = new Adw.PreferencesPage({
      title: 'General',
      icon_name: 'dialog-information-symbolic',
    })

    const group = new Adw.PreferencesGroup({
      title: 'Nowa Shell',
      description: 'Modern GNOME Shell interface with rounded corners',
    })

    const infoRow = new Adw.ActionRow({
      title: 'Version 1.0',
      subtitle: 'Styling applied automatically via stylesheet.css',
    })

    group.add(infoRow)
    page.add(group)
    window.add(page)
  }
}
