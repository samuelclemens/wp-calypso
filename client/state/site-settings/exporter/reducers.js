/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import {
	EXPORT_ADVANCED_SETTINGS_FETCH,
	EXPORT_ADVANCED_SETTINGS_RECEIVE,
	SET_EXPORT_POST_TYPE,
	REQUEST_START_EXPORT,
	REPLY_START_EXPORT,
	FAIL_EXPORT,
	COMPLETE_EXPORT
} from 'state/action-types';

import { States } from './constants';

const initialUIState = Immutable.fromJS( {
	exportingState: States.READY,
	postType: null
} );

const initialDataState = Immutable.fromJS( {
	forSiteId: null,
	advancedSettings: {}
} );

/**
 * Reducer for managing the exporter UI
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function ui( state = initialUIState, action ) {
	switch ( action.type ) {
		case SET_EXPORT_POST_TYPE:
			return state.set( 'postType', action.postType );

		case REQUEST_START_EXPORT:
			return state.set( 'exportingState', States.STARTING );

		case REPLY_START_EXPORT:
			return state.set( 'exportingState', States.EXPORTING );

		case FAIL_EXPORT:
		case COMPLETE_EXPORT:
			return state.set( 'exportingState', States.READY );
	}

	return state;
}

export function data( state = initialDataState, action ) {
	switch ( action.type ) {
		case EXPORT_ADVANCED_SETTINGS_FETCH:
			return state
				.set( 'forSiteId', action.siteId )
				.set( 'advancedSettings', null );

		case EXPORT_ADVANCED_SETTINGS_RECEIVE:
			return state
				.set( 'forSiteId', action.siteId )
				.set( 'advancedSettings', Immutable.fromJS( action.advancedSettings ) );
	}

	return state;
}

export default combineReducers( {
	ui,
	data
} );
