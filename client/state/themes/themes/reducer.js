/**
 * External dependencies
 */
import { fromJS, Map } from 'immutable';
import transform from 'lodash/object/transform';

/**
 * Internal dependencies
 */
import ActionTypes from '../action-types';

const initialState = fromJS( {
	themes: {},
	currentSiteId: 0
} );

function add( newThemes, ts ) {
	return ts.merge( transform( newThemes, ( result, theme ) => {
		result[ theme.id ] = theme;
	}, {} ) );
}

function setActiveTheme( themeId, ts ) {
	return ts
		.map( theme => theme.delete( 'active' ) )
		.setIn( [ themeId, 'active' ], true );
}

export default ( state = initialState, action ) => {
	switch ( action.type ) {
		case ActionTypes.RECEIVE_THEMES:
			const isNewSite = action.isJetpack && ( action.siteId !== state.get( 'currentSiteId' ) );
			return state
				.update( 'themes', ts => isNewSite ? new Map() : ts )
				.set( 'currentSiteId', action.siteId )
				.update( 'themes', add.bind( null, action.themes ) );

		case ActionTypes.ACTIVATED_THEME:
			return state.update( 'themes', setActiveTheme.bind( null, action.theme.id ) );
	}
	return state;
};
