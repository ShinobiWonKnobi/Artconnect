interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string;
  };
}

export default function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <div className="space-y-4">
      {comments?.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <img
            src={comment.user.avatar_url || 'https://via.placeholder.com/32'}
            alt={comment.user.username}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-sm">{comment.user.username}</p>
              <p className="text-gray-700">{comment.content}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(comment.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}