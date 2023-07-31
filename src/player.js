// MathQuill requires jQuery.fn.andSelf but its ben deprecated
jQuery.fn.andSelf = jQuery.fn.addBack

// UTILITY FUNCTIONS
const round = function(num) {
	// 2 decimal places
	const p = Math.pow(10, 1)
	return Math.round((num + 0.00001) * p) / p
}

const setupCheckboxChangeListener = function(selector, checkbox) {
	const checkboxEl = document.getElementById(checkbox)
	checkboxEl.addEventListener('change', () => {
		let dialogs = Array.from(document.querySelectorAll(selector))
		dialogs.map(dialog => dialog.classList.toggle('hide'))
	})
}

// GRAPH options
const pointColor = '#2F4EA2'
const opts = {
	board: {
		boundingbox: [-10, 10, 10, -10],
		axis: true,
		grid: true,
		showCopyright: false,
		showNavigation: false
	},
	Apoint: {
		name: 'x',
		size: 4,
		face: 'o',
		snapSizeX: 1,
		snapSizeY: 1,
		snapToGrid: true,
		fillColor: pointColor,
		strokeColor: pointColor
	},
	Bpoint: {
		name: 'y',
		size: 4,
		face: 'o',
		snapSizeX: 1,
		snapSizeY: 1,
		snapToGrid: true,
		fillColor: pointColor,
		strokeColor: pointColor
	},
	ABline: {
		strokeColor: '#006E9F',
		strokeWidth: 2,
		fixed: true
	},
	anchorLine: {
		straightFirst: false,
		straightLast: false,
		strokeColor: 'black',
		strokeWidth: 2,
		dash: 2
	}
}

class Graph {
	constructor(opts) {
		this.board = JXG.JSXGraph.initBoard('jxgbox', opts.board)

		const points = this.initializePoints(opts.Apoint, opts.Bpoint)
		this.createLabels(points, opts.board)
		this.createLines(points, opts.ABline, opts.anchorLine)

		this.A = points[0]
		this.B = points[1]
	}

	initializePoints(optionsForA, optionsForB) {
		const Apoint = this.board.create('point', [-5, 6], optionsForA)
		const Bpoint = this.board.create('point', [4, -4], optionsForB)

		// create some arrow functions that hold onto A and B references
		const get_anchorX = () => Math.max(Apoint.X(), Bpoint.X())

		const get_anchorY = () => {
			const a = {
				x: Apoint.X(),
				y: Apoint.Y()
			}

			const b = {
				x: Bpoint.X(),
				y: Bpoint.Y()
			}

			if ((a.y - b.y) / (a.x - b.x) >= 0) {
				return Math.min(a.y, b.y)
			}

			return Math.max(a.y, b.y)
		}

		const anchor = this.board.create('point', [get_anchorX, get_anchorY])
		anchor.setAttribute({ visible: false })

		return [Apoint, Bpoint, anchor]
	}

