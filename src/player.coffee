# UTILITY FUNCTIONS
# =================
round = (num) -> # 2 decimal places
	dec = 1
	p = Math.pow(10, dec)
	Math.round((num + 0.00001) * p) / p
# =================

# GRAPH
# =================
pointColor = '#2F4EA2'
opts =
	board:
		boundingbox: [-10, 10, 10, -10],
		axis: true
		grid: true
		showCopyright: false
		showNavigation: false
	Apoint:
		name: 'x'
		size: 4
		face: 'o'
		snapSizeX: 1
		snapSizeY: 1
		snapToGrid: true
		fillColor: pointColor
		strokeColor: pointColor
	Bpoint:
		name: 'y'
		size: 4
		face: 'o'
		snapSizeX: 1
		snapSizeY: 1
		snapToGrid: true
		fillColor: pointColor
		strokeColor: pointColor
	ABline:
		strokeColor:'#006E9F'
		strokeWidth:2
		fixed: true
	anchorLine:
		straightFirst: false
		straightLast: false
		strokeColor:'black'
		strokeWidth:2
		dash: 2

class Graph
	constructor: (opts) ->

		# DEFINE BOARD
		@board = JXG.JSXGraph.initBoard('jxgbox', opts.board)
		#=============

		points = @createPoints(opts.Apoint, opts.Bpoint)
		@createLabels(points, opts.board)
		@createLines(points, opts.ABline, opts.anchorLine)

		[@A, @B, _] = points

	createPoints: (opts...) ->
		[Aopts, Bopts] = opts

		A		= @board.create('point', [-5, 6], Aopts)
		B		= @board.create('point', [4, -4], Bopts)

		get_anchorX = =>
			Math.max(A.X(), B.X())
		get_anchorY = =>
			a = 
				x: A.X()
				y: A.Y()
			b = 
				x: B.X()
				y: B.Y()

			if (a.y-b.y)/(a.x-b.x)>=0 then Math.min(a.y, b.y) else Math.max(a.y, b.y)

		anchor  = @board.create('point', [get_anchorX, get_anchorY])
		anchor.setAttribute {visible: false}

		[A, B, anchor]
	
	createLabels: (points, opts) ->
		[A, B, anchor] = points

		# DEFINE TEXT LABELS
		[xmin, ymax, xmax, ymin] = opts.boundingbox
		xoffset = 0.5 # resulting of anchorX middle
		yoffset = 1
		xmargin = 0.5
		ymargin = 0.75

		values_checkbox = document.getElementById "show-values"

		test = 3
		text_coords =
			'X': [
					() -> # x coordinate getter
						point = if anchor.X() - A.X() is 0 then B else A
						new_x = (anchor.X()+point.X())/2

						offset = xoffset+xmargin
						if new_x > xmax-offset
							return xmax-offset
						if new_x < xmin+offset
							return xmin+offset
						return new_x
					,
					() -> # y coordinate getter
						point = if anchor.X() - A.X() is 0 then B else A
						offset = 1

						return Math.min (anchor.Y()+point.Y())/2+offset, ymax-yoffset
					,
					() ->
						diff = round A.X()-B.X()

						hide = if values_checkbox.checked then '' else 'hide'
						return "
							<div class='values x-distance #{hide}'>
								#{diff}
							</div>
						"
			]
			'Y': [
					() ->
						point = if anchor.Y() - A.Y() is 0 then B else A
						new_x = (anchor.X()+point.X())/2+xmargin

						[text_xmin,_,text_xmax,_] = this.bounds()
						width = text_xmax - text_xmin

						if new_x > xmax-width
							return xmax-width
						return new_x
					,
					() ->
						point = if anchor.Y() - A.Y() is 0 then B else A
						new_y = (anchor.Y()+point.Y())/2

						if new_y > ymax-ymargin
							return ymax-ymargin
						if new_y < ymin+ymargin
							return ymin+ymargin
						return new_y
					,
					() ->
						diff = round A.Y()-B.Y()
					
						hide = if values_checkbox.checked then '' else 'hide'
						return "
							<div class='values y-distance #{hide}'>
								#{diff}
							</div>
						"
			]

		@board.create('text', text_coords.X, {
				anchorX: 'middle'
				opacity: 0.8
			}
		)
		@board.create('text', text_coords.Y, {
				anchorY: 'middle'
				opacity: 0.8
			}
		)

	createLines: (points, opts...) ->
		[A, B, anchor] = points
		[ABline_opts, anchorLine_opts] = opts
		@board.create('line',[A, B], ABline_opts);
		@board.create('line',[A, anchor], anchorLine_opts);
		@board.create('line',[B, anchor], anchorLine_opts);
		#=============


graph = new Graph(opts)
[A, B] = [graph.A, graph.B]
# ==========================

# INTERFACE
# ==================

# EVENT HANDLING
update = ->
	[AX, AY, BX, BY] = (round num for num in [A.X(), A.Y(), B.X(), B.Y()])

	num = round AY-BY
	denom = round AX-BX

	slope = round num/denom
	slope = '\\infty' if not isFinite slope
	$("#slope").mathquill('latex', "m=\\frac{#{num}}{#{denom}}\\approx #{slope}")

	if BY < 0
		BY = "(#{BY})"
	if BX < 0
		BX = "(#{BX})"
	$("#slope-num").mathquill('latex', "\\Delta y=#{AY}-#{BY}=#{num}")
	$("#slope-denom").mathquill('latex', "\\Delta x=#{AX}-#{BX}=#{denom}")

addEventListeners = ->
	mouse_evt_handler = (evt) ->
		document.addEventListener('mousemove', update)

		document.addEventListener 'mouseup', ->
			document.removeEventListener('mousemove', update)

	JXG.addEvent(A.rendNode, 'mousedown', mouse_evt_handler, A)
	JXG.addEvent(B.rendNode, 'mousedown', mouse_evt_handler, B)


	# DIALOGS
	# ==================
	discrete_option = document.getElementById 'discrete-toggle'
	discrete_option.addEventListener 'change', ->

		values_texts = document.getElementsByClassName 'values'
		for text in values_texts
			text.classList.toggle 'discrete-text-size'

		setTimeout( =>
				A.setAttribute {snapToGrid: this.checked}
				B.setAttribute {snapToGrid: this.checked}
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
	# ==================

	# MODAL
	# # ==================
	modal = document.getElementById('myModal')
	span = document.getElementsByClassName('close')[0]

	modal.style.display = 'block'
	span.onclick = ->
		modal.style.display = 'none'
		return
	window.onclick = (event) ->
		if event.target == modal
			modal.style.display = 'none'
		return
	# ==================

	# highlight relevant value on hover
	# svg = document.getElementsByTagName('svg')[0]
	# slopeBoxes = document.getElementsByClassName 'slope-boxes'
	# for slopeBox in slopeBoxes
	# 	slopeBox.addEventListener 'mouseover', ->
	# 		svg.classList.add 'fade'
	# 	slopeBox.addEventListener 'mouseout', ->
	# 		svg.classList.remove 'fade'

# INITIALIZE
init = ->
	formulae = 'm = \\frac{\\text{rise}}{\\text{run}}'
	formulae += '=\\frac{y_2-y_1}{x_2-x_1}'
	formulae += '=\\frac{\\Delta y}{\\Delta x}'

	$("#formulae").mathquill 'latex', formulae

	update()
	addEventListeners()
setTimeout(init, null)


Materia.Engine.start {start: (instance, qset, version = '1') ->
		# once everything is drawn, set the height of the player
		Materia.Engine.setHeight()
}