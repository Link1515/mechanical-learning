---
prev:
  text: '等腰連桿機構'
  link: '/linkage/others/isosceles-slider-crank'
next: false
---

# 橢圓規

- [相關頁面 - 畫橢圓機構](/draw-line/ellipse)

<YoutubeEmbed video-id="FJcKD183y1g" />

![橢圓機構](/images/linkage/橢圓機構.jpg)

`A`、`B` 為滑塊位置，`M` 為 `AB` 之中點，曲柄為 `OM`，連桿為 `MA`、`MB`，由三角形 `OAB` 可知 `M` 為外心，外心到三端點等距，所以 $OM=MA=MB$（曲柄長度等於連桿長度），且 `OM` 在橢圓規轉動時距離不變，運動軌跡為一圓。

若以順時鐘而言，`A` 滑塊將會向上邊滑動，`B` 滑塊向右滑動，`P` 點則會逐漸向橢圓右邊的長軸頂點移動，當 `A` 點和 `O` 點重合時，`P` 點正好會和右邊長軸頂點重合。

繼續轉動 `A` 仍然向上滑動，`B` 則變為向左滑動，`P` 點會逐漸靠向橢圓下方的短軸頂點，當 `B` 點和 `O` 點重合時，`P` 點會正好在下方短軸頂點重合。以此類推，持續轉動則可畫出一個橢圓。

## 橢圓公式

![橢圓機構_2](/images/linkage/橢圓機構_2.jpg)

`AP` 長度為 `ａ`，`BP` 長度為 `b`，`θ` 為 `BP` 與水平線之夾角，以 `O` 為原點 (0，0)，則可知 `P` 點位置為 $(acosθ，bsinθ)$，$X = acosθ$，$Y = bsinθ$

$$
因為 \sin^2\theta + \cos^2\theta = 1
$$

$$
可以推得橢圓標準式 {x^2 \over a^2} + {y^2 \over b^2} = 1
$$

![橢圓機構_4](/images/linkage/橢圓機構_4.jpg)

![橢圓機構_3](/images/linkage/橢圓機構_3.jpg)

## 3D 列印成品

![橢圓機構_3D列印](/images/linkage/橢圓機構_3D列印.jpg)

## 相關影片

<YoutubeEmbed video-id="gnJSN0T4AUw" />
<YoutubeEmbed video-id="0h0ofdDauQE" />
<YoutubeEmbed video-id="n59bLDYTEFE" />
<YoutubeEmbed video-id="TaraJQHhGNA" />
<YoutubeEmbed video-id="VK0hndCKo8o" />
<YoutubeEmbed video-id="HPJgUTGt6Ig" />
