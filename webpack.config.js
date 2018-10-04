const path = require('path')
const srcPath = path.join(process.cwd(), 'src')
// load the reusable legacy webpack config from materia-widget-dev
const wpc = require('materia-widget-development-kit/webpack-widget').getLegacyWidgetBuildConfig()
delete wpc.entry['creator.css']
delete wpc.entry['player.css']
wpc.entry['creator.css'] = [
	path.join(srcPath, 'creator.html'),
	path.join(srcPath, 'creator.css')
]
wpc.entry['player.css'] = [
	path.join(srcPath, 'player.html'),
	path.join(srcPath, 'player.css')
]
console.log(wpc.entry)
module.exports = wpc
