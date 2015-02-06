var app = {
  init: function () {

    var curtain = document.getElementById('curtain');
    curtain.classList.add('ready');
    curtain.addEventListener('transitionend', function () {
      document.getElementById('curtain').classList.remove('ready');
    });

    document.body.classList.remove('loading');

    // portfolio?
    if (document.body.classList.contains('split')) {
      animation.init();
    } else {
      nav.init();
      $.stellar();
    }

    var pageLinks = document.querySelectorAll('.inlink');
    for (var i = 0; i < pageLinks.length; i++) {
      pageLinks[i].addEventListener('click', app.pageHandler);
    }

  },
  pageHandler: function (evt) {
    evt.preventDefault();

    var link = (evt.target.tagName === "A") ? evt.target : evt.target.parentNode;
    var url = link.getAttribute('href');

    document.body.setAttribute('class', 'loading');

    app.finish = window.setTimeout(app.init, 2000);

    animation.destroy();

    xhr = new window.XMLHttpRequest();
    xhr.open('GET', url);

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        var data;
        var raw = xhr.responseText.split('<!--//BEGIN//-->');
        if (raw.length > 1) {
          data = raw[1].split('<!--//END//-->');
          document.body.classList.add((url.length > 3) ? url.replace('/', '') : 'split');
          window.scrollTo(0, 0);
          document.getElementById('wrapper').innerHTML = data[0];
          if (!app.finish) {
            app.init();
          }
        } else {
          // error
          window.clearTimeout(app.finish);
        }
      }
    };

    xhr.send();
  }
};

