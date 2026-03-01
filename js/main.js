function initThemeControls() {
  const artisticButton = document.getElementById("btn-artistic");
  const professionalButton = document.getElementById("btn-professional");
  const htmlElement = document.documentElement;


  htmlElement.classList.add("theme-artistic");


  const toggleContainer = document.getElementById("toggle-container");

  function setTheme(theme) {
    htmlElement.classList.remove("theme-artistic", "theme-professional");
    htmlElement.classList.add(theme);
    console.log("theme set:", theme);
  }


  function showArtistic() {
    if (toggleContainer) toggleContainer.classList.remove("show-professional");
    setTheme("theme-artistic");
    artisticButton.classList.add("active");
    professionalButton.classList.remove("active");
  }


  function showProfessional() {
    if (toggleContainer) toggleContainer.classList.add("show-professional");
    setTheme("theme-professional");
    professionalButton.classList.add("active");
    artisticButton.classList.remove("active");
  }


  if (artisticButton) artisticButton.addEventListener("click", showArtistic);
  if (professionalButton) professionalButton.addEventListener("click", showProfessional);


  if (artisticButton) artisticButton.classList.add("active");

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initThemeControls();
    initGallery();
  });
} else {
  initThemeControls();
  initGallery();
}

function loadFolderImages(folder) {

  const embedded = document.getElementById(`manifest-${folder}`);
  if (embedded) {
    try {
      return Promise.resolve(JSON.parse(embedded.textContent));
    } catch (e) {
      console.warn('invalid embedded manifest for', folder, e);
    }
  }

  return fetch(`assets/img/${folder}/manifest.json`)
    .then(r => {
      if (!r.ok) throw new Error('no manifest');
      return r.json();
    })
    .catch(() => []);
}


function populateCarousel(inner) {
  const folder = inner.dataset.folder;
  if (!folder) return Promise.resolve();
  return loadFolderImages(folder).then(files => {
    inner.innerHTML = '';
    if (folder === 'MITSUKI') {
      // Special ordering and grouping rules for the MITSUKI folder
      // Use case-insensitive matching and more flexible patterns so the manifest
      // can contain a variety of filenames (jpg/png, numbered gifs, etc.).
      const specialFirst = files.filter(f => /^mitsuki\.png$/i);
      const icon = files.filter(f => /(icon|logo)/i.test(f) && !/display/i.test(f));
      const display = files.filter(f => /mitsuki[_\-]?display/i.test(f));
      const homepage = files.filter(f => /^homepage/i.test(f));
      const slot = files.filter(f => /slot\d*\.gif$/i.test(f));
      const lock = files.filter(f => /lock.*\.gif$/i.test(f));
      // remove any that we're treating specially from the "others" bucket
      const others = files.filter(f => !specialFirst.includes(f) && !icon.includes(f) && !display.includes(f) && !homepage.includes(f) && !slot.includes(f) && !lock.includes(f));
      let idx = 0;
      function addSlideContent(generator) {
        const div = document.createElement('div');
        div.className = 'carousel-item' + (idx === 0 ? ' active' : '');
        generator(div);
        inner.appendChild(div);
        idx++;
      }
      // if mitsuki.png exists we always want it first
      if (specialFirst.length) {
        addSlideContent(div => {
          const img = document.createElement('img');
          img.src = `assets/img/${folder}/${specialFirst[0]}`;
          img.alt = specialFirst[0];
          img.className = 'no-scale';
          div.appendChild(img);
        });
      }
      // icons (logos and plain icons) each get their own slide now
      icon.forEach(f => {
        addSlideContent(div => {
          const img = document.createElement('img');
          img.src = `assets/img/${folder}/${f}`;
          img.alt = f;
          img.className = 'no-scale';
          div.appendChild(img);
        });
      });
      // each display image gets its own slide so they appear consecutively
      display.forEach(f => {
        addSlideContent(div => {
          const img = document.createElement('img');
          img.src = `assets/img/${folder}/${f}`;
          img.alt = f;
          img.className = 'no-scale';
          div.appendChild(img);
        });
      });
      homepage.forEach(f => {
        addSlideContent(div => {
          const img = document.createElement('img');
          img.src = `assets/img/${folder}/${f}`;
          img.alt = f;
          img.className = 'no-scale';
          div.appendChild(img);
        });
      });
      if (slot.length) {
        addSlideContent(div => {
          const row = document.createElement('div');
          row.className = 'd-flex flex-wrap justify-content-center';
          slot.forEach(f => {
            const img = document.createElement('img');
            img.src = `assets/img/${folder}/${f}`;
            img.alt = f;
            img.className = 'no-scale m-1';
            row.appendChild(img);
          });
          div.appendChild(row);
        });
      }
      if (lock.length) {
        addSlideContent(div => {
          const row = document.createElement('div');
          row.className = 'd-flex flex-wrap justify-content-center';
          lock.forEach(f => {
            const img = document.createElement('img');
            img.src = `assets/img/${folder}/${f}`;
            img.alt = f;
            img.className = 'no-scale m-1';
            row.appendChild(img);
          });
          div.appendChild(row);
        });
      }
      others.forEach(f => {
        addSlideContent(div => {
          const img = document.createElement('img');
          img.src = `assets/img/${folder}/${f}`;
          img.alt = f;
          img.className = 'no-scale';
          div.appendChild(img);
        });
      });
      return idx;
    } else {
      files.forEach((fname, idx) => {
        const div = document.createElement('div');
        div.className = 'carousel-item' + (idx === 0 ? ' active' : '');
        const img = document.createElement('img');
        img.className = 'd-block w-100';
        img.src = `assets/img/${folder}/${fname}`;
        img.alt = fname;
        div.appendChild(img);
        inner.appendChild(div);
      }); 
      return files.length;
    }
  });
}

