var ABline_opts, Aopts, Ap, Bopts, Bp, _dialog, anchor, anchorLine_opts, board, board_opts, cb, dialogs_ids, dragging_point, fn, get_anchorX, get_anchorY, i, is_dragging, len, mouse_evt_handler, old_denom, old_num, pointColor, text_coords;

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
  showCopyright: false
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
  if (a.x * a.y + b.x * b.y > 0) {
    return Math.min(a.y, b.y);
  } else {
    return Math.max(a.y, b.y);
  }
};

anchor = board.create('point', [get_anchorX, get_anchorY]);

anchor.setAttribute({
  visible: false
});

text_coords = {
  'X': [
    function() {
      var point;
      point = anchor.X() - Ap.X() === 0 ? Bp : Ap;
      return (anchor.X() + point.X()) / 2;
    }, function() {
      var offset, point;
      point = anchor.X() - Ap.X() === 0 ? Bp : Ap;
      offset = 1;
      return (anchor.Y() + point.Y()) / 2 + offset;
    }, function() {
      return "<span class='values'>dx=" + (Ap.X()) + "-" + (Bp.X()) + "=" + (Ap.X() - Bp.X()) + "</span>";
    }
  ],
  'Y': [
    function() {
      var point;
      point = anchor.Y() - Ap.Y() === 0 ? Bp : Ap;
      return (anchor.X() + point.X()) / 2;
    }, function() {
      var point;
      point = anchor.Y() - Ap.Y() === 0 ? Bp : Ap;
      return (anchor.Y() + point.Y()) / 2;
    }, function() {
      return "<span class='values'>dy=" + (Ap.Y()) + "-" + (Bp.Y()) + "=" + (Ap.Y() - Bp.Y()) + "</span>";
    }
  ]
};

board.create('text', text_coords.X, {
  anchorX: 'middle',
  opacity: 0.8
});

board.create('text', text_coords.Y, {
  anchorY: 'middle',
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

is_dragging = false;

dragging_point = null;

old_num = null;

old_denom = null;

cb = function() {
  var denom, num, slope;
  num = Ap.Y() - Bp.Y();
  denom = Ap.X() - Bp.X();
  slope = num / denom;
  return $("#slope").mathquill('latex', "m=\\frac{" + num + "}{" + denom + "}\\approx " + slope);
};

mouse_evt_handler = function(evt) {
  is_dragging = !is_dragging;
  dragging_point = this;
  document.addEventListener('mousemove', cb);
  return document.addEventListener('mouseup', function() {
    is_dragging = !is_dragging;
    return document.removeEventListener('mousemove', cb);
  });
};

JXG.addEvent(Ap.rendNode, 'mousedown', mouse_evt_handler, Ap);

JXG.addEvent(Bp.rendNode, 'mousedown', mouse_evt_handler, Bp);

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
        console.log('vals', dialogs);
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

Materia.CreatorCore.start($scope);
