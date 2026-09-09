// Carrusel de testimonios. Todo lo hace CardCarousel; aquí sólo van los
// selectores de la ficha y la decisión de no pasar solo: son citas para leer,
// y en escritorio caben las tres en un slide, así que no se mueve nada.
class Testimonials extends CardCarousel {
  constructor(root) {
    super(root, {
      list: '.testimonials-list',
      card: '.testimonial-card',
      slide_class: 'testimonials-slide',
      single_class: 'testimonials-single',
      label: '.testimonial-card-name',
      interval: false
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.testimonials').forEach((root) => new Testimonials(root).start());
});
