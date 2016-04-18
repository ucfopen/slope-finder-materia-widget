cb = ->
	formulae = 'm = \\frac{\\text{rise}}{\\text{run}}'
	formulae += '=\\frac{y_2-y_1}{x_2-x_1}'
	formulae += '=\\frac{\\Delta y}{\\Delta x}'

	$("#formulae").mathquill 'latex', formulae
setTimeout(cb ,1000)

pointColor = '#2F4EA2'

# DEFINE BOARD
board_opts = {
	boundingbox: [-10, 10, 10, -10],
	axis: true
	grid: true
	showCopyright: false
}
board = JXG.JSXGraph.initBoard('jxgbox', board_opts)
#=============

# DEFINE POINTS
Aopts = {
	name: 'A'
	size: 4
	face: 'o'
	snapSizeX: 1
	snapSizeY: 1
	snapToGrid: true
	fillColor: pointColor
	strokeColor: pointColor
}

Bopts = {
	name: 'B'
	size: 4
	face: 'o'
	snapSizeX: 1
	snapSizeY: 1
	snapToGrid: true
	fillColor: pointColor
	strokeColor: pointColor
}

Ap		= board.create('point', [-5, 6], Aopts)
Bp		= board.create('point', [4, -4], Bopts)	

get_anchorX = ->
	Math.max(Ap.X(), Bp.X())
get_anchorY = ->
	a = 
		x: Ap.X()
		y: Ap.Y()
	b = 
		x: Bp.X()
		y: Bp.Y()

	if a.x*a.y+b.x*b.y>0 then Math.min(a.y, b.y) else Math.max(a.y, b.y)

anchor  = board.create('point', [get_anchorX, get_anchorY])
anchor.setAttribute {visible: false}

# text lables
text_coords =
	'X': [
			() -> # x coordinate getter
				point = if anchor.X() - Ap.X() is 0 then Bp else Ap
				return (anchor.X()+point.X())/2
			,
			() -> # y coordinate getter
				point = if anchor.X() - Ap.X() is 0 then Bp else Ap
				offset = 1
				return (anchor.Y()+point.Y())/2+offset
			,
			() ->
				return "<span class='values'>dx=#{Ap.X()}-#{Bp.X()}=#{Ap.X()-Bp.X()}</span>"
	]
	'Y': [
			() ->
				point = if anchor.Y() - Ap.Y() is 0 then Bp else Ap
				return (anchor.X()+point.X())/2
			,
			() ->
				point = if anchor.Y() - Ap.Y() is 0 then Bp else Ap
				return (anchor.Y()+point.Y())/2
			,
			() ->
				return "<span class='values'>dy=#{Ap.Y()}-#{Bp.Y()}=#{Ap.Y()-Bp.Y()}</span>"
	]

board.create('text', text_coords.X, {
		anchorX: 'middle'
		opacity: 0.8
	}
)
board.create('text', text_coords.Y, {
		anchorY: 'middle'
		opacity: 0.8
	}
)
#=============

# DEFINE LINES
ABline_opts = {
	strokeColor:'#006E9F'
	strokeWidth:2
	fixed: true
}

anchorLine_opts = {
	straightFirst: false
	straightLast: false
	strokeColor:'black'
	strokeWidth:2
	dash: 2
}

board.create('line',[Ap, Bp], ABline_opts);
board.create('line',[Ap, anchor], anchorLine_opts);
board.create('line',[Bp, anchor], anchorLine_opts);
#=============

is_dragging = false
dragging_point = null
old_num = null
old_denom = null

cb = ->
	num = Ap.Y() - Bp.Y()
	denom = Ap.X() - Bp.X()

	slope = num/denom
	$("#slope").mathquill('latex', "m=\\frac{#{num}}{#{denom}}\\approx #{slope}")

mouse_evt_handler = (evt) ->
	is_dragging = !is_dragging

	dragging_point = this
	document.addEventListener('mousemove', cb)

	document.addEventListener 'mouseup', ->
		is_dragging = !is_dragging
		document.removeEventListener('mousemove', cb)


JXG.addEvent(Ap.rendNode, 'mousedown', mouse_evt_handler, Ap)
JXG.addEvent(Bp.rendNode, 'mousedown', mouse_evt_handler, Bp)

dialogs_ids = ['formulae', 'values', 'slope']

for _dialog in dialogs_ids
	do (_dialog) ->
		dialog_checkbox = document.getElementById "show-#{_dialog}"
		dialog_checkbox.addEventListener 'change', =>
			dialogs = [document.getElementById _dialog]
			if !dialogs[0]
				dialogs = document.getElementsByClassName _dialog
				console.log 'vals', dialogs
			
			for dialog in dialogs
				dialog.classList.toggle 'hide'
