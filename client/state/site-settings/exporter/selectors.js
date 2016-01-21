/**
 * External dependencies
 */
import moment from 'moment';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';

import { States } from './constants.js';

function mapOptions( state, section, name, mapFunc ) {
	const rawData = state.siteSettings.exporter.data.get( 'advancedSettings' );
	if ( !rawData || rawData.count() === 0 ) return [];

	return rawData.getIn( [ section, name ] ).map( mapFunc );
}

export function getAuthorOptions( state, section ) {
	return mapOptions( state, section, 'authors', ( author ) => ( {
		value: author.get( 'ID' ),
		label: author.get( 'name' )
	} ) );
}

export function getStatusOptions( state, section ) {
	return mapOptions( state, section, 'statuses', ( status ) => ( {
		value: status.get( 'name' ),
		label: status.get( 'label' )
	} ) );
}

export function getDateOptions( state, section, endOfMonth ) {
	return mapOptions( state, section, 'export_date_options', ( date ) => {
		const year = parseInt( date.get( 'year' ), 10 );
		// API months start at 1 (Jan = 1)
		const month = parseInt( date.get( 'month' ), 10 );
		// JS months start at 0 (Jan = 0)
		const jsMonth = month - 1;

		if ( month === 0 || year === 0 ) {
			return {
				value: '0',
				label: i18n.translate( 'Unknown' )
			}
		}

		let time = moment( { year: year, month: jsMonth, day: 1 } );

		if ( endOfMonth ) {
			time = time.endOf( 'month' );
		}

		return {
			// eg: 2015-06-30
			value: time.format( 'YYYY-MM-DD' ),

			// eg: Dec 2015
			label: time.format( 'MMM YYYY' )
		}
	} );
}

export function getCategoryOptions( state, section ) {
	return mapOptions( state, section, 'categories', ( category ) => ( {
		value: category.get( 'name' ),
		label: category.get( 'name' )
	} ) );
}

/**
 * Indicates that the available options in the advanced settings section
 * are being loaded
 *
 * @param  {Object} state    Global state tree
 * @return {boolean}         true if activity is in progress
 */
export function isLoadingOptions( state ) {
	const dataState = getDataState( state );

	// The options are being loaded if a site ID has been set but the options are null
	return !!( dataState.forSiteId && ! dataState.advancedSettings );
}

/**
 * Indicates whether an export activity is in progress.
 *
 * @param  {Object} state    Global state tree
 * @return {boolean}         true if activity is in progress
 */
export function shouldShowProgress( state ) {
	const exportingState = getUIState( state ).exportingState;

	return ( exportingState === States.STARTING || exportingState === States.EXPORTING );
}

/**
 * Return the exporter UI state as a plain JS object.
 *
 * @param  {Object} state    Global state tree
 * @return {Object}          Exporter UI state
 */
export function getUIState( state ) {
	return state.siteSettings.exporter.ui.toJS();
}

export function getDataState( state ) {
	return state.siteSettings.exporter.data.toJS();
}
