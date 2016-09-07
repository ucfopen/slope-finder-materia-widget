<?php
/**
 * @group App
 * @group Materia
 * @group Score
 * @group Crossword
 */
class Test_Score_Modules_SlopeFinder extends \Basetest
{

	protected function _get_qset()
	{
		return json_decode('
			{
				"items":[],
				"name":"",
				"options":[],
				"assets":[],
				"rand":false
			}
		');
	}

	protected function _make_widget()
	{
		$this->_asAuthor();

		$title = 'SLOPE FINDER SCORE MODULE TEST';
		$widget_id = $this->_find_widget_id('Crossword');
		$qset = (object) ['version' => 1, 'data' => $this->_get_qset()];

		return \Materia\Api::widget_instance_save($widget_id, $title, $qset, false);
	}

	public function test_check_answer()
	{
		
	}

	public function test_check_answer_partial()
	{
		
	}

}