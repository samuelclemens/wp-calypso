/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	SELECTED_SITE_SET,
	RECENTLY_SELECTED_SITE_SET,
	SET_SECTION
} from 'state/action-types';
import editor from './editor/reducer';

/**
 * Tracks the currently selected site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function selectedSiteId( state = null, action ) {
	switch ( action.type ) {
		case SELECTED_SITE_SET:
			state = action.siteId || null;
			break;
	}

	return state;
}

/**
 * Tracks the currently selected site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function recentlySelectedSites( state = [], action ) {
	switch ( action.type ) {
		case RECENTLY_SELECTED_SITE_SET:
			state = [ action.siteId, ...state ];
			if ( state.length > 4 ) {
				state.pop();
			}
			break;
	}

	return state;
}

export function section( state = false, action ) {
	if ( action.type === SET_SECTION && action.section !== undefined ) {
		state = action.section;
	}
	return state;
}

export function hasSidebar( state = true, action ) {
	if ( action.type === SET_SECTION && action.hasSidebar !== undefined ) {
		state = action.hasSidebar;
	}
	return state;
}

export function isLoading( state = false, action ) {
	if ( action.type === SET_SECTION && action.isLoading !== undefined ) {
		state = action.isLoading;
	}
	return state;
}

export function chunkName( state = false, action ) {
	if ( action.type === SET_SECTION && action.chunkName !== undefined ) {
		state = action.chunkName;
	}
	return state;
}

export default combineReducers( {
	section,
	isLoading,
	hasSidebar,
	chunkName,
	recentlySelectedSites,
	selectedSiteId,
	editor
} );
