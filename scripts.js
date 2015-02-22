var app = {
  preloading: [],
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  init: function () {
    app.url = null;
    app.klass = null;
    //console.log('app init');
    if (app.initial) {
      app.getImages();
    } else {
      var preload = document.getElementById('preload');
      if (preload) {
        app.preload(preload.childNodes[0].nodeValue);
      }
      app.initial = true;
    }
    // nothing to load?
    if (app.preloading.length === 0) {
      app.ready();
    }

    // portfolio?
    if (document.body.classList.contains('split')) {
      animation.init();
    } else {
      nav.init();
      if (!app.isMobile) {
        $.stellar({
          responsive: true
        });
        $(window).trigger('resize');
      } else {
        var animated = document.querySelectorAll('[data-animated]');
        for(var i = 0; i < animated.length; i++) {
          animated[i].classList.add('active');
        }
      }
    }

    var pageLinks = document.querySelectorAll('.inlink');
    for (var i = 0; i < pageLinks.length; i++) {
      pageLinks[i].addEventListener('click', app.pageHandler);
    }

    var svgs = document.querySelectorAll('[data-inline-svg]');
    for(var i = 0; i < svgs.length; i++) {
      var svg = svgs[i];

      $.get(svg.getAttribute('src'), function(data) {
        var div = svg.parentElement;
        div.innerHTML = new XMLSerializer().serializeToString(data.documentElement);
      });
    }
  },
  ready: function () {
    app.finish = null;
    //console.log('app ready');
    document.body.classList.add('ready');
    // loading animation
    var curtain = document.getElementById('curtain');
    if (curtain) {
      curtain.classList.add('ready');
      curtain.classList.remove('loading');
      window.setTimeout(function () {
        document.getElementById('curtain').setAttribute('class', '');
      }, 1000);
    }
    // header image sizing
    $('.casestudies .headerpic').css('height', $(window).height() - $('.headertextwrap').outerHeight());
  },
  change: function () {
    app.finish = null;
    if (app.pageContent) {
      window.scrollTo(0, 0);
      window.history.pushState(null, null, app.url);
      document.body.setAttribute('class', app.klass);
      document.getElementById('wrapper').innerHTML = app.pageContent;
      app.pageContent = null;
      app.finish = window.setTimeout(app.ready, 1000);
      app.init();
    }
  },
  pageHandler: function (evt) {
    evt.preventDefault();

    var link = (evt.target.tagName === "A") ? evt.target : evt.target.parentNode;
    var url = link.getAttribute('href');

    document.getElementById('curtain').setAttribute('class', 'loading');

    animation.destroy();

    app.finish = window.setTimeout(app.change, 1000);

    xhr = new window.XMLHttpRequest();
    xhr.open('GET', url);

    app.url = url;

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        var data,
            raw = xhr.responseText,
            begin = raw.split('<!--//BEGIN//-->'),
            preload = raw.split('/*PRELOAD*/');

        // change syles and preload
        if (preload[1]) {
          document.getElementById('preload').childNodes[0].nodeValue = preload[1];
          app.preload(preload[1]);
        }

        if (begin.length > 1) {
          data = begin[1].split('<!--//END//-->');
          app.klass = (url.length > 3) ? url.replace('/', '') : 'split';
          app.pageContent = data[0];
          if (app.finish === null) {
            app.change();
          }
        } else {
          // error
          //window.clearTimeout(app.finish);
        }
      }
    };

    xhr.send();
  },
  getImages: function () {
    var images = document.querySelectorAll('img');
    for (var i = 0; i < images.length; i ++) {
      app.preloading.push(images[i]);
      images[i].addEventListener('load', app.loaded);
    }
  },
  preload: function (data) {
    if (!data) return;
    var pattern = /url\(([\w\/\.-]*)\)/g,
        styles = data.split('/*MOBILE*/');
    data = (window.innerWidth > 960) ? styles[0] : styles[1];

    while (match = pattern.exec(data)) {
      var img = new Image();
      app.preloading.push(match[1]);
      img.onload = app.loaded;
      img.src = match[1];
    }
  },
  loaded: function (evt) {
    evt.stopPropagation();
    app.preloading.pop();
    if (app.preloading.length === 0 && !app.finish) {
      app.ready();
    }
  }
};

