/**
 * Created by yury on 1/29/16.
 */

export function createCommentTargetId( siteId, postId ) {
	return `${ siteId }-${ postId }`;
}

export function createRequestId( siteId, postId, query ) {
	return `${siteId}-${postId}-${ JSON.stringify( query ) }`;
}

export function createUrlFromTemplate( urlTemplate, urlParams, queryParams ) {
	let constructedUrl = urlTemplate;

	Object.keys( urlParams ).forEach( ( key ) => {
		const regex = new RegExp( '\\$' + key, 'g' );
		constructedUrl = constructedUrl.replace( regex, urlParams[ key ] );
	} );

	if ( queryParams ) {
		constructedUrl += '?' + Object.keys( queryParams )
				.map( ( param ) => param + '=' + encodeURIComponent( queryParams[ param ] ) )
				.join( '&' );
	}

	return constructedUrl;
}

export function fieldsMapper( fields, input ) {
	let output = {};

	fields.forEach( ( fieldName ) => output[ fieldName ] = input[ fieldName ] );

	return output;
}
