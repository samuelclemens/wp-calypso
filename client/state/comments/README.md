Comments
========

## This store has the following structure:

```
comments = {
	items: Map<CommentTargetId, Tree>,
	latestCommentDate: Map<CommentTargetId, Date>, // date object
	queries: Map<RequestId, ActionType>,
};
```

## Types:

	CommentTargetId: `${siteId}-${postId}`;
	RequestId: `${siteId}-${postId}-${JSON.stringify(query)}`; // query is the query to wpcom replies()
	Tree: Map<CommentId, CommentNode>;
	in addition to the CommentId => CommentNode map, it has the following property:
		children: List<CommentId> // root-level comments ordered by date
		totalCommentsCount: number,
		fetchedCommentsCount: number

	CommentNode: Map<> {
		children: List<CommentId>,
		data: Map | undefined, // the comment as recieved from wpcom api, if not yet received: undefined
		parentId: CommentId | null | undefined, // if we don't know yet, set to undefined. if comment has parent then set to number else to null 
	}
