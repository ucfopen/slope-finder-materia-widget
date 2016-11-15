engineName: ""
title     : ""

### Materia Interface Methods ###
materiaInterface =
	initNewWidget: (widget, baseUrl) ->
		title = engineName = widget.name
		$('#publish-update').text('Publish')
	onSaveComplete: (title, widget, qset, version) -> null
	onQuestionImportComplete: (items) -> true
	onMediaImportComplete: (media) -> null
	initExistingWidget: (title,widget,qset,version,baseUrl) ->
		$('#publish-update').text('Update')
		$('#widget-engine-name').text(widget.name)
		title = title
	onSaveClicked: (mode = 'save') ->
		saveData =
			name: ''
			items: []

		title = $("#widget-title").val()

		if title
			Materia.CreatorCore.save title, saveData
		else Materia.CreatorCore.cancelSave 'This widget has no title!'

Materia.CreatorCore.start materiaInterface