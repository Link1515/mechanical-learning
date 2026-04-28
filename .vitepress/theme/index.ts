import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './custom.css';
import YoutubeEmbed from '../components/YoutubeEmbed.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('YoutubeEmbed', YoutubeEmbed);
  }
} satisfies Theme;
