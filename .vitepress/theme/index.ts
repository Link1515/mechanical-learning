import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './custom.css';
import FourBarAnimation from '../components/FourBarAnimation.vue';
import YoutubeEmbed from '../components/YoutubeEmbed.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('FourBarAnimation', FourBarAnimation);
    app.component('YoutubeEmbed', YoutubeEmbed);
  }
} satisfies Theme;
