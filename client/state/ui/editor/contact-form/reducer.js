/**
 * Internal dependencies
 */
import { CONTACT_FORM_LOAD_FORM, CONTACT_FORM_ADD_DEFAULT_FIELD, CONTACT_FORM_REMOVE_FIELD, CONTACT_FORM_CLEAR_FORM } from './action-types';
import { CONTACT_FORM_DEFAULT, CONTACT_FORM_DEFAULT_NEW_FIELD } from './constants';

export default function( state = CONTACT_FORM_DEFAULT, action ) {
	switch ( action.type ) {
		case CONTACT_FORM_LOAD_FORM:
			state = Object.assign( {}, action.contactForm );
			break;
		case CONTACT_FORM_ADD_DEFAULT_FIELD:
			state = Object.assign( {}, state, {
				fields: [ ...state.fields, CONTACT_FORM_DEFAULT_NEW_FIELD ]
			} );
			break;
		case CONTACT_FORM_REMOVE_FIELD:
			const { index } = action;
			state = Object.assign( {}, state );
			state.fields.splice( index, 1 );
			break;
		case CONTACT_FORM_CLEAR_FORM:
			state = Object.assign( {}, CONTACT_FORM_DEFAULT );
			break;
	}

	return state;
}
