/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import shortcodeUtils from 'lib/shortcode';

class WpVideoView extends Component {

	static match( content ) {
		const match = shortcodeUtils.next( 'wpvideo', content );

		if ( match ) {
			return {
				index: match.index,
				content: match.content,
				options: {
					shortcode: match.shortcode
				}
			};
		}
	}

	static serialize( content ) {
		return encodeURIComponent( content );
	}

	getShortCodeAttributes() {
		const shortcode = shortcodeUtils.parse( this.props.content );
		const namedAttrs = shortcode.attrs.named;
		const defaultWidth = 640;
		const defaultHeight = defaultWidth * 9 / 16;
		return {
			videopress_guid: shortcode.attrs.numeric[0],
			w: parseInt( namedAttrs.w, 10 ) || defaultWidth,
			h: parseInt( namedAttrs.h, 10 ) || defaultHeight,
			autoplay: namedAttrs.autoplay === 'true',
			hd: namedAttrs.hd === 'true',
			loop: namedAttrs.loop === 'true',
			at: parseInt( namedAttrs.at, 10) || 0,
			defaultLangCode: namedAttrs.defaultlangcode || false
		};
	}

	getEmbedUrl( attrs ) {
		const nonUrlAttributes= ['videopress_guid', 'w', 'h'];
		const str = Object.keys( attrs ).filter( function ( key ) {
			return ! nonUrlAttributes.some( function ( k ) {
					return key === k;
				}
			)
		}).map(function ( key ) {
			return encodeURIComponent( key ) + '=' + encodeURIComponent( attrs[key] );
		}).join('&');

		return `https://videopress.com/embed/${ attrs.videopress_guid }?${ str }`;
	}

	render() {
		const attrs = this.getShortCodeAttributes();

		return (
			<div className="wpview-content">
				<iframe
					width = { attrs.w }
					height = { attrs.h }
					src={ this.getEmbedUrl( attrs ) }
					frameBorder="0"
					allowFullScreen />
			</div>
		);
	}

}

export default WpVideoView;
