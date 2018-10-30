const path = require('path')
const srcPath = path.join(process.cwd(), 'src') + path.sep
const outputPath = path.join(__dirname, 'build') + path.sep
const widgetWebpack = require('materia-widget-development-kit/webpack-widget')
const entries = widgetWebpack.getDefaultEntries()
const copy = widgetWebpack.getDefaultCopyList()

// no creator
delete entries['creator.css']
delete entries['creator.js']

const customCopy = copy.concat([
	{
		from: path.join(process.cwd(), 'node_modules', 'jsxgraph', 'distrib', 'jsxgraphcore.js'),
		to: path.join(outputPath, 'vendor', 'jsxgraph')
	},
	{
		from: path.join(process.cwd(), 'node_modules', 'jquery', 'dist', 'jquery.min.js'),
		to: path.join(outputPath, 'vendor', 'jquery')
	},
	{
		from: path.join(process.cwd(), 'node_modules', 'mathquill', 'build'),
		to: path.join(outputPath, 'vendor', 'mathquill')
	},
])

// options for the build
let options = {
	entries: entries,
	copyList: customCopy
}

module.exports = widgetWebpack.getLegacyWidgetBuildConfig(options)
