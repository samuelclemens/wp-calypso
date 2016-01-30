/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import {
	getComments
} from 'state/comments/selectors';
import {
	requestPostComments
} from 'state/comments/actions';


class PostCommentList extends React.Component {

	componentWillMount() {
		const siteId = this.props.post.site_ID;
		const postId = this.props.post.ID;

		this.props.requestPostComments( siteId, postId );
	}

	render() {
		return <div>
			Hello
		</div>;
	}
}

PostCommentList.propTypes = {
	post: React.PropTypes.shape( {
		ID: React.PropTypes.number.isRequired,
		site_ID: React.PropTypes.number.isRequired
	} ).isRequired,
	onCommentsUpdate: React.PropTypes.func,

	// connect()ed props:
	comments: React.PropTypes.array.isRequired,
	requestPostComments: React.PropTypes.func.isRequired
};

export default connect(
	( state, props ) => Object.assign( {},
		props,
		{
			comments: getComments( state, props.post.site_ID, props.post.ID )
		}
	),
	( dispatch ) => bindActionCreators( {
		requestPostComments
	}, dispatch )
)( PostCommentList );

