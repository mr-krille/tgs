var merge = function () {
  var obj = {}
    , i = 0
    , il = arguments.length
    , key;
  for (; i < il; i++) {
    for (key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key)) {
        obj[key] = arguments[i][key];
      }
    }
  }
  return obj;
}

var animation = {
  selectors: [],
  triggered: [],
  init: function () {
    window.addEventListener('MozMousePixelScroll', animation.handler);
    window.addEventListener('mousewheel', animation.handler);
    window.addEventListener('DOMMouseScroll', animation.handler);
    window.addEventListener('scroll', animation.handler);
    animation.handler();
    return true;
  },
  handler: function (evt) {
    var scrollTop = window.scrollY;
    var sels = animation.selectors;
    sels.forEach(function (opt) {
      opt = merge({ offset: 0, once: false }, opt);
      var el = document.getElementById(opt.selector);
      var topOffset = el.offsetTop - opt.offset;
      if (!(animation.triggered.indexOf(opt.selector) > -1)) {
        if (scrollTop > topOffset) {
          el.classList.add('active');
          animation.triggered << opt.selector;
        } else if (scrollTop > (topOffset * 0.5)) {
          el.classList.remove('active');
        }
      }
    });
  }
}
