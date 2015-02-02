var scroll = {
  top: 0,
  nav: document.getElementById('navbar'),
  init: function () {
    scroll.offset = scroll.nav.offsetTop;
    if (window.top.scroll) {
      var home = document.querySelectorAll('.home');
      home[0].addEventListener('click', window.top.scroll.closeSite);
    }
    if (window.scrollY > scroll.offset) {
      scroll.nav.setAttribute('class', 'hide');
      scroll.show = false;
    }
    window.addEventListener('MozMousePixelScroll', scroll.handler);
    window.addEventListener('mousewheel', scroll.handler);
    window.addEventListener('DOMMouseScroll', scroll.handler);
  },
  handler: function (evt) {
    var top = window.scrollY;
    if (top < scroll.offset) {
      scroll.nav.setAttribute('class', '');
      return;
    }
    if (top < scroll.top) {
      //console.log('up');
      scroll.nav.classList.add('show');
      scroll.show = true;
      scroll.top = top;
      return;
    }
    if (top > scroll.top) {
      //console.log('down');
      scroll.nav.classList.add('hide');
      scroll.nav.classList.remove('show');
      scroll.show = false;
      scroll.top = top;
    }
    return;
  }
};
scroll.init();
