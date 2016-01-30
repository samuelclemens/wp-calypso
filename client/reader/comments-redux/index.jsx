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
		if ( ! this.props.comment ) {
			return null;
		}

		const comment = this.props.comment;

		const commentData = comment.get('data');

		return <li className={ 'comment depth-' + this.props.depth }>
			<p>{commentData.get( 'ID' )}</p>
			<PostTime date={ commentData.get( 'date' ) } />
			<p>{ commentData.get( 'date' ) }</p>
			{comment.get('children').size > 0 ? <ol>{comment.get('children').map( (c) => <Comment key={ commentData.get( 'ID' ) } depth={ this.props.depth + 1 } comment={ c } />)}</ol> : null }
		</li>
	}
}

class PostCommentList extends React.Component {

	componentWillMount() {
		const siteId = this.props.post.site_ID;
		const postId = this.props.post.ID;

		this.props.requestPostComments( siteId, postId );
	}

	renderComment( comment ) {
		if ( ! comment ) {
			return null;
		}

		const commentData = comment.get('data');
		return <Comment key={ commentData.get( 'ID' ) } depth={0} comment={ comment } />
	}

	renderComments( comments ) {
		if ( ! comments ) {
			return null;
		}

		return comments.get('root').map(( c ) => this.renderComment( c ) );
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

