<script setup>
  const props = defineProps({
    videoId: {
      type: String,
      required: true
    }
  })
</script>

<template>
  <div class="youtube-embed">
      <iframe class="youtube-embed__iframe" :src="`https://www.youtube.com/embed/${props.videoId}?mute=1`" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
  </div>
</template>

<style>
.youtube-embed {
  aspect-ratio: 16/9;
  margin-top: 1rem;
}

.youtube-embed__iframe {
  width: 100%;
  height: 100%;
}
</style>