/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import RemoveRowCommand from '../../src/commands/removerowcommand';
import { defaultConversion, defaultSchema, modelTable } from '../_utils/utils';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'RemoveRowCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new RemoveRowCommand( editor );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true if selection is inside table cell', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			] ) );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if selection is inside table with one row only', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ]
			] ) );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection is outside a table', () => {
			setData( model, '<paragraph>11[]</paragraph>' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should remove a given row', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '<paragraph>01[]</paragraph>' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should remove a given row from a table start', () => {
			setData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '<paragraph>[]10</paragraph>', '11' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should change heading rows if removing a heading row', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			], { headingRows: 2 } ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '<paragraph>01[]</paragraph>' ],
				[ '20', '21' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should decrease rowspan of table cells from previous rows', () => {
			setData( model, modelTable( [
				[ { rowspan: 4, contents: '00' }, { rowspan: 3, contents: '01' }, { rowspan: 2, contents: '02' }, '03', '04' ],
				[ { rowspan: 2, contents: '13' }, '14' ],
				[ '22[]', '23', '24' ],
				[ '30', '31', '32', '33', '34' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { rowspan: 3, contents: '00' }, { rowspan: 2, contents: '01' }, { rowspan: 2, contents: '02' }, '03', '04' ],
				[ '13', '<paragraph>14[]</paragraph>' ],
				[ '30', '31', '32', '33', '34' ]
			] ) );
		} );

		it( 'should move rowspaned cells to row below removing it\'s row', () => {
			setData( model, modelTable( [
				[ { rowspan: 3, contents: '[]00' }, { rowspan: 2, contents: '01' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { rowspan: 2, contents: '[]00' }, '01', '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			] ) );
		} );
	} );
} );
