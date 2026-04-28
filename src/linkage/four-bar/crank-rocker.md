<script setup>
import FourBarAnimation from '~/components/animation/FourBarAnimation.vue';
</script>

# 曲柄搖桿機構<br />(Crank-Rocker Mechanism)

<FourBarAnimation />

## 構成條件

- 曲柄 `AB` 為最短桿
- 最短桿加上對偶桿（相鄰桿）之一小於另外兩桿之和

::: tip
AB + BC < CD + AD

AB + AD < BC + CD
:::

![曲柄搖桿機構](/images/linkage/曲柄搖桿機構.jpg)

## 實際應用

- [腳踏縫紉機](/linkage/four-bar/examples/sewing-machine)
- [拉坯機](/linkage/four-bar/examples/potter-wheel)
- 人踩腳踏車
- 灰漿攪拌機
- 橢圓滑步機