var animation = {
  anchors: [],
  attach: function () {
    window.addEventListener('MozMousePixelScroll', animation.handler);
    window.addEventListener('mousewheel', animation.handler);
    window.addEventListener('DOMMouseScroll', animation.handler);
    window.addEventListener('touchstart', touch.touchstart);
  },
  detach: function () {
    window.removeEventListener('MozMousePixelScroll', animation.handler);
    window.removeEventListener('mousewheel', animation.handler);
    window.removeEventListener('DOMMouseScroll', animation.handler);
    window.removeEventListener('touchstart', touch.touchstart);
  },
  move: function () {
    // not footer
    if (animation.current !== animation.count - 1 && animation.last !== undefined) {
      document.getElementById('pagination').classList.remove('inverse');
    }
    // footer
    if (animation.current === animation.count - 1) {
      document.getElementById('pagination').classList.add('inverse');
    }
    if (animation.last !== undefined) {
      animation.pages[animation.last].classList.add('last');
      animation.pages[animation.last].classList.remove('active');
      animation.pagination[animation.last].classList.remove('active');
    }
    animation.pages[animation.current].classList.add('active');
    // pagination
    animation.pagination[animation.current].classList.add('active');
    // header
    if (animation.current === 0) {
      document.getElementById('header').classList.remove('fixed');
    } else {
      if (!document.getElementById('header').classList.contains('fixed')) {
        document.getElementById('header').classList.add('fixed');
      }
    }
  },
  handler: function (evt) {
    evt.preventDefault();
    var delta = evt.wheelDelta || -evt.detail;
    var step = (delta < 0) ? 1 : -1;
    var next = animation.current + step;
    // out of range
    if (next < 0 || next >= animation.count) {
      return false;
    }
    // remove event listener
    animation.detach();
    if (animation.last !== undefined) {
      animation.pages[animation.last].classList.remove('last');
    }
    // current
    animation.last = animation.current;
    animation.current += step;
    // hash
    window.location.hash = '#' + animation.anchors[animation.current];
    document.getElementById('wrapper').setAttribute('class', (delta < 0) ? 'up' : 'down');
    // positioning
    animation.move();
    // add events after animation
    window.setTimeout(function () {
      animation.attach();
    }, 1300);
  },
  init: function () {
    //console.log('animation init');
    animation.current = 0;
    animation.last = undefined;
    animation.pages = document.querySelectorAll('.page');
    animation.slides = document.querySelectorAll('.slide');
    animation.visuals = document.querySelectorAll('.visuals');
    animation.pagination = document.querySelectorAll('#pagination a');
    animation.count = animation.pages.length;

    // anchors
    for (var i = 0; i < animation.count; i++) {
      animation.anchors[i] = animation.pages[i].getAttribute('id');
    }
    // responsive
    if (window.innerWidth > 960) {
      // not intro
      if (window.location.hash) {
        var index = animation.anchors.indexOf(window.location.hash.slice(1));
        if (index !== -1) {
          animation.current = index;
          //animation.pages[animation.current].classList.add('active');
        }
      }
      // positioning
      animation.move();
      // pagination
      animation.pagination[animation.current].classList.add('active');
      // links
      var links = document.querySelectorAll('.anchor');
      var linkHandler = function (evt) {
        var anchor = this.getAttribute('href');
        var index = (anchor) ? animation.anchors.indexOf(anchor.replace('#', '')) : -1;
        if (index !== -1 && index !== animation.current) {
          if (animation.last !== undefined) {
            animation.pages[animation.last].classList.remove('last');
          }
          document.getElementById('wrapper').setAttribute('class', (index > animation.current) ? 'up' : 'down');
          animation.last = animation.current;
          animation.current = index;
          animation.move();
        }
      };
      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', linkHandler);
      }
      // events
      animation.attach();

    // touch
    } else {
      //document.body.style.overflow = 'hidden';
      //window.addEventListener('touchstart', touch.touchstart);
    }
  },
  destroy: function (evt) {
    animation.detach();
  }
};

