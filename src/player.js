// MathQuill requires jQuery.fn.andSelf but its ben deprecated
jQuery.fn.andSelf = jQuery.fn.addBack

// UTILITY FUNCTIONS
const round = function(num) {
	// 2 decimal places
	const p = Math.pow(10, 2)
	return Math.round((num + 0.00001) * p) / p
}

const setupCheckboxChangeListener = function(selector, checkbox) {
	const checkboxEl = document.getElementById(checkbox)
	checkboxEl.addEventListener('change', () => {
		let dialogs = Array.from(document.querySelectorAll(selector))
		dialogs.forEach(dialog => {
			dialog.classList.toggle('hide')
			if (dialog.classList.contains('hide')) {
				dialog.setAttribute('inert', 'true')
				dialog.setAttribute('aria-hidden', 'true')
			}
			else {
				dialog.removeAttribute('inert')
				dialog.setAttribute('aria-hidden', 'false')
			}
		})
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
		fixed: true,
		tabindex: -1
	},
	anchorLine: {
		straightFirst: false,
		straightLast: false,
		strokeColor: 'black',
		strokeWidth: 2,
		dash: 2,
		tabindex: -1
	}
}

let modalOpen = true

class Graph {
	constructor(opts) {
		this.board = JXG.JSXGraph.initBoard('jxgbox', opts.board)

		const points = this.initializePoints(opts.Apoint, opts.Bpoint)
		const labels = this.createLabels(points, opts.board)
		this.createLines(points, opts.ABline, opts.anchorLine)

		this.A = points[0]
		this.B = points[1]
		this.deltaX = labels[0]
		this.deltaY = labels[1]
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
					return `<div tabindex="0" class='values x-distance ${hide}' aria-label="Delta X ;=; ${diff}">${diff}</div>`
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
					return `<div tabindex="0" class='values y-distance ${hide}' aria-label="Delta Y ;=; ${diff}">${diff}</div>`
				}
			]
		}

		let xDeltaVal = this.board.create('text', text_coords.X, {
			anchorX: 'middle',
			opacity: 0.8,
			isLabel: true,
		})
		let yDeltaVal = this.board.create('text', text_coords.Y, {
			anchorY: 'middle',
			opacity: 0.8,
			isLabel: true,
			tabindex: 0
		})

		return [xDeltaVal, yDeltaVal]
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
		$('#slope').attr('aria-label', `Slope is approximately equal to ;${slope}; Found by dividing ; ${num} ; by; ${denom}`)

		if (BY < 0) {
			BY = `(${BY})`
		}

		if (BX < 0) {
			BX = `(${BX})`
		}

		let labelAX = round(this.A.X())
		let labelAY = round(this.A.Y())
		let labelBX = round(this.B.X())
		let labelBY = round(this.B.Y())

		this.A.setLabel("A (" + labelAX + ", " + labelAY + ")")
		this.B.setLabel("B (" + labelBX + ", " + labelBY + ")")
		this.A.rendNode.setAttribute('aria-label', "Point A; 'x' position is; " + labelAX + "; 'y' position is; " + labelAY)
		this.B.rendNode.setAttribute('aria-label', "Point B; 'x' position is; " + labelBX + "; 'y' position is; " + labelBY)

		$('#slope-num').mathquill('latex', `\\Delta y=${AY}-${BY}=${num}`)
		$('#slope-denom').mathquill('latex', `\\Delta x=${AX}-${BX}=${denom}`)

		// Set aria-labels of slope
		$('#slope-num').attr('aria-label', `Delta y = the difference between A's y-value and B's y-value which =; ${AY} ;minus; ${BY} ;=; ${num}`)
		$('#slope-denom').attr('aria-label', `Delta x = the difference between A's x-value and B's x-value which =; ${AX} ;minus; ${BX} ;=; ${denom}`)
	}
}

const closeModal = (graph) => {
	// graph doesn't always initialize values in start, initialize here
	if (graph)
		graph.update()

	const modal = document.getElementById('myModal')
	document.getElementById('main-container').removeAttribute('inert')
	document.getElementById('main-container').removeAttribute('aria-hidden')
	modal.style.display = 'none'
	modalOpen = false
}

const openModal = () => {
	const modal = document.getElementById('myModal')
	modal.style.display = 'block'
	document.getElementById('main-container').setAttribute('inert', 'true')
	document.getElementById('main-container').setAttribute('aria-hidden', 'true')
	modalOpen = true
	document.getElementById('modal-close').focus()
}

const assistiveAlert = (msg) => {
	document.getElementById('assistive-alert').innerText = msg;
}

const keyboardEvent = (e) => {
	if (e.key == 'S' || e.key == 's') {
		assistiveAlert($('#slope').attr('aria-label'))
	} else if (e.key == 'H' || e.key == 'h') {
		if (!modalOpen) openModal()
		else closeModal()
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

		graph.A.on('drag', (e) => {
			assistiveAlert(round(graph.A.X()) + "; " + round(graph.A.Y()) + "; Point A is now at position: " + round(graph.A.X()) + "; " + round(graph.A.Y()))
		})
		graph.B.on('drag', (e) => {
			assistiveAlert(round(graph.B.X()) + "; " + round(graph.B.Y()) + "; Point A is now at position: " + round(graph.B.X()) + "; " + round(graph.B.Y()))
		})

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

		document.getElementById('modal-close').addEventListener('click', () => closeModal(graph))

		document.addEventListener('keydown', keyboardEvent)

		graph.update()
		Materia.Engine.setHeight()
	}
})
