const cards = document.querySelectorAll(".feature-card, .book-card, .hanzi-tile");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

cards.forEach((card, index) => {
  card.style.transitionDelay = `${Math.min(index * 45, 240)}ms`;
  revealObserver.observe(card);
});