var touch = {
  threshold: 40,
  touchhandler: function (direction) {
    var step;
    // up
    if (direction === 'up' && animation.current < animation.pages.length - 1) {
      document.getElementById('wrapper').setAttribute('class', 'up');
      step = 1;
    }
    // down
    if (direction === 'down' && animation.current > 0) {
      document.getElementById('wrapper').setAttribute('class', 'down');
      step = -1;
    }
    var next = animation.current + step;
    // out of range
    if (!step || next < 0 || next >= animation.count) {
      return false;
    }
    if (animation.last !== undefined) {
      animation.pages[animation.last].classList.remove('last');
    }
    animation.last = animation.current;
    animation.current += step;
    // hash
    window.location.hash = '#' + animation.anchors[animation.current];
    // positioning
    animation.move();
    // clear after animation
    //window.addEventListener('webkitTransitionEnd', touch.touchend);
  },
  touchmove: function (event) {
    var touches = event.touches;
    if (touches && touches.length) {
      var deltaX = startX - touches[0].pageX;
      var deltaY = startY - touches[0].pageY;

      //window.removeEventListener('touchstart', touch.touchstart);

      if (deltaY >= touch.threshold) {
        event.preventDefault();
        touch.touchhandler('up');
      }
      if (deltaY <= -touch.threshold) {
        event.preventDefault();
        touch.touchhandler('down');
      }
      /*
      window.setTimeout(function () {
        window.addEventListener('touchstart', touch.touchstart);
      }, 1300);
      */
      if (Math.abs(deltaX) >= touch.threshold || Math.abs(deltaY) >= touch.threshold) {
        window.removeEventListener('touchmove', touch.touchmove);
      }
    }
  },
  touchstart: function (event) {
    var touches = event.touches;
    if (touches && touches.length) {
      //event.preventDefault();
      startX = touches[0].pageX;
      startY = touches[0].pageY;
      window.addEventListener('touchmove', touch.touchmove);
    }
  },
  touchend: function (evt) {
    window.removeEventListener('webkitTransitionEnd', touch.touchend);
    if (animation.last !== undefined) {
      animation.pages[animation.last].classList.remove('animate');
    }
    animation.pages[animation.current].classList.remove('animate');
    //animation.pages[animation.last].classList.remove('last');
    //animation.pages[animation.last].removeAttribute('style');
    //animation.pages[animation.current].classList.remove('animate');
  }
};

var nav = {
  top: 0,
  init: function () {
    nav.elm = document.getElementById('navbar');
    nav.offset = nav.elm.offsetTop;
    nav.top = window.scrollY;

    if (nav.top > nav.offset) {
      nav.elm.setAttribute('class', 'hide');
      nav.show = false;
    }

    nav.animated = [];

    var animated = document.querySelectorAll('[data-animated]') || [];

    for (var i = 0; i < animated.length; i++) {
      var elm = animated[i];
      var offset = elm.offsetTop;
      var correct = elm.getAttribute('data-offset');
      if (correct) {
        offset -= parseInt(correct, 10);
      }
      nav.animated.push({
        elm: elm,
        offset: offset
      });
    }

    window.addEventListener('scroll', nav.handler);
  },
  handler: function (evt) {
    var top = window.scrollY;

    if (!app.isMobile) {
      nav.animated.forEach(function (section) {
        if (top > section.offset) {
          section.elm.classList.add('active');
        } else if (top > (section.offset * 0.5)) {
          section.elm.classList.remove('active');
        }
      });
    }

    if (top >= 0 && top < nav.offset) {
      nav.elm.setAttribute('class', '');
      return;
    }
    if (top > nav.offset && top < nav.top) {
      //console.log('up');
      nav.top = top;
      if (!nav.elm.classList.contains('show')) {
        nav.elm.setAttribute('class', 'show');
        window.removeEventListener('scroll', nav.handler);
        window.setTimeout(function () {
          window.addEventListener('scroll', nav.handler);
        }, 100);
      }
      return;
    }
    if (top > nav.offset && top > nav.top + 20) {
      //console.log('down');
      nav.top = top;
      if (!nav.elm.classList.contains('hide')) {
        nav.elm.setAttribute('class', 'hide');
        window.removeEventListener('scroll', nav.handler);
        window.setTimeout(function () {
          window.addEventListener('scroll', nav.handler);
        }, 300);
      }
    }
    return;
  }
};

window.addEventListener('load', app.init, false);

if(window.jQuery) {
  $(window).on('resize', function () {
    $('.casestudies .headerpic').css('height', $(window).height()-$('.headertextwrap').outerHeight());
  }).trigger('resize');
}
