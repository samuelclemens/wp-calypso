/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import analytics from 'analytics';
import titlecase from 'to-title-case';

export default React.createClass( {
	displayName: 'StatsModuleHeader',

	propTypes: {
		siteId: PropTypes.number,
		path: PropTypes.string,
		title: PropTypes.string,
		titleLink: PropTypes.string,
		showInfo: PropTypes.bool,
		showModule: PropTypes.bool,
		isCollapsed: PropTypes.bool,
		showActions: PropTypes.bool,
		showCollapse: PropTypes.bool,
		onActionClick: PropTypes.func
	},

	getDefaultProps() {
		return {
			showCollapse: true,
			showModule: true,
			showActions: true,
			onActionClick: () => {}
		}
	},

	toggleInfo: function( event ) {
		event.stopPropagation();
		event.preventDefault();
		const { path, onActionClick, showInfo } = this.props;
		const gaEvent = showInfo ? 'Closed' : 'Opened';

		if ( path ) {
			analytics.ga.recordEvent( 'Stats', gaEvent + ' More Information Panel', titlecase( path ) );
		}

		onActionClick( {
			showInfo: ! showInfo
		} );
	},

	toggleModule: function( event ) {
		event.preventDefault();
		const { path, onActionClick, showModule } = this.props;
		const gaEvent = showModule ? 'Collapsed' : 'Expanded';

		if ( path ) {
			analytics.ga.recordEvent( 'Stats', gaEvent + ' Module', titlecase( path ) );
		}

		onActionClick( {
			showModule: ! showModule
		} );
	},

	renderActions() {
		const { showCollapse, showInfo, showActions } = this.props;
		const infoIcon = showInfo ? 'info' : 'info-outline';

		if ( ! showActions ) {
			return null;
		}

		return (
			<ul className="module-header-actions">
				<li className="module-header-action toggle-info">
					<a href="#"
						className="module-header-action-link"
						aria-label={ this.translate( 'Show or hide panel information', { context: 'Stats panel action' } ) }
						title={ this.translate( 'Show or hide panel information', { context: 'Stats panel action' } ) }
						onClick={ this.toggleInfo }
					>
						<Gridicon icon={ infoIcon } />
					</a>
				</li>
				{ showCollapse ? this.renderChevron() : null }
			</ul>
		);
	},

	renderChevron() {
		return (
			<li className="module-header-action toggle-services">
				<a
					href="#"
					className="module-header-action-link"
					aria-label={
						this.translate(
							'Expand or collapse panel',
							{ context: 'Stats panel action' }
						)
					}
					title={
						this.translate(
							'Expand or collapse panel',
							{ context: 'Stats panel action' }
						)
					}
					onClick={
						this.toggleModule
					}
				>
					<Gridicon icon="chevron-down" />
				</a>
			</li>
		);
	},

	renderTitle() {
		const { title, titleLink } = this.props;

		if ( titleLink ) {
			return (
				<h3 className="module-header-title">
					<a href={ titleLink } className="module-header__link">
						<span className="module-header__right-icon">
							<Gridicon icon="stats" />
						</span>
						{ title }
					</a>
				</h3>
			);
		}

		return <h3 className="module-header-title">{ title }</h3>;
	},

	render() {
		return (
			<div className="module-header">
				{ this.renderTitle() }
				{ this.renderActions() }
			</div>
		);
	}
} );
