// Image slideshow (hero): each slide fades in over the previous one.
// Each .slideshow cycles its .slideshow__slide images every `data-interval` ms.
// Respects prefers-reduced-motion and pauses while the tab is hidden.
function initSlideshow(root) {
  const slides = Array.from(root.querySelectorAll(".slideshow__slide"));
  if (slides.length < 2) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const interval = Number(root.dataset.interval) || 2500;
  let index = slides.findIndex((s) => s.classList.contains("is-active"));
  if (index < 0) index = 0;
  let timer = null;

  const show = (next) => {
    slides.forEach((s) => s.classList.remove("is-prev"));
    slides[index].classList.replace("is-active", "is-prev");
    index = next;
    slides[index].classList.add("is-active");
  };

  // Advance to the next slide that has finished loading, so a hard cut
  // never lands on a blank frame on slow connections.
  const advance = () => {
    for (let step = 1; step < slides.length; step++) {
      const next = (index + step) % slides.length;
      if (slides[next].complete && slides[next].naturalWidth > 0) {
        show(next);
        return;
      }
    }
  };

  const start = () => {
    if (timer || reduceMotion.matches) return;
    timer = setInterval(advance, interval);
  };

  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  reduceMotion.addEventListener("change", () => {
    stop();
    if (reduceMotion.matches) show(0);
    else start();
  });

  start();
}

// Muted, looping videos marked [data-inview-autoplay] play only while on screen.
// They ship with `controls` and preload="none", so without JS (or with reduced
// motion) they stay as ordinary click-to-play videos and don't download up front.
function initInViewVideos(videos) {
  if (!videos.length || !("IntersectionObserver" in window)) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          target.play().catch(() => {});
        } else {
          target.pause();
        }
      });
    },
    { rootMargin: "200px 0px", threshold: 0.25 }
  );

  const apply = () => {
    videos.forEach((video) => {
      if (reduceMotion.matches) {
        observer.unobserve(video);
        video.pause();
        video.controls = true;
      } else {
        video.controls = false;
        video.preload = "metadata";
        observer.observe(video);
      }
    });
  };

  reduceMotion.addEventListener("change", apply);
  apply();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".slideshow").forEach(initSlideshow);
  initInViewVideos(Array.from(document.querySelectorAll("video[data-inview-autoplay]")));
});
