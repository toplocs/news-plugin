// Plugin Development Environment
import { createPluginDevelopmentEnvironment, type PluginDevConfig } from '@toplocs/plugin-sdk';
import '@toplocs/plugin-sdk/style.css';

// Import plugin configuration and components
import pluginConfig from './src/index';
import SidebarComponent from './src/views/info/Sidebar.vue';
import ContentComponent from './src/views/settings/Content.vue';

// Create development environment with plugin configuration
const devConfig: PluginDevConfig = {
  pluginConfig,
  components: {
    Sidebar: SidebarComponent,
    Content: ContentComponent
  }
};

const app = createPluginDevelopmentEnvironment(devConfig);

app.mount('#plugin-dev');
