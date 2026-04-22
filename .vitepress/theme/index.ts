import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './custom.css';
import DoubleCrankAnimation from '../components/DoubleCrankAnimation.vue';
import DoubleRockerAnimation from '../components/DoubleRockerAnimation.vue';
import FourBarAnimation from '../components/FourBarAnimation.vue';
import ReciprocatingSliderCrankAnimation from '../components/ReciprocatingSliderCrankAnimation.vue';
import SphericalFourBarAnimation from '../components/SphericalFourBarAnimation.vue';
import YoutubeEmbed from '../components/YoutubeEmbed.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DoubleCrankAnimation', DoubleCrankAnimation);
    app.component('DoubleRockerAnimation', DoubleRockerAnimation);
    app.component('FourBarAnimation', FourBarAnimation);
    app.component('ReciprocatingSliderCrankAnimation', ReciprocatingSliderCrankAnimation);
    app.component('SphericalFourBarAnimation', SphericalFourBarAnimation);
    app.component('YoutubeEmbed', YoutubeEmbed);
  }
} satisfies Theme;
