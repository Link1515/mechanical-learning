<script setup>
import DoubleCrankAnimation from '~/components/animation/DoubleCrankAnimation.vue';
</script>

# 雙曲柄機構<br />(Double Crank Mechanism)

<DoubleCrankAnimation />

## 構成條件

- 固定桿 `AD` 為最短桿
- 最短桿加上對偶桿（相鄰桿）之一小於另外兩桿之和

::: tip
AD + CD < AB + BC

AD + AB < CD + BC
:::

![雙曲柄機構](/images/linkage/雙曲柄機構.jpg)

## 實際應用

- [插床急回機構](/linkage/four-bar/examples/shaper-rapid-return)
