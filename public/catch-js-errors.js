var stringifyErrorForUrlParams = function( error ) {
	var simpleObject = {};
	Object.getOwnPropertyNames( error ).forEach( function( key ) {
		simpleObject[ key ] = encodeURIComponent( error[ key ] );
	} );
	return JSON.stringify( simpleObject );
};

function sendErrorsToAPI( message, scriptUrl, lineNumber, columnNumber, error ) {
	var xhr = new XMLHttpRequest(), params;

	error = error || new Error( message );

	// Add user agent if we have if
	if ( navigator && navigator.userAgent ) {
		error.userAgent = navigator.userAgent;
	}

	// POST to the API
	xhr.open( 'POST', 'https://public-api.wordpress.com/rest/v1.1/js-error?http_envelope=1', true );
	xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );

	params = 'client_id=39911&client_secret=cOaYKdrkgXz8xY7aysv4fU6wL6sK5J8a6ojReEIAPwggsznj4Cb6mW0nffTxtYT8&error=' + stringifyErrorForUrlParams( error );
	xhr.send( params );
}

if ( ( localStorage.getItem( 'log-errors' ) !== undefined && localStorage.getItem( 'log-errors' ) === 'true' ) || Math.random() <= 0.01 ) {
	localStorage.setItem( 'log-errors', true );

	// set up handler to POST errors
	window.onerror = sendErrorsToAPI;
}
