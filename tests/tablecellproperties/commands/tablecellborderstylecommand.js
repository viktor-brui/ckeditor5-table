/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { assertTableCellStyle, modelTable, setTableCellWithObjectAttributes } from '../../_utils/utils';
import TableCellPropertiesEditing from '../../../src/tablecellproperties/tablecellpropertiesediting';
import TableCellBorderStyleCommand from '../../../src/tablecellproperties/commands/tablecellborderstylecommand';

describe( 'table cell properties', () => {
	describe( 'commands', () => {
		describe( 'TableCellBorderStyleCommand', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellBorderStyleCommand( editor );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'isEnabled', () => {
				describe( 'collapsed selection', () => {
					it( 'should be false if selection does not have table cell', () => {
						setData( model, '<paragraph>foo[]</paragraph>' );
						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true is selection has table cell', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );
						expect( command.isEnabled ).to.be.true;
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table cell', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );
						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true is selection has table cell', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ] ) );
						expect( command.isEnabled ).to.be.true;
					} );
				} );
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table cell has no borderStyle property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table cell has borderStyle property (single string)', () => {
						setData( model, modelTable( [ [ { borderStyle: 'ridge', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.equal( 'ridge' );
					} );

					it( 'should be set if selected table cell has borderStyle property object with same values', () => {
						setTableCellWithObjectAttributes( model, {
							borderStyle: {
								top: 'ridge',
								right: 'ridge',
								bottom: 'ridge',
								left: 'ridge'
							}
						}, '[]foo' );
						expect( command.value ).to.equal( 'ridge' );
					} );

					it( 'should be undefined if selected table cell has borderStyle property object with different values', () => {
						setTableCellWithObjectAttributes( model, {
							borderStyle: {
								top: 'ridge',
								right: 'dashed',
								bottom: 'ridge',
								left: 'ridge'
							}
						}, '[]foo' );

						expect( command.value ).to.be.undefined;
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table cell', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be true is selection has table cell', () => {
						setData( model, modelTable( [ [ { borderStyle: 'ridge', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.equal( 'ridge' );
					} );
				} );
			} );

			describe( 'execute()', () => {
				it( 'should use provided batch', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );
					const batch = model.createBatch();
					const spy = sinon.spy( model, 'enqueueChange' );

					command.execute( { value: 'solid', batch } );
					sinon.assert.calledWith( spy, batch );
				} );

				describe( 'collapsed selection', () => {
					it( 'should set selected table cell borderStyle to a passed value', () => {
						setData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: 'solid' } );

						assertTableCellStyle( editor, 'border-bottom:solid;border-left:solid;border-right:solid;border-top:solid;' );
					} );

					it( 'should change selected table cell borderStyle to a passed value', () => {
						setData( model, modelTable( [ [ { borderStyle: 'ridge', contents: '[]foo' } ] ] ) );

						command.execute( { value: 'solid' } );

						assertTableCellStyle( editor, 'border-bottom:solid;border-left:solid;border-right:solid;border-top:solid;' );
					} );

					it( 'should remove borderStyle from a selected table cell if no value is passed', () => {
						setData( model, modelTable( [ [ { borderStyle: 'ridge', contents: '[]foo' } ] ] ) );

						command.execute();

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should set selected table cell borderStyle to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'solid' } );

						assertTableCellStyle( editor, 'border-bottom:solid;border-left:solid;border-right:solid;border-top:solid;' );
					} );

					it( 'should change selected table cell borderStyle to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'solid' } );

						assertTableCellStyle( editor, 'border-bottom:solid;border-left:solid;border-right:solid;border-top:solid;' );
					} );

					it( 'should remove borderStyle from a selected table cell if no value is passed', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute();

						assertTableCellStyle( editor, '' );
					} );
				} );
			} );
		} );
	} );
} );