var animation = {
  current: 0,
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
    // special footer
    if (animation.current !== animation.count - 1 && animation.last !== undefined) {
      document.getElementById('pagination').classList.remove('inverse');
      animation.pages[animation.last].classList.add('last');
      animation.pages[animation.last].classList.remove('active');
      animation.pagination[animation.last].classList.remove('active');
      window.setTimeout(function () {
        animation.pages[animation.last].classList.remove('last');
      }, 1300);
    }
    if (animation.current === animation.count - 1) {
      if (animation.last !== undefined) {
        animation.pagination[animation.last].classList.remove('active');
      }
      document.getElementById('pagination').classList.add('inverse');
    }
    animation.pages[animation.current].classList.add('active');
    // pagination
    animation.pagination[animation.current].classList.add('active');
    // positioning
    for (var i = 0; i < animation.count - 1; i++) {
      animation.slides[i].setAttribute('style', '-webkit-transform:translate3d(0,' + ((i * -100) + (animation.current * 100)) + '%,0);transform:translate3d(0,' + ((i * -100) + (animation.current * 100)) + '%,0)');
      animation.visuals[i].setAttribute('style', '-webkit-transform:translate3d(0,' + ((i * 100) + (animation.current * -100)) + '%,0);transform:translate3d(0,' + ((i * 100) + (animation.current * -100)) + '%,0)');
    }
    // header
    if (animation.current === 0) {
      document.getElementById('navbar').classList.remove('fixed');
    } else {
      document.getElementById('navbar').classList.add('fixed');
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
    // current
    animation.last = animation.current;
    animation.current += step;
    // hash
    window.location.hash = '#' + animation.anchors[animation.current];
    // positioning
    animation.move();
    // add events after animation
    window.setTimeout(function () {
      animation.attach();
    }, 1300);
  },
  init: function () {
    animation.pages = document.querySelectorAll('.page');
    animation.slides = document.querySelectorAll('.slide');
    animation.visuals = document.querySelectorAll('.visuals');
    animation.pagination = document.querySelectorAll('#pagination a');
    animation.count = animation.pages.length;
    //document.body.classList.add('split');
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
          animation.pages[animation.current].classList.add('active');
        }
        if (window.location.hash === '#contact') {
          animation.current = animation.count - 1;
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
        if (index !== -1) {
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
    for (var i = 0; i < animation.count - 1; i++) {
      animation.slides[i].removeAttribute('style');
      animation.visuals[i].removeAttribute('style');
    }
    document.body.classList.remove('split');
  }
};

var touch = {
  threshold: 40,
  touchhandler: function (direction) {
    var step;
    // up
    if (direction === 'up' && animation.current < animation.pages.length - 1) {
      step = 1;
      /*
      if (animation.last !== undefined) {
        animation.pages[animation.last].removeAttribute('style');
        animation.pages[animation.last].classList.remove('animate');
        animation.pages[animation.last].classList.remove('active');
        animation.pages[animation.last].classList.remove('last');
      }

      animation.last = animation.current;
      animation.current += 1;

      // direction
      document.body.classList.remove('down');
      document.body.classList.add('up');

      animation.pages[animation.last].classList.add('last');
      animation.pages[animation.last].classList.remove('active');


      animation.pages[animation.current].classList.add('active');
      animation.pages[animation.current].classList.add('animate');


      touch.touchhandler();

      window.setTimeout(function () {
        animation.pages[animation.current].setAttribute('style', '-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)');
      }, 100);
      */
    }
    // down
    if (direction === 'down' && animation.current > 0) {
      step = -1;
      /*
      if (animation.last !== undefined) {
        animation.pages[animation.last].removeAttribute('style');
        animation.pages[animation.last].classList.remove('animate');
        animation.pages[animation.current].classList.remove('active');
        animation.pages[animation.last].classList.remove('last');
      }

      animation.last = animation.current;
      animation.current -= 1;

      // direction
      document.body.classList.remove('up');
      document.body.classList.add('down');

      animation.pages[animation.last].classList.add('last');
      animation.pages[animation.last].classList.add('animate');

      animation.pages[animation.current].classList.add('active');

      touch.touchhandler();

      window.setTimeout(function () {
        animation.pages[animation.last].setAttribute('style', '-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)');
      }, 100);
      */
    }

    var next = animation.current + step;
    // out of range
    if (!step || next < 0 || next >= animation.count) {
      return false;
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
    event.preventDefault();
    var touches = event.touches;
    if (touches && touches.length) {
      var deltaX = startX - touches[0].pageX;
      var deltaY = startY - touches[0].pageY;

      //window.removeEventListener('touchstart', touch.touchstart);

      if (deltaY >= touch.threshold) {
        //console.log("swipeUp");
        //if (window.innerWidth > 960) {
        //  animation.last = animation.current;
        //  animation.current += 1;
        //  animation.move();
        //} else {
        touch.touchhandler('up');
        //}
      }
      if (deltaY <= -touch.threshold) {
        //console.log("swipeDown");
        //if (window.innerWidth > 960) {
        //  animation.last = animation.current;
        //  animation.current -= 1;
        //  animation.move();
        //} else {
        touch.touchhandler('down');
        //}
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
      event.preventDefault();
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
  animated: [],
  init: function () {
    nav.elm = document.getElementById('navbar');
    nav.offset = nav.elm.offsetTop;
    nav.top = window.scrollY;

    if (nav.top > nav.offset) {
      nav.elm.setAttribute('class', 'hide');
      nav.show = false;
    }

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

    nav.animated.forEach(function (section) {
      if (top > section.offset) {
        section.elm.classList.add('active');
      } else if (top > (section.offset * 0.5)) {
        section.elm.classList.remove('active');
      }
    });

    if (top < nav.offset) {
      nav.elm.setAttribute('class', '');
      return;
    }
    if (top < nav.top) {
      //console.log('up');
      nav.elm.classList.add('show');
      nav.show = true;
      nav.top = top;
      return;
    }
    if (top > nav.top) {
      //console.log('down');
      nav.elm.classList.add('hide');
      nav.elm.classList.remove('show');
      nav.show = false;
      nav.top = top;
    }

    return;
  }
};

//window.addEventListener('load', app.init, false);
document.addEventListener('DOMContentLoaded', app.init, false);


if(window.jQuery) {
  $(window).on('resize', function () {
    $('.casestudies .headerpic').css('height', $(window).height()-$('.headertextwrap').outerHeight())
  }).trigger('resize');
}
