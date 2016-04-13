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
	x: 0
	y: 0
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
	x: 2
	y: -1
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
}

Ap		= board.create('point', [A.x, A.y], A.opts)
Bp		= board.create('point', [B.x, B.y], B.opts)
getX = ->
	console.log 'x', A.x, B.x
	Math.max(A.x, B.x)
getY = ->
	console.log 'y', A.y, B.y,Math.min(A.y, B.y)
	Math.min(A.y, B.y)
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

cb = ->
	[_,x,y] = dragging_point.coords.usrCoords
	console.log dragging_point.name
	point = if dragging_point.name is A.opts.name then A else B
	point.x = x
	point.y = y

	[num, denom] = [A.y - B.y, A.x - B.x]
	slope = num/denom
	document.getElementById('slope').innerHTML = "m=#{num}/#{denom}=#{slope}"

mouse_evt_handler = (evt) ->
	is_dragging = !is_dragging

	dragging_point = this
	document.addEventListener('mousemove', cb)

	document.addEventListener 'mouseup', ->
		is_dragging = !is_dragging
		document.removeEventListener('mousemove', cb)


JXG.addEvent(Ap.rendNode, 'mousedown', mouse_evt_handler, Ap)
JXG.addEvent(Bp.rendNode, 'mousedown', mouse_evt_handler, Bp)
