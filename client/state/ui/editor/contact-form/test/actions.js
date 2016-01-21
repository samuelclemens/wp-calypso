/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { CONTACT_FORM_DEFAULT } from '../constants';
import { CONTACT_FORM_LOAD_FORM, CONTACT_FORM_ADD_DEFAULT_FIELD, CONTACT_FORM_REMOVE_FIELD, CONTACT_FORM_CLEAR_FORM } from '../action-types';
import { loadForm, addDefaultField, removeField, clearForm } from '../actions';

describe( 'actions', () => {
	it( 'should return an action object to signal the initialization of the store', () => {
		const action = loadForm( CONTACT_FORM_DEFAULT );

		assert.deepEqual( action, {
			type: CONTACT_FORM_LOAD_FORM,
			contactForm: CONTACT_FORM_DEFAULT
		} );
	} );

	it( 'should return an action object to signal the creation of a new default field', () => {
		const action = addDefaultField();

		assert.deepEqual( action, { type: CONTACT_FORM_ADD_DEFAULT_FIELD } );
	} );

	it( 'should return an action object to signal the removal of a field by index', () => {
		const action = removeField( 1 );

		assert.deepEqual( action, {
			type: CONTACT_FORM_REMOVE_FIELD,
			index: 1
		} );
	} );

	it( 'should return an action object to signal the removal of the contact form data', () => {
		const action = clearForm();

		assert.deepEqual( action, { type: CONTACT_FORM_CLEAR_FORM } );
	} );
} );
