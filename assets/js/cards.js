// Base de los carruseles de fichas del sitio.
//
// Las fichas van en una tira dentro de una ventana: tres a la vista en
// escritorio, una en móvil. Cada paso corre la tira una sola ficha, así que por
// un lado aparece una y por el otro se esconde otra, y da igual cuántas fichas
// haya: no tienen que ser múltiplo de nada. Como la tira las lleva todas a la
// vez, la ventana mide lo que la ficha más alta y lo que hay debajo no se mueve
// al cambiar de ficha.
//
// El bucle no tiene costura: la tira lleva copias de las últimas fichas delante
// y de las primeras detrás, y cuando el paso cae en una copia, al acabar la
// animación se salta sin animación a la ficha de verdad. Quien tenga principio
// y final (`wrap: false`) se queda sin copias y con las flechas apagadas en los
// extremos.
//
// No se inicializa sola: cada carrusel concreto la extiende y arranca lo suyo.
// Sin JS la lista se queda donde está, en rejilla, y el carrusel no aparece.
const CARDS_DESKTOP = '(min-width: 768px)';
const CARDS_VISIBLE = 3;
// Lo mismo que la transición de `.cards-track` en `cards.scss`.
const CARDS_DURATION = 500;
// Píxeles de arrastre a partir de los cuales un gesto cuenta como paso.
const CARDS_SWIPE = 40;

class CardCarousel {
  // options:
  //   list          selector de la lista plana de fichas
  //   card          selector de cada ficha dentro de la lista
  //   single_class  clase que marca "todo cabe en la ventana"
  //   label         selector, dentro de la ficha, del texto para el aria-label
  //   interval      ms entre fichas, o false para no pasar solo
  //   wrap          false para que la tira tenga principio y final
  constructor(root, options) {
    this.root = root;
    this.options = options;
    this.track = root.querySelector(options.list);
    this.carousel_el = root.querySelector('.carousel');
    this.window_el = this.carousel_el.querySelector('.carousel-inner');
    this.indicators = this.carousel_el.querySelector('.carousel-indicators');
    this.prev_el = this.carousel_el.querySelector('.carousel-control-prev');
    this.next_el = this.carousel_el.querySelector('.carousel-control-next');
    this.wrap = options.wrap !== false;
    this.desktop = window.matchMedia(CARDS_DESKTOP);
    this.cards = Array.from(this.track.querySelectorAll(options.card));
    this.clones = [];
    // Ficha de la izquierda de la ventana. Sobrevive a un rebuild, que es lo
    // que deja a la lectora donde estaba cuando cambia el ancho.
    this.index = 0;
    this.visible = 1;
    this.shift = 0;
    this.single = true;
    this.sliding = false;
    this.timer = null;
  }

  start() {
    if (!this.cards.length) {
      return;
    }
    // La lista pasa a ser la tira: las fichas no se mueven de sitio, sólo
    // cambia el sitio de la lista entera.
    this.window_el.appendChild(this.track);
    this.track.classList.add('cards-track');
    this.carousel_el.hidden = false;
    this.bind();
    this.build();
  }

