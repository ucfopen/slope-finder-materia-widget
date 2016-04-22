# utility function
round = (num) -> # 2 decimal places
	dec = 1
	p = Math.pow(10, dec)
	Math.round((num + 0.00001) * p) / p

pointColor = '#2F4EA2'

# DEFINE BOARD
board_opts = {
	boundingbox: [-10, 10, 10, -10],
	axis: true
	grid: true
	showCopyright: false
	showNavigation: false
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

	if (a.y-b.y)/(a.x-b.x)>=0 then Math.min(a.y, b.y) else Math.max(a.y, b.y)

anchor  = board.create('point', [get_anchorX, get_anchorY])
anchor.setAttribute {visible: false}


# DEFINE TEXT LABELS
[xmin, ymax, xmax, ymin] = board_opts.boundingbox
xoffset = 2 # resulting of anchorX middle
yoffset = 1
xmargin = 0.5
ymargin = 0.75

values_checkbox = document.getElementById "show-values"
text_coords =
	'X': [
			() -> # x coordinate getter
				point = if anchor.X() - Ap.X() is 0 then Bp else Ap
				new_x = (anchor.X()+point.X())/2

				if new_x > xmax-xoffset-xmargin
					return xmax-xoffset-xmargin
				if new_x < xmin+xoffset+xmargin
					return xmin+xoffset+xmargin
				return new_x
			,
			() -> # y coordinate getter
				point = if anchor.X() - Ap.X() is 0 then Bp else Ap
				offset = 1

				return Math.min (anchor.Y()+point.Y())/2+offset, ymax-yoffset
			,
			() ->
				diff = round Ap.X()-Bp.X()

				hide = if values_checkbox.checked then '' else 'hide'
				return "
					<div class='values x-distance #{hide}'>
						#{diff}
					</div>
				"
	]
	'Y': [
			() ->
				point = if anchor.Y() - Ap.Y() is 0 then Bp else Ap
				new_x = (anchor.X()+point.X())/2 + 0.5

				[text_xmin,_,text_xmax,_] = this.bounds()
				width = text_xmax - text_xmin

				if new_x > xmax-(width+xmargin)
					return xmax-(width+xmargin)
				return new_x
			,
			() ->
				point = if anchor.Y() - Ap.Y() is 0 then Bp else Ap
				new_y = (anchor.Y()+point.Y())/2

				if new_y > ymax-ymargin
					return ymax-ymargin
				if new_y < ymin+ymargin
					return ymin+ymargin
				return new_y
			,
			() ->
				diff = round Ap.Y()-Bp.Y()
			
				hide = if values_checkbox.checked then '' else 'hide'
				return "
					<div class='values y-distance #{hide}'>
						#{diff}
					</div>
				"
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

dragging_point = null


# EVENT HANDLING
cb = ->
	num = round Ap.Y() - Bp.Y()
	denom = round Ap.X() - Bp.X()

	slope = round num/denom 
	$("#slope").mathquill('latex', "m=\\frac{#{num}}{#{denom}}\\approx #{slope}")

	BpY = Bp.Y()
	BpX = Bp.X()
	if BpY < 0
		BpY = "(#{BpY})"
	if BpX < 0
		BpX = "(#{BpX})"
	$("#slope-num").mathquill('latex', "\\Delta y=#{Ap.Y()}-#{BpY}=#{num}")
	$("#slope-denom").mathquill('latex', "\\Delta x=#{Ap.X()}-#{BpX}=#{denom}")

mouse_evt_handler = (evt) ->
	dragging_point = this
	document.addEventListener('mousemove', cb)

	document.addEventListener 'mouseup', ->
		document.removeEventListener('mousemove', cb)


JXG.addEvent(Ap.rendNode, 'mousedown', mouse_evt_handler, Ap)
JXG.addEvent(Bp.rendNode, 'mousedown', mouse_evt_handler, Bp)

discrete_option = document.getElementById 'discrete-toggle'
discrete_option.addEventListener 'change', ->

	values_texts = document.getElementsByClassName 'values'
	for text in values_texts
		text.classList.toggle 'discrete-text-size'

	setTimeout( =>
			Ap.setAttribute {snapToGrid: this.checked}
			Bp.setAttribute {snapToGrid: this.checked}
		, 1000)

dialogs_ids = ['formulae', 'values', 'slope']
for _dialog in dialogs_ids
	do (_dialog) ->
		dialog_checkbox = document.getElementById "show-#{_dialog}"
		dialog_checkbox.addEventListener 'change', =>
			dialogs = [document.getElementById _dialog]
			if !dialogs[0]
				dialogs = document.getElementsByClassName _dialog
			
			for dialog in dialogs
				dialog.classList.toggle 'hide'

renderLatex = ->
	formulae = 'm = \\frac{\\text{rise}}{\\text{run}}'
	formulae += '=\\frac{y_2-y_1}{x_2-x_1}'
	formulae += '=\\frac{\\Delta y}{\\Delta x}'

	$("#formulae").mathquill 'latex', formulae

	num = round Ap.Y() - Bp.Y()
	denom = round Ap.X() - Bp.X()

	BpY = Bp.Y()
	BpX = Bp.X()
	if BpY < 0
		BpY = "(#{BpY})"
	if BpX < 0
		BpX = "(#{BpX})"

	$("#slope-num").mathquill('latex', "\\Delta y=#{Ap.Y()}-#{BpY}=#{num}")
	$("#slope-denom").mathquill('latex', "\\Delta x=#{Ap.X()}-#{BpX}=#{denom}")
setTimeout(renderLatex , null)


# Materia.CreatorCore.start <start function needed>