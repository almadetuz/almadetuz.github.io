// Carrusel de testimonios. Todo lo hace CardCarousel; aquí sólo van los
// selectores de la ficha y el ritmo, el mismo que el de las canciones. En
// escritorio las tres caben en la ventana, así que ahí no se mueve nada.
const TESTIMONIALS_INTERVAL = 4000;
class Testimonials extends CardCarousel {
  constructor(root) {
    super(root, {
      list: '.testimonials-list',
      card: '.testimonial-card',
      single_class: 'testimonials-single',
      label: '.testimonial-card-name',
      interval: TESTIMONIALS_INTERVAL
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.testimonials').forEach((root) => new Testimonials(root).start());
});
