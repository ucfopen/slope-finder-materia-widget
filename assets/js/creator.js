var ABline_opts, Aopts, Ap, Bopts, Bp, _dialog, anchor, anchorLine_opts, board, board_opts, cb, dialogs_ids, discrete_checkbox, discrete_option, dragging_point, fn, get_anchorX, get_anchorY, i, len, mouse_evt_handler, pointColor, ref, round, text_coords, values_checkbox, xmargin, xmax, xmin, xoffset, ymargin, ymax, ymin, yoffset;

round = function(num) {
  var dec, p;
  dec = 1;
  p = Math.pow(10, dec);
  return Math.round((num + 0.00001) * p) / p;
};

cb = function() {
  var formulae;
  formulae = 'm = \\frac{\\text{rise}}{\\text{run}}';
  formulae += '=\\frac{y_2-y_1}{x_2-x_1}';
  formulae += '=\\frac{\\Delta y}{\\Delta x}';
  return $("#formulae").mathquill('latex', formulae);
};

setTimeout(cb, 1000);

pointColor = '#2F4EA2';

board_opts = {
  boundingbox: [-10, 10, 10, -10],
  axis: true,
  grid: true,
  showCopyright: false,
  showNavigation: false
};

board = JXG.JSXGraph.initBoard('jxgbox', board_opts);

Aopts = {
  name: 'A',
  size: 4,
  face: 'o',
  snapSizeX: 1,
  snapSizeY: 1,
  snapToGrid: true,
  fillColor: pointColor,
  strokeColor: pointColor
};

Bopts = {
  name: 'B',
  size: 4,
  face: 'o',
  snapSizeX: 1,
  snapSizeY: 1,
  snapToGrid: true,
  fillColor: pointColor,
  strokeColor: pointColor
};

Ap = board.create('point', [-5, 6], Aopts);

Bp = board.create('point', [4, -4], Bopts);

get_anchorX = function() {
  return Math.max(Ap.X(), Bp.X());
};

get_anchorY = function() {
  var a, b;
  a = {
    x: Ap.X(),
    y: Ap.Y()
  };
  b = {
    x: Bp.X(),
    y: Bp.Y()
  };
  if ((a.y - b.y) / (a.x - b.x) >= 0) {
    return Math.min(a.y, b.y);
  } else {
    return Math.max(a.y, b.y);
  }
};

anchor = board.create('point', [get_anchorX, get_anchorY]);

anchor.setAttribute({
  visible: false
});

ref = board_opts.boundingbox, xmin = ref[0], ymax = ref[1], xmax = ref[2], ymin = ref[3];

xoffset = 2;

yoffset = 1;

xmargin = 0.5;

ymargin = 0.75;

values_checkbox = document.getElementById("show-values");

discrete_checkbox = document.getElementById("discrete-toggle");

