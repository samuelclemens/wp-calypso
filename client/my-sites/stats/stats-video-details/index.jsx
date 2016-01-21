/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var StatsList = require( '../stats-list' ),
	StatsModulePlaceholder = require( '../stats-module/placeholder' ),
	skeleton = require( '../mixin-skeleton' ),
	Card = require( 'components/card' );

module.exports = React.createClass( {
	displayName: 'StatModuleVideoDetails',

	mixins: [ skeleton( 'data' ) ],

	data: function( nextProps ) {
		var props = nextProps || this.props;

		return props.summaryList.data;
	},

	render: function() {
		var classes,
			isLoading = this.props.summaryList.isLoading();

		classes = [
			'stats-module',
			'is-expanded',
			'summary',
			'is-video-details',
			{
				'is-loading': isLoading,
				'is-showing-info': this.state.showInfo,
				'has-no-data': this.props.summaryList.isEmpty()
			}
		];

		return (
			<Card className={ classNames.apply( null, classes ) }>
				<div className="videoplays">
					<div className="module-header">
						<h4 className="module-header-title">{ this.translate( 'Video Embeds' ) }</h4>
					</div>
					<div className="module-content">
						<div className="stats-async-metabox-wrapper">
							<ul className="module-content-list module-content-list-legend">
								<li className="module-content-list-item">
									<span className="module-content-list-item-wrapper">
										<span className="module-content-list-item-label">{ this.translate( 'Page' ) }</span>
									</span>
								</li>
							</ul>
							<StatsModulePlaceholder isLoading={ isLoading } />
							<StatsList moduleName="Video Details" data={ this.props.summaryList.response.pages ? this.props.summaryList.response.pages : [] } />
						</div>
					</div>
				</div>
			</Card>
		);
	}
} );
