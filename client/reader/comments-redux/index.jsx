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
import PostTime from 'reader/post-time';

class Comment extends React.Component {
	render() {
		if ( ! this.props.commentId ) {
			return null;
		}

		const commentId = this.props.commentId;
		const comments = this.props.comments;
		const comment = comments.get( commentId );
		const commentChildrenIds = comment.get('children');
		const commentData = comment.get( 'data' );

		return <li className={ 'comment depth-' + this.props.depth }>
			<p>{commentId}</p>
			<PostTime date={ commentData.get( 'date' ) } />
			<p>{ commentData.get( 'date' ) }</p>
			{commentChildrenIds.size > 0 ? <ol>{commentChildrenIds.map( ( childCommentId ) => <Comment key={ childCommentId } depth={ this.props.depth + 1 } commentId={ childCommentId } comments={ this.props.comments } />)}</ol> : null }
		</li>
	}
}

class PostCommentList extends React.Component {

	componentWillMount() {
		const siteId = this.props.post.site_ID;
		const postId = this.props.post.ID;

		this.props.requestPostComments( siteId, postId );
	}

	renderComment( commentId ) {
		if ( ! commentId ) {
			return null;
		}

		return <Comment key={ commentId } depth={ 0 } commentId={ commentId } comments={ this.props.comments } />
	}

	renderComments( comments ) {
		if ( ! comments ) {
			return null;
		}

		return comments.get('children').map(( commentId ) => this.renderComment( commentId ) );
	}

	render() {
		return <ol className="comments__list is-root">
			{ this.renderComments( this.props.comments ) }
		</ol>;
	}
}

PostCommentList.propTypes = {
	post: React.PropTypes.shape( {
		ID: React.PropTypes.number.isRequired,
		site_ID: React.PropTypes.number.isRequired
	} ).isRequired,
	onCommentsUpdate: React.PropTypes.func,

	// connect()ed props:
	comments: React.PropTypes.object.isRequired,
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

