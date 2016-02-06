/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { translate } from 'lib/mixins/i18n';
import {
	getPostCommentsTree,
	getPostTotalCommentsCount,
	haveMoreCommentsToFetch
} from 'state/comments/selectors';
import {
	requestPostComments
} from 'state/comments/actions';
import {
	recordAction,
	recordGaEvent,
	recordTrack
} from 'reader/stats';
import PostComment from './post-comment';
import PostCommentForm from './form';

class PostCommentList extends React.Component {
	constructor( props ) {
		super();
		this.state = {
			activeReplyCommentID: null,
			amountOfCommentsToTake: props.initialSize
		};

		this.viewEarlierCommentsHandler = this.viewEarlierCommentsHandler.bind( this );
	}

	componentWillMount() {
		const siteId = this.props.post.site_ID;
		const postId = this.props.post.ID;

		this.props.requestPostComments( siteId, postId );
	}

	renderComment( commentId ) {
		if ( ! commentId ) {
			return null;
		}

		const onReplyClick = this.onReplyClick.bind( this );
		const onReplyCancel = this.onReplyCancel.bind( this );
		const commentText = this.state.commentText;
		const onUpdateCommentText = this.onUpdateCommentText.bind( this );

		return <PostComment
			post={ this.props.post }
			commentsTree={ this.props.commentsTree }
			commentId={ commentId }
			key={ commentId }
			activeReplyCommentID={ this.state.activeReplyCommentID }
			onReplyClick={ onReplyClick }
			onReplyCancel={ onReplyCancel }
			commentText={ commentText }
			onUpdateCommentText={ onUpdateCommentText }
			depth={ 0 }
		/>;
	}

	onReplyClick( commentID ) {
		this.setState( { activeReplyCommentID: commentID } );
		recordAction( 'comment_reply_click' );
		recordGaEvent( 'Clicked Reply to Comment' );
		recordTrack( 'calypso_reader_comment_reply_click', {
			blog_id: this.props.post.site_ID,
			comment_id: commentID
		} );
	}

	onReplyCancel() {
		recordAction( 'comment_reply_cancel_click' );
		recordGaEvent( 'Clicked Cancel Reply to Comment' );
		recordTrack( 'calypso_reader_comment_reply_cancel_click', {
			blog_id: this.props.post.site_ID,
			comment_id: this.state.activeReplyCommentID
		} );
		this.setState( { activeReplyCommentID: null } );
	}

	onUpdateCommentText( commentText ) {
		this.setState( { commentText: commentText } );
	}

	renderCommentsList( commentIds ) {
		return <ol className="comments__list is-root">
			{ commentIds.reverse().map( ( commentId ) => this.renderComment( commentId ) ) }
		</ol>;
	}

	renderCommentForm() {
		const post = this.props.post;
		const commentText = this.state.commentText;
		const onUpdateCommentText = this.onUpdateCommentText.bind( this );

		// Are we displaying the comment form at the top-level?
		if ( this.state.activeReplyCommentID && ! this.state.errors ) {
			return null;
		}

		return <PostCommentForm
			ref="postCommentForm"
			post={ post }
			parentCommentID={ null }
			commentText={ commentText }
			onUpdateCommentText={ onUpdateCommentText }
		/>;
	}

	getCommentsCount( commentIds ) {
		// we always count prevSum, children sum, and +1 for the current processed comment
		return commentIds.reduce( ( prevSum, commentId ) => prevSum + this.getCommentsCount( this.props.commentsTree.getIn( [ commentId, 'children' ] ) ) + 1, 0 );
	}

	getDisplayedComments( commentIds, take ) {
		if ( ! commentIds ) {
			return null;
		}

		const displayedComments = commentIds.take( take );

		return {
			displayedComments: displayedComments,
			displayedCommentsCount: this.getCommentsCount( displayedComments )
		};
	}

	viewEarlierCommentsHandler() {
		const siteId = this.props.post.site_ID;
		const postId = this.props.post.ID;

		this.setState( { amountOfCommentsToTake: this.state.amountOfCommentsToTake + this.props.pageSize } );

		if ( this.props.haveMoreCommentsToFetch ) {
			this.props.requestPostComments( siteId, postId );
		}
	}

	render() {
		if ( ! this.props.commentsTree ) {
			return null;
		}

		const {
			displayedComments,
			displayedCommentsCount
		} = this.getDisplayedComments( this.props.commentsTree.get( 'children' ), this.state.amountOfCommentsToTake );

		// Note: we might show less comments than totalCommentsCount because some comments might be
		// orphans (parent deleted/unapproved), that comment will become unreachable but still counted.
		const showViewEarlier = ( this.props.commentsTree.get( 'children' ).size > this.state.amountOfCommentsToTake ||
								this.props.haveMoreCommentsToFetch );

		// If we're not yet fetched all comments from server, we can only rely on server's count.
		// once we got all the comments tree, we can calculate the count of reachable comments
		const totalCommentsCount = this.props.haveMoreCommentsToFetch
									? this.props.totalCommentsCount
									: this.getCommentsCount( this.props.commentsTree.get( 'children' ) );

		return <div className="comments">
			<div className={ classNames( 'comments__top-bar', { 'no-comments': displayedCommentsCount === 0 } ) }>
				{ showViewEarlier ? <a href="javascript:void(0)" className="comments__view-earlier" onClick={ this.viewEarlierCommentsHandler }>{ translate( 'View earlier comments…' ) }</a> : null }
				<h3 className="comments__count">{ translate( '%(displayedCommentsCount)d of %(totalCommentsCount)d', {
					args: {
						displayedCommentsCount,
						totalCommentsCount
					}
				} ) }</h3>
			</div>
			{ this.renderCommentsList( displayedComments ) }
			{ this.renderCommentForm() }
		</div>;
	}
}

PostCommentList.propTypes = {
	post: React.PropTypes.shape( {
		ID: React.PropTypes.number.isRequired,
		site_ID: React.PropTypes.number.isRequired
	} ).isRequired,
	onCommentsUpdate: React.PropTypes.func.isRequired,
	pageSize: React.PropTypes.number,
	initialSize: React.PropTypes.number,

	// connect()ed props:
	commentsTree: React.PropTypes.object.isRequired, //TODO: Find a lib that provides immutable shape
	totalCommentsCount: React.PropTypes.number,
	haveMoreCommentsToFetch: React.PropTypes.bool.isRequired,
	requestPostComments: React.PropTypes.func.isRequired
};

PostCommentList.defaultProps = {
	pageSize: 10,
	initialSize: 5
};

export default connect(
	( state, ownProps ) => (
		{
			commentsTree: getPostCommentsTree( state, ownProps.post.site_ID, ownProps.post.ID ),
			totalCommentsCount: getPostTotalCommentsCount( state, ownProps.post.site_ID, ownProps.post.ID ),
			haveMoreCommentsToFetch: haveMoreCommentsToFetch( state, ownProps.post.site_ID, ownProps.post.ID )
		}
	),
	( dispatch ) => bindActionCreators( {
		requestPostComments
	}, dispatch )
)( PostCommentList );
