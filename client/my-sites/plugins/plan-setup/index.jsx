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

	getInitialState: function() {
		return {
			keys: {},
			status: 'not-started', // installing $plugin, configuring $plugin, finished, error
		};
	},

	componentDidMount: function() {
		this.runInstall();
	},

	runInstall: function() {
		let steps = PluginInstallation.start( {
			site: this.props.selectedSite,
			plugins: [ 'vaultpress' ]
		} );

		steps.on( 'data', ( step ) => {
			if ( 'undefined' === typeof step.name ) {
				this.setState( { status: 'finished' } );
			} else {
				this.setState( { status: step.name } );
			}
		} );
	},

	render() {
		return (
			<div>
				<h1>Setting up your plan…</h1>
				<p>Most of this will happen automatically, in steps, so we can notify the user what&apos;s happening</p>
				<p>Currently… { this.state.status }</p>
			</div>
		)
	}

} );
