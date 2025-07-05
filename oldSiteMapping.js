// old site: https://tsscqson7.webnode.tw/
const newSiteBase = 'mechanical-learning';
const newSiteDomain = 'https://link1515.github.io';

const linkMap = {
  '/': '/',
  // 聯絡我們
  '/%e8%81%af%e7%b5%a1%e6%88%91%e5%80%91/': '/about-project.html',
  // 連桿機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/': '/linkage/four-bar/home.html',
  // 四連桿機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e5%9b%9b%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/':
    '/linkage/four-bar/home.html',
  // 曲柄滑塊機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e5%9b%9b%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e6%9b%b2%e6%9f%84%e6%90%96%e6%a1%bf%e6%a9%9f%e6%a7%8b/':
    '/linkage/four-bar/crank-rocker.html',
  // 雙曲柄機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e5%9b%9b%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e9%9b%99%e6%9b%b2%e6%9f%84%e6%a9%9f%e6%a7%8b/':
    '/linkage/four-bar/double-crank.html',
  // 雙搖桿機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e5%9b%9b%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e9%9b%99%e6%90%96%e6%a1%bf%e6%a9%9f%e6%a7%8b/':
    '/linkage/four-bar/double-rocker.html',
  // 滑塊曲柄機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e6%bb%91%e5%a1%8a%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/':
    '/linkage/slider-crank/home.html',
  // 往復滑塊機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e6%bb%91%e5%a1%8a%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e5%be%80%e5%be%a9%e6%bb%91%e5%a1%8a%e6%a9%9f%e6%a7%8b/':
    '/linkage/slider-crank/reciprocating.html',
  // 迴轉滑塊曲柄機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e6%bb%91%e5%a1%8a%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e8%bf%b4%e8%bd%89%e6%bb%91%e5%a1%8a%e6%9b%b2%e6%9f%84%e6%a9%9f%e6%a7%8b/':
    '/linkage/slider-crank/revolving.html',
  // 擺動滑塊曲柄機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e6%bb%91%e5%a1%8a%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e6%93%ba%e5%8b%95%e6%bb%91%e5%a1%8a%e6%9b%b2%e6%9f%84%e5%bc%95%e6%93%8e/':
    '/linkage/slider-crank/oscillating.html',
  // 固定滑塊曲柄機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e6%bb%91%e5%a1%8a%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e5%9b%ba%e5%ae%9a%e6%bb%91%e5%a1%8a%e6%9b%b2%e6%9f%84%e6%a9%9f%e6%a7%8b/':
    '/linkage/slider-crank/fixed.html',
  // 其他機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e5%85%b6%e4%bb%96%e6%a9%9f%e6%a7%8b/':
    '/linkage/others/double-slider.html',
  // 雙滑塊機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e5%85%b6%e4%bb%96%e6%a9%9f%e6%a7%8b/%e9%9b%99%e6%bb%91%e5%a1%8a%e6%a9%9f%e6%a7%8b/':
    '/linkage/others/double-slider.html',
  // 等腰連桿機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e5%85%b6%e4%bb%96%e6%a9%9f%e6%a7%8b/%e7%ad%89%e8%85%b0%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/':
    '/linkage/others/isosceles-slider-crank.html',
  // 平行相等曲柄機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e5%85%b6%e4%bb%96%e6%a9%9f%e6%a7%8b/%e5%b9%b3%e8%a1%8c%e7%9b%b8%e7%ad%89%e6%9b%b2%e6%9f%84%e6%a9%9f%e6%a7%8b/':
    '/linkage/others/parallel-equal-crank.html',
  // 相等曲柄機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e5%85%b6%e4%bb%96%e6%a9%9f%e6%a7%8b/%e7%9b%b8%e7%ad%89%e6%9b%b2%e6%9f%84%e6%a9%9f%e6%a7%8b/':
    '/linkage/others/non-parallel-equal-crank.html',
  // 肘節機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e5%85%b6%e4%bb%96%e6%a9%9f%e6%a7%8b/%e8%82%98%e7%af%80%e6%a9%9f%e6%a7%8b/':
    '/linkage/others/toggle.html',
  // 比例運動機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e5%85%b6%e4%bb%96%e6%a9%9f%e6%a7%8b/%e6%af%94%e4%be%8b%e9%81%8b%e5%8b%95%e6%a9%9f%e6%a7%8b/':
    '/linkage/others/pantograph.html',
  // 球面四連桿機構
  '/%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/%e5%85%b6%e4%bb%96%e6%a9%9f%e6%a7%8b/%e7%90%83%e9%9d%a2%e5%9b%9b%e9%80%a3%e6%a1%bf%e6%a9%9f%e6%a7%8b/':
    '/linkage/others/spherical-4-bar.html',
  // 線條繪製機構
  '/%e7%b7%9a%e6%a2%9d%e7%b9%aa%e8%a3%bd/': '/draw-line/straight-line.html',
  // 直線
  '/%e7%b7%9a%e6%a2%9d%e7%b9%aa%e8%a3%bd/%e7%9b%b4%e7%b7%9a/':
    '/draw-line/straight-line.html',
  // 圓
  '/%e7%b7%9a%e6%a2%9d%e7%b9%aa%e8%a3%bd/%e5%9c%93/': '/draw-line/circle.html',
  // 拋物線
  '/%e7%b7%9a%e6%a2%9d%e7%b9%aa%e8%a3%bd/%e6%8b%8b%e7%89%a9%e7%b7%9a/':
    '/draw-line/parabola.html',
  // 橢圓
  '/%e7%b7%9a%e6%a2%9d%e7%b9%aa%e8%a3%bd/%e6%a9%a2%e5%9c%93/':
    '/draw-line/ellipse.html',
  // 雙曲線
  '/%e7%b7%9a%e6%a2%9d%e7%b9%aa%e8%a3%bd/%e9%9b%99%e6%9b%b2%e7%b7%9a/':
    '/draw-line/hyperbola.html',
  // 其他
  '/%e7%b7%9a%e6%a2%9d%e7%b9%aa%e8%a3%bd/%e5%85%b6%e4%bb%96/':
    '/draw-line/others.html'
};

const currentPath = location.pathname;
const newPath = linkMap[currentPath];
if (newPath) {
  location.href = `${newSiteDomain}/${newSiteBase}${newPath}`;
} else {
  location.href = `${newSiteDomain}/${newSiteBase}`;
}
