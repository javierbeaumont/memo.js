/* Deck navigation: CSS scroll-snap does the paging; JS adds keyboard, dots and the counter. */
{
  const deck = document.querySelector('.deck');
  const slides = [...deck.querySelectorAll('.slide')];
  const dots = document.querySelector('.dots');
  const counter = document.querySelector('.counter');

  let current = 0;

  slides.forEach((slide, i) => {
    const dot = document.createElement('button');

    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}: ${slide.getAttribute('aria-label')}`);
    dot.addEventListener('click', () => go(i));
    dots.appendChild(dot);
  });

  const paint = () => {
    [...dots.children].forEach((dot, i) => dot.setAttribute('aria-current', i === current ? 'true' : 'false'));

    counter.textContent = `${current + 1} / ${slides.length}`;
  };

  // Wrap forward, clamp back. 'instant' (not smooth) because scroll-snap-stop blocks smooth multi-slide jumps.
  const go = (i) => slides[i >= slides.length ? 0 : Math.max(0, i)].scrollIntoView({ behavior: 'instant' });

  // Anchor links (the cover CTAs) page to their target slide.
  deck.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));

      if (!target) return;

      e.preventDefault();

      go(slides.indexOf(target));
    });
  });

  // Track the current slide from the scroll position (one viewport per slide); repaint only on change.
  deck.addEventListener('scroll', () => {
    const i = Math.round(deck.scrollTop / deck.clientHeight);

    if (i !== current) {
      current = i;

      paint();
    }

  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    if (document.querySelector('.CodeMirror-focused')) return; // editing code: let the keys through

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        go(e.shiftKey ? current - 1 : current + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        go(current - 1);
        break;
      case 'Home':
        e.preventDefault();
        go(0);
        break;
      case 'End':
        e.preventDefault();
        go(slides.length - 1);
        break;
    }
  });

  paint();
}

/* Code slides -> CodeMirror editors. Runnable ones (data-run) get Run/Clear and an
   output panel that captures console.log, run against the page's real jQuery. */
{
  document.querySelectorAll('textarea.cm').forEach((ta) => {
    const runnable = ta.hasAttribute('data-run');
    const mode = ta.getAttribute('data-mode') || 'javascript';
    const cm = CodeMirror.fromTextArea(ta, {
      mode,
      lineNumbers: true,
      viewportMargin: Infinity, // render all lines so the editor's height:auto fits the slide
    });

    // Tag the mode so token colours can differ per language (cm-string-2 is a JS template literal but a CSS property).
    cm.getWrapperElement().classList.add('cm-mode-' + mode);

    if (!runnable) return;

    const controls = document.createElement('div');
    controls.className = 'run';

    const runBtn = document.createElement('button');
    runBtn.type = 'button';
    runBtn.textContent = 'Run';

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.textContent = 'Clear';

    const out = document.createElement('pre');
    out.className = 'out';

    controls.append(runBtn, clearBtn);

    cm.getWrapperElement().appendChild(controls);
    cm.getWrapperElement().after(out);

    /* Optional hidden setup/cleanup lets the visible snippet be the real game code:
       setup provides what it reads elsewhere (e.g. config), cleanup prints the result. */
    const slide = ta.closest('.slide');
    const setup = slide && slide.querySelector('[data-cm-setup]');
    const cleanup = slide && slide.querySelector('[data-cm-cleanup]');

    runBtn.addEventListener('click', () => {
      const logs = [];
      const orig = console.log;

      console.log = (...args) => logs.push(args.join(' '));

      let result;

      try {
        const src = (setup ? setup.textContent + '\n' : '')
          + cm.getValue()
          + (cleanup ? '\n' + cleanup.textContent : '');

        new Function(src)();

        result = logs.length ? logs.join('\n') : '(no output)';
      } catch (err) {
        result = 'Error: ' + err.message;
      } finally {
        console.log = orig;
      }
      out.textContent = out.textContent ? out.textContent + '\n' + result : result; // append runs until Clear
    });

    clearBtn.addEventListener('click', () => {
      out.textContent = '';
    });
  });
}
