/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import PostSelector from '../';

export default React.createClass( {
	displayName: 'PostSelector',

	mixins: [ PureRenderMixin ],

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/app-components/post-selector">Post Selector</a>
				</h2>
				<div style={ { width: 300 } }>
					<PostSelector
						siteId={ 3584907 }
						type="any"
						orderBy="date"
						order="DESC" />
				</div>
			</div>
		);
	}
} );
