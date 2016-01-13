/**
 * External dependencies
 */
import React from 'react'

/**
 * Internal dependencies
 */
import PluginInstallation from './installation';

module.exports = React.createClass( {

	displayName: 'PlanSetup',

	runInstall: function() {
		let steps = PluginInstallation.start( {
			site: this.props.selectedSite,
			plugins: [ 'vaultpress' ]
		} );

		steps.on( 'data', ( step ) => {
			console.log( step );
			// Update component state
		} );
	},

	render() {
		this.runInstall();
		return (
			<div>
				<h1>Setting up your plan…</h1>
				<p>Most of this will happen automatically, in steps, so we can notify the user what&apos;s happening</p>
			</div>
		)
	}

} );
