loadScript = (url, callback) ->

	script = document.createElement("script")
	script.type = "text/javascript"

	if script.readyState
		script.onreadystatechange = () ->
			if script.readyState is "loaded" or script.readyState is "complete"
				script.onreadystatechange = null
				callback()
	else
		script.onload = () ->
			callback()

	script.src = url
	document.getElementsByTagName("head")[0].appendChild(script)

loadScript "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML", ->
	MathJax.Hub.Config {
		"HTML-CSS":
			eqChunk: 40
	}

	init()

init = ->
	model = {
		A:
			x: 0
			y: 0
		B:
			x: 2
			y: -1
		num: 1
		denom: 2
		slope: 1/2
	}

	pointColor = '#2F4EA2'

	# DEFINE BOARD
	board_opts = {
		boundingbox: [-10, 10, 10, -10],
		axis: true
		grid: true
	}
	board = JXG.JSXGraph.initBoard('jxgbox', board_opts)
	#=============

	# DEFINE POINTS
	A = {
		x: model.A.x
		y: model.A.y
		opts:
			name: 'A'
			size: 4
			face: 'o'
			snapSizeX: 1
			snapSizeY: 1
			snapToGrid: true
			fillColor: pointColor
			strokeColor: pointColor
	}

	B = {
		x: model.B.x
		y: model.B.y
		opts:
			name: 'B'
			size: 4
			face: 'o'
			snapSizeX: 1
			snapSizeY: 1
			snapToGrid: true
			fillColor: pointColor
			strokeColor: pointColor
	}

	anchorAB = {
		opts:
			name: 'anchor'
			fixed: true
			size: 0
	}

	Ap		= board.create('point', [A.x, A.y], A.opts)
	Bp		= board.create('point', [B.x, B.y], B.opts)
	getX = ->
		Math.max(model.A.x, model.B.x)
	getY = ->
		a = model.A
		b = model.B
		if a.x*a.y+b.x*b.y>0 then Math.min(a.y, b.y) else Math.max(a.y, b.y)

	anchor  = board.create('point', [getX, getY])
	#=============

	# DEFINE LINES
	ABline_opts = {
		strokeColor:'#006E9F'
		strokeWidth:2
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
		[_,x,y] = dragging_point.coords.usrCoords
		# update model
		point = if dragging_point.name is A.opts.name then model.A else model.B
		point.x = x
		point.y = y

		model.num = model.A.y - model.B.y
		model.denom = model.A.x - model.B.x


		num = model.A.y - model.B.y
		denom = model.A.x - model.B.x

		if num isnt old_num or denom isnt old_denom
			math = MathJax.Hub.getAllJax("slope")[0]
			MathJax.Hub.Queue(["Text",math,"\\frac{#{num}}{#{denom}}"]);

		old_num = num
		old_denom = denom

	mouse_evt_handler = (evt) ->
		is_dragging = !is_dragging

		dragging_point = this
		document.addEventListener('mousemove', cb)

		document.addEventListener 'mouseup', ->
			is_dragging = !is_dragging
			document.removeEventListener('mousemove', cb)


	JXG.addEvent(Ap.rendNode, 'mousedown', mouse_evt_handler, Ap)
	JXG.addEvent(Bp.rendNode, 'mousedown', mouse_evt_handler, Bp)

	dialogs = ['formula', 'values', 'slope']

	for _dialog in dialogs
		dialog = document.getElementById _dialog
		dialog_checkbox = document.getElementById "show-#{_dialog}"
		do (dialog) ->
			dialog_checkbox.addEventListener 'change', =>
				dialog.classList.toggle 'hide'

