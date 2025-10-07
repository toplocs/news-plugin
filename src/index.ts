/**
 * Main plugin entry point
 * This file defines the plugin configuration and exports it for use in TopLocs
 */

import type { BasePluginConfig } from '@toplocs/plugin-sdk'

const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '')

const pluginConfig: BasePluginConfig = {
  id: 'news_plugin',
  name: 'News',
  url: `${baseUrl}/plugin.js`,
  version: '1.0.0',
  description: 'Local news discovery and community journalism for TopLocs',
  author: 'TopLocs Team',
  slots: [
    { entity: 'Topic', page: 'Info', slot: 'Sidebar', component: 'InfoSidebar' },
    { entity: 'Topic', page: 'Settings', slot: 'Content', component: 'SettingsContent' },
    { entity: 'Location', page: 'Info', slot: 'Sidebar', component: 'InfoSidebar' },
    { entity: 'Location', page: 'Settings', slot: 'Content', component: 'SettingsContent' }
  ]
};

export default pluginConfig;