text_coords = {
  'X': [
    function() {
      var new_x, point;
      point = anchor.X() - Ap.X() === 0 ? Bp : Ap;
      new_x = (anchor.X() + point.X()) / 2;
      if (new_x > xmax - xoffset - xmargin) {
        return xmax - xoffset - xmargin;
      }
      if (new_x < xmin + xoffset + xmargin) {
        return xmin + xoffset + xmargin;
      }
      return new_x;
    }, function() {
      var offset, point;
      point = anchor.X() - Ap.X() === 0 ? Bp : Ap;
      offset = 1;
      return Math.min((anchor.Y() + point.Y()) / 2 + offset, ymax - yoffset);
    }, function() {
      var ApX, BpX, diff, discreteSize, hide;
      diff = round(Ap.X() - Bp.X());
      BpX = round(Bp.X());
      ApX = round(Ap.X());
      if (BpX < 0) {
        BpX = "(" + BpX + ")";
      }
      hide = values_checkbox.checked ? '' : 'hide';
      discreteSize = discrete_checkbox.checked ? 'discrete-text-size' : '';
      return "<div class='values " + hide + " " + discreteSize + "'> dx= <span class='values-number'>" + ApX + "</span> - <span class='values-number'>" + BpX + "</span> = <span class='values-number'>" + diff + "</span> </div>";
    }
  ],
  'Y': [
    function() {
      var _, new_x, point, ref1, text_xmax, text_xmin, width;
      point = anchor.Y() - Ap.Y() === 0 ? Bp : Ap;
      new_x = (anchor.X() + point.X()) / 2 + 1;
      ref1 = this.bounds(), text_xmin = ref1[0], _ = ref1[1], text_xmax = ref1[2], _ = ref1[3];
      width = text_xmax - text_xmin;
      if (new_x > xmax - (width + xmargin)) {
        return xmax - (width + xmargin);
      }
      return new_x;
    }, function() {
      var new_y, point;
      point = anchor.Y() - Ap.Y() === 0 ? Bp : Ap;
      new_y = (anchor.Y() + point.Y()) / 2 + 2;
      if (new_y > ymax - ymargin) {
        return ymax - ymargin;
      }
      if (new_y < ymin + ymargin) {
        return ymin + ymargin;
      }
      return new_y;
    }, function() {
      var ApY, BpY, diff, discreteSize, hide;
      diff = round(Ap.Y() - Bp.Y());
      ApY = round(Ap.Y());
      BpY = round(Bp.Y());
      if (BpY < 0) {
        BpY = "(" + BpY + ")";
      }
      hide = values_checkbox.checked ? '' : 'hide';
      discreteSize = discrete_checkbox.checked ? 'discrete-text-size' : '';
      return "<div class='values " + hide + " " + discreteSize + " rotate'> dx= <span class='values-number'>" + ApY + "</span> - <span class='values-number'>" + BpY + "</span> = <span class='values-number'>" + diff + "</span> </div>";
    }
  ]
};

board.create('text', text_coords.X, {
  opacity: 0.8
});

board.create('text', text_coords.Y, {
  anchorY: 'bottom',
  opacity: 0.8
});

ABline_opts = {
  strokeColor: '#006E9F',
  strokeWidth: 2,
  fixed: true
};

anchorLine_opts = {
  straightFirst: false,
  straightLast: false,
  strokeColor: 'black',
  strokeWidth: 2,
  dash: 2
};

board.create('line', [Ap, Bp], ABline_opts);

board.create('line', [Ap, anchor], anchorLine_opts);

board.create('line', [Bp, anchor], anchorLine_opts);

dragging_point = null;

cb = function() {
  var denom, num, slope;
  num = round(Ap.Y() - Bp.Y());
  denom = round(Ap.X() - Bp.X());
  slope = round(num / denom);
  return $("#slope").mathquill('latex', "m=\\frac{" + num + "}{" + denom + "}\\approx " + slope);
};

mouse_evt_handler = function(evt) {
  dragging_point = this;
  document.addEventListener('mousemove', cb);
  return document.addEventListener('mouseup', function() {
    return document.removeEventListener('mousemove', cb);
  });
};

JXG.addEvent(Ap.rendNode, 'mousedown', mouse_evt_handler, Ap);

JXG.addEvent(Bp.rendNode, 'mousedown', mouse_evt_handler, Bp);

discrete_option = document.getElementById('discrete-toggle');

discrete_option.addEventListener('change', function() {
  var i, len, text, values_texts;
  values_texts = document.getElementsByClassName('values');
  for (i = 0, len = values_texts.length; i < len; i++) {
    text = values_texts[i];
    text.classList.toggle('discrete-text-size');
  }
  return setTimeout((function(_this) {
    return function() {
      Ap.setAttribute({
        snapToGrid: _this.checked
      });
      return Bp.setAttribute({
        snapToGrid: _this.checked
      });
    };
  })(this), 1000);
});

dialogs_ids = ['formulae', 'values', 'slope'];

fn = function(_dialog) {
  var dialog_checkbox;
  dialog_checkbox = document.getElementById("show-" + _dialog);
  return dialog_checkbox.addEventListener('change', (function(_this) {
    return function() {
      var dialog, dialogs, j, len1, results;
      dialogs = [document.getElementById(_dialog)];
      if (!dialogs[0]) {
        dialogs = document.getElementsByClassName(_dialog);
      }
      results = [];
      for (j = 0, len1 = dialogs.length; j < len1; j++) {
        dialog = dialogs[j];
        results.push(dialog.classList.toggle('hide'));
      }
      return results;
    };
  })(this));
};
for (i = 0, len = dialogs_ids.length; i < len; i++) {
  _dialog = dialogs_ids[i];
  fn(_dialog);
}