function setupCarouselControls(carouselId) {
  const carouselEl = document.getElementById(carouselId);
  if (!carouselEl) return;


  const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carouselEl, {
    interval: 5000,
    pause: false,
  });


  bsCarousel.pause();
  let playing = false;

  const ppButton = carouselEl.querySelector('.carousel-playpause');
  function updatePlayPauseIcon() {
    if (!ppButton) return;
    console.log('updatePlayPauseIcon, playing=', playing);
    ppButton.src = playing ? 'assets/img/icons/pauseV01.png' : 'assets/img/icons/playV01.png';
  }

  updatePlayPauseIcon();

  ppButton?.addEventListener('click', () => {
    console.log('playpause clicked, before playing=', playing);
    if (playing) {
      bsCarousel.pause();
      playing = false;
    } else {
      bsCarousel.cycle();
      playing = true;
    }
    console.log('playpause clicked, after playing=', playing);
    updatePlayPauseIcon();
  });

  const modalEl = carouselEl.closest('.modal');
  modalEl?.addEventListener('hidden.bs.modal', () => {
    bsCarousel.pause();
    playing = false;
    updatePlayPauseIcon();
  });
  modalEl?.addEventListener('shown.bs.modal', () => {
    // set or create slideshow title element
    const folderName = carouselEl.querySelector('.carousel-inner')?.dataset.folder;
    let titleEl = modalEl.querySelector('.slideshow-title');
    if (!titleEl) {
      titleEl = document.createElement('h3');
      titleEl.className = 'slideshow-title text-center';
      const desc = modalEl.querySelector('.gallery-description');
      desc?.before(titleEl);
    }
    titleEl.innerHTML = folderName ? `<strong>${folderName}</strong>` : '';

    updatePlayPauseIcon();
  });

  const closeIcon = modalEl?.querySelector('.modal-close-icon');
  closeIcon?.addEventListener('click', () => bootstrap.Modal.getInstance(modalEl).hide());

  const counter = modalEl?.querySelector('.counter-text');
  carouselEl.addEventListener('slide.bs.carousel', e => {
    const items = carouselEl.querySelectorAll('.carousel-item');
    const idx = Array.from(items).indexOf(e.relatedTarget) + 1;
    if (counter) counter.textContent = `${idx} / ${items.length}`;
  });
}

function initGallery() {

  document.querySelectorAll('.carousel-inner[data-folder]').forEach(inner => {
    populateCarousel(inner).then(len => {
      const carousel = inner.closest('.carousel');
      if (carousel) setupCarouselControls(carousel.id);

      const counter = carousel?.closest('.modal')?.querySelector('.counter-text');
      if (counter) counter.textContent = `1 / ${len}`;
    });
  });
}

// note: previously there was a zoom toggle handler here but it's been removed
// per user request – images no longer scale on click.
document.addEventListener('hidden.bs.modal', () => {
  document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  document.body.classList.remove('modal-open');
});