	createLabels(points, opts) {
		const Apoint = points[0]
		const Bpoint = points[1]
		const anchor = points[2]

		// DEFINE TEXT LABELS
		const xmin = opts.boundingbox[0]
		const ymax = opts.boundingbox[1]
		const xmax = opts.boundingbox[2]
		const ymin = opts.boundingbox[3]
		const xoffset = 0.5 // resulting of anchorX middle
		const yoffset = 1
		const xmargin = 0.5
		const ymargin = 0.75

		const values_checkbox = document.getElementById('show-values')

		const test = 3
		const text_coords = {
			X: [
				// x coordinate getter
				function() {
					const point = anchor.X() - Apoint.X() === 0 ? Bpoint : Apoint
					const new_x = (anchor.X() + point.X()) / 2

					const offset = xoffset + xmargin
					if (new_x > xmax - offset) {
						return xmax - offset
					}

					if (new_x < xmin + offset) {
						return xmin + offset
					}

					return new_x
				},
				function() {
					// y coordinate getter
					const point = anchor.X() - Apoint.X() === 0 ? Bpoint : Apoint
					const offset = 1

					return Math.min((anchor.Y() + point.Y()) / 2 + offset, ymax - yoffset)
				},
				function() {
					const diff = round(Apoint.X() - Bpoint.X())

					const hide = values_checkbox.checked ? '' : 'hide'
					return `<div class='values x-distance ${hide}'>${diff}</div>`
				}
			],
			Y: [
				function() {
					const point = anchor.Y() - Apoint.Y() === 0 ? Bpoint : Apoint
					const new_x = (anchor.X() + point.X()) / 2 + xmargin
					const bounds = this.bounds()
					const text_xmin = bounds[0]
					const text_xmax = bounds[2]
					const width = text_xmax - text_xmin

					if (new_x > xmax - width) {
						return xmax - width
					}

					return new_x
				},
				function() {
					const point = anchor.Y() - Apoint.Y() === 0 ? Bpoint : Apoint
					const new_y = (anchor.Y() + point.Y()) / 2

					if (new_y > ymax - ymargin) {
						return ymax - ymargin
					}
					if (new_y < ymin + ymargin) {
						return ymin + ymargin
					}
					return new_y
				},
				function() {
					const diff = round(Apoint.Y() - Bpoint.Y())

					const hide = values_checkbox.checked ? '' : 'hide'
					return `<div class='values y-distance ${hide}'>${diff}</div>`
				}
			]
		}

		this.board.create('text', text_coords.X, {
			anchorX: 'middle',
			opacity: 0.8
		})
		return this.board.create('text', text_coords.Y, {
			anchorY: 'middle',
			opacity: 0.8
		})
	}

	createLines(points, ...opts) {
		const Apoint = points[0]
		const Bpoint = points[1]
		const anchor = points[2]
		const ABline_opts = opts[0]
		const anchorLine_opts = opts[1]
		this.board.create('line', [Apoint, Bpoint], ABline_opts)
		this.board.create('line', [Apoint, anchor], anchorLine_opts)
		return this.board.create('line', [Bpoint, anchor], anchorLine_opts)
	}

	update() {
		const AX = round(this.A.X())
		const AY = round(this.A.Y())
		let BX = round(this.B.X())
		let BY = round(this.B.Y())
		const num = round(AY - BY)
		const denom = round(AX - BX)
		let slope = round(num / denom)
		if (!isFinite(slope)) {
			slope = '\\infty'
		}

		$('#slope').mathquill(
			'latex',
			`m=\\frac{${num}}{${denom}}\\approx ${slope}`
		)

		if (BY < 0) {
			BY = `(${BY})`
		}

		if (BX < 0) {
			BX = `(${BX})`
		}

		$('#slope-num').mathquill('latex', `\\Delta y=${AY}-${BY}=${num}`)
		$('#slope-denom').mathquill('latex', `\\Delta x=${AX}-${BX}=${denom}`)
	}
}

Materia.Engine.start({
	start(instance, qset, version) {
		const formulae =
			'm = \\frac{\\text{rise}}{\\text{run}}' +
			'=\\frac{y_2-y_1}{x_2-x_1}' +
			'=\\frac{\\Delta y}{\\Delta x}'

		$('#formulae').mathquill('latex', formulae)

		const graph = new Graph(opts)
		graph.A.on('drag', graph.update.bind(graph))
		graph.B.on('drag', graph.update.bind(graph))

		// checkboxes
		setupCheckboxChangeListener('#formulae', 'show-formulae')
		setupCheckboxChangeListener('#slope', 'show-slope')
		setupCheckboxChangeListener('.values', 'show-values')

		const snapToIntsEl = document.getElementById('snap-to-integers')
		snapToIntsEl.addEventListener('change', function(e) {
			const onOff = e.target.checked
			graph.A.setAttribute({ snapToGrid: onOff })
			graph.B.setAttribute({ snapToGrid: onOff })
		})

		// modal close
		window.onclick = function(event) {
			const modal = document.getElementById('myModal')
			document.getElementById('main-container').removeAttribute('inert')
			modal.style.display = 'none'
		}

		graph.update()
		Materia.Engine.setHeight()
	}
})
