// SPDX-FileCopyrightText: Nowa Shell Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'

import { Logger } from './src/services/Logger.js'

/**
 * Nowa Shell - GNOME Shell interface customizations
 *
 * Features:
 * - Modern rounded design for Quick Settings
 * - Calendar styling
 * - System buttons styling
 */
export default class NowaShellExtension extends Extension {
  #modules = []

  enable () {
    Logger.log('Nowa Shell: === Extension Enabled ===')
  }

  disable () {
    Logger.log('Nowa Shell: === Extension Disabled ===')
  }
}
