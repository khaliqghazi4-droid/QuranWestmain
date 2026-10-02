// afterInteractive scripts run after DOMContentLoaded — call directly
(function init() {

  // Marquee swiper — continuous auto-scroll, no pause
  if (document.querySelector(".marquee-swiper")) {
    new Swiper(".marquee-swiper", {
      slidesPerView: "auto",
      spaceBetween: 30,
      loop: true,
      speed: 4000,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
      },
      allowTouchMove: false,
    });
  }

  // Testimonial swiper
  if (document.querySelector(".testimonial-swiper")) {
    new Swiper(".testimonial-swiper", {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".testimonial-btn-next1",
        prevEl: ".testimonial-btn-prev1",
      },
      pagination: {
        el: ".testimonial-pagination",
        clickable: true,
      },
    });
  }

  // Brand logo swiper
  if (document.querySelector(".brand-logo-swiper")) {
    new Swiper(".brand-logo-swiper", {
      slidesPerView: "auto",
      spaceBetween: 40,
      loop: true,
      speed: 3000,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
      },
      allowTouchMove: false,
    });
  }

})();
