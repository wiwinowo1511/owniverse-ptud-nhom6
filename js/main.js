
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.index-hero_carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.index-hero_track');
  const slides = Array.from(carousel.querySelectorAll('.index-hero_slide'));
  const indicators = Array.from(carousel.querySelectorAll('.index-hero_dot'));
  if (!track || slides.length === 0 || indicators.length === 0) return;

  const slideCount = Math.min(slides.length, indicators.length);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentSlideIndex = 0;
  let autoplayTimer = null;
  let paused = false;

  function updateCarousel(index) {
    currentSlideIndex = (index + slideCount) % slideCount;
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

    indicators.forEach((indicator, indicatorIndex) => {
      const isActive = indicatorIndex === currentSlideIndex;
      indicator.classList.toggle('is-active', isActive);
      indicator.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function stopAutoplay() {
    if (autoplayTimer !== null) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    if (prefersReducedMotion || paused || document.hidden) return;

    autoplayTimer = window.setInterval(() => {
      updateCarousel(currentSlideIndex + 1);
    }, 5000);
  }

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      updateCarousel(index);
      startAutoplay();
    });
  });

  carousel.addEventListener('mouseenter', () => {
    paused = true;
    stopAutoplay();
  });

  carousel.addEventListener('mouseleave', () => {
    paused = false;
    startAutoplay();
  });

  carousel.addEventListener('focusin', () => {
    paused = true;
    stopAutoplay();
  });

  carousel.addEventListener('focusout', () => {
    paused = carousel.matches(':hover');
    if (!paused) startAutoplay();
  });

  document.addEventListener('visibilitychange', startAutoplay);
  updateCarousel(0);
  startAutoplay();
});