  bind() {
    this.desktop.addEventListener('change', () => this.build());
    // Las posiciones se miden en píxeles, así que un cambio de ancho las
    // invalida aunque no se cruce el breakpoint.
    window.addEventListener('resize', () => this.place(false));

    // Los eventos van con cada gesto, aunque el carrusel lo ignore porque aún
    // está animando: miden la intención, no el movimiento. El paso automático
    // no pasa por aquí y no manda nada.
    this.prev_el.addEventListener('click', () => {
      AdtEngagement.send('CarouselArrow', this.carousel_el, { direction: 'left' });
      this.step(-1);
    });
    this.next_el.addEventListener('click', () => {
      AdtEngagement.send('CarouselArrow', this.carousel_el, { direction: 'right' });
      this.step(1);
    });

    // Con el ratón o el foco dentro no se pasa solo, que si no se va justo
    // cuando la lectora se para a mirar.
    this.carousel_el.addEventListener('mouseenter', () => this.pause());
    this.carousel_el.addEventListener('mouseleave', () => this.cycle());
    this.carousel_el.addEventListener('focusin', () => this.pause());
    this.carousel_el.addEventListener('focusout', (e) => {
      if (!this.carousel_el.contains(e.relatedTarget)) {
        this.cycle();
      }
    });

    // En una pestaña de fondo el navegador estira los temporizadores, así que
    // el paso automático se quedaría a medias durante minutos. Mejor pararlo y
    // seguir al volver.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.cycle();
      }
    });

    let touch_x = null;
    this.window_el.addEventListener('touchstart', (e) => {
      touch_x = e.touches[0].clientX;
    }, { passive: true });
    this.window_el.addEventListener('touchend', (e) => {
      if (touch_x === null) {
        return;
      }
      const moved = e.changedTouches[0].clientX - touch_x;
      touch_x = null;
      if (Math.abs(moved) > CARDS_SWIPE) {
        AdtEngagement.send('CarouselSwipe', this.carousel_el, { direction: AdtEngagement.swipeDirection(moved) });
        this.step(moved < 0 ? 1 : -1);
      }
    }, { passive: true });

    // Dar el foco a una ficha de fuera de la ventana desplazaría la caja y
    // descuadraría la tira. `inert` lo evita donde hay soporte; esto lo
    // deshace donde no.
    this.window_el.addEventListener('scroll', () => {
      this.window_el.scrollLeft = 0;
    });
  }

  // Cuántas fichas caben a la vez, y con eso las copias, los puntitos y el
  // sitio de la tira. Se rehace al cruzar el breakpoint.
  build() {
    this.pause();
    this.visible = this.desktop.matches ? CARDS_VISIBLE : 1;
    this.single = this.cards.length <= this.visible;
    this.track.style.setProperty('--cards-visible', this.visible);
    this.carousel_el.classList.toggle(this.options.single_class, this.single);
    // Con copias, la ficha 0 está a `visible` de distancia del principio de la
    // tira; sin ellas, la tira empieza en la ficha 0.
    this.shift = this.single || !this.wrap ? 0 : this.visible;
    this.index = Math.min(this.index, this.maxIndex());
    this.buildClones();
    // Las copias nacen aquí, después de que engagement.js haya mirado la
    // página, y se rehacen al cruzar el breakpoint. Llevan los mismos
    // atributos que su ficha, así que una copia vista cuenta como la ficha.
    AdtEngagement.observe(this.carousel_el);
    this.buildIndicators();
    this.place(false);
    this.cycle();
  }

  // La última ficha a la que se puede ir: con bucle, cualquiera; sin él, la
  // última ventana completa.
  maxIndex() {
    return this.wrap ? this.cards.length - 1 : Math.max(0, this.cards.length - this.visible);
  }

  buildClones() {
    this.clones.forEach((clone) => clone.remove());
    this.clones = [];
    if (this.single || !this.wrap) {
      return;
    }
    this.cards.slice(-this.visible).forEach((card) => {
      this.track.insertBefore(this.clone(card), this.cards[0]);
    });
    this.cards.slice(0, this.visible).forEach((card) => {
      this.track.appendChild(this.clone(card));
    });
  }

  clone(card) {
    const copy = card.cloneNode(true);
    copy.classList.add('cards-clone');
    copy.setAttribute('aria-hidden', 'true');
    // La copia se puede pulsar, porque en pantalla es una ficha más, pero no se
    // tabula ni se lee: la de verdad ya está en la tira.
    copy.querySelectorAll('button, a').forEach((el) => {
      el.tabIndex = -1;
    });
    this.clones.push(copy);
    return copy;
  }

  buildIndicators() {
    this.indicators.replaceChildren();
    if (this.single) {
      return;
    }
    this.cards.slice(0, this.maxIndex() + 1).forEach((card, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', card.querySelector(this.options.label).textContent.trim());
      button.addEventListener('click', () => {
        AdtEngagement.send('CarouselPoint', this.carousel_el, { position: index + 1 });
        this.slide(index);
      });
      this.indicators.appendChild(button);
    });
  }

  step(delta) {
    this.slide(this.index + delta);
  }

  // Con bucle, `index` puede salirse por los lados: -1 es la copia de la última
  // ficha y this.cards.length la copia de la primera, y en ese caso se anima
  // hasta la copia y luego se salta a la original, que está en el otro extremo.
  // Sin bucle se queda en el extremo y no hay copia a la que ir.
  slide(index) {
    if (this.single || this.sliding) {
      return;
    }
    const total = this.cards.length;
    const target = this.wrap ? index : Math.min(Math.max(index, 0), this.maxIndex());
    const landing = ((target % total) + total) % total;
    if (target === this.index) {
      return;
    }

    this.sliding = true;
    this.offset(target, true);
    this.index = landing;
    this.mark();
    setTimeout(() => {
      this.sliding = false;
      if (target !== landing) {
        this.offset(landing, false);
      }
    }, CARDS_DURATION);
  }

  place(animate) {
    this.offset(this.index, animate);
    this.mark();
  }

  offset(index, animate) {
    const target = this.track.children[index + this.shift];
    if (!target) {
      return;
    }
    if (!animate) {
      this.track.style.transitionProperty = 'none';
    }
    this.track.style.transform = `translateX(${-target.offsetLeft}px)`;
    if (!animate) {
      // Leer el layout antes de devolver la transición: si no, el navegador
      // junta las dos cosas y el salto se ve.
      this.track.offsetHeight;
      this.track.style.transitionProperty = '';
    }
  }

  mark() {
    Array.from(this.indicators.children).forEach((dot, index) => {
      const active = index === this.index;
      dot.classList.toggle('active', active);
      if (active) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });
    // Las fichas de fuera de la ventana siguen en la tira, pero ni se tabulan
    // ni se leen: para la lectora el carrusel es sólo lo que se ve.
    this.cards.forEach((card, index) => {
      card.inert = !this.single && !this.inWindow(index);
    });
    // Sin bucle las flechas se apagan en los extremos, que es lo que enseña que
    // la tira tiene principio y final.
    if (!this.wrap) {
      this.prev_el.disabled = this.single || this.index === 0;
      this.next_el.disabled = this.single || this.index >= this.maxIndex();
    }
  }

  inWindow(index) {
    const offset = index - this.index;
    if (!this.wrap) {
      return offset >= 0 && offset < this.visible;
    }
    return (offset + this.cards.length) % this.cards.length < this.visible;
  }

  cycle() {
    this.pause();
    if (this.single || !this.options.interval) {
      return;
    }
    this.timer = setInterval(() => this.step(1), this.options.interval);
  }

  pause() {
    clearInterval(this.timer);
    this.timer = null;
  }
}
