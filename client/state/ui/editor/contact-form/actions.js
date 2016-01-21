/**
 * Internal dependencies
 */
import { CONTACT_FORM_LOAD_FORM, CONTACT_FORM_ADD_DEFAULT_FIELD, CONTACT_FORM_REMOVE_FIELD, CONTACT_FORM_CLEAR_FORM } from './action-types';

/**
 * Returns an action object to be used in signalling that a contact form dialog
 * has to be initialized.
 *
 * @param  {Object} contactForm
 * @return {Object} Action object
 */
export function loadForm( contactForm ) {
	return {
		type: CONTACT_FORM_LOAD_FORM,
		contactForm
	};
}

export function addDefaultField() {
	return { type: CONTACT_FORM_ADD_DEFAULT_FIELD };
}

export function removeField( index ) {
	return {
		type: CONTACT_FORM_REMOVE_FIELD,
		index
	}
}

export function clearForm() {
	return {
		type: CONTACT_FORM_CLEAR_FORM
	}
}
