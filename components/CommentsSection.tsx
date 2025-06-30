"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: { name: string; avatar_url?: string };
  parent_id: string | null;
  replies: Comment[];
}

interface CommentSectionProps {
  blogId: string;
}

interface User {
  id: string;
  email: string;
}

export function CommentSection({ blogId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isReplying, setIsReplying] = useState<Record<string, boolean>>({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(user !== null);
      } catch (error) {
        console.error('Error fetching user:', error);
        setIsAuthenticated(false);
      }
    };

    checkUser();
  }, []);
  // Transform flat comments array into a nested structure
  const nestComments = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create a map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: nest the comments
    comments.forEach(comment => {
      const commentNode = commentMap.get(comment.id);
      if (!commentNode) return;

      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentNode);
        }
      } else {
        rootComments.push(commentNode);
      }
    });

    return rootComments;
  };

  // Fetch comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?blogId=${blogId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }
        const data = await response.json();
        // Transform flat comments into nested structure before setting state
        const nestedComments = nestComments(data);
        setComments(nestedComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, [blogId]);

  // Handle posting a new comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("You must be logged in to comment.");
      return;
    }

    const content = newComment.trim();
    if (!content) {
      alert("Comment cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogId,
          content,
          parentId: null, // This is a top-level comment
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const newCommentData = await response.json();
      setComments(prev => [...prev, { ...newCommentData, replies: [] }]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle posting a reply to a comment
  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    const content = replyContent[parentId]?.trim();
    if (!content) {
      alert("Reply cannot be empty.");
      return;
    }

    setIsReplying(prev => ({ ...prev, [parentId]: true }));

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogId,
          content,
          parentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const newReply = await response.json();
      
      // Update the comments with the new reply
      setComments(prev => 
        prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          }
          return comment;
        })
      );

      // Clear the reply input and close the form
      setReplyContent(prev => ({ ...prev, [parentId]: "" }));
      setReplyTo(null);
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply");
    } finally {
      setIsReplying(prev => ({ ...prev, [parentId]: false }));
    }
  };

  // Render a single comment with replies
  const renderComment = (comment: Comment, depth: number = 0) => (
    <div
      key={comment.id}
      className={`mb-4 ${depth > 0 ? "ml-8 border-l-2 border-gray-700 pl-4" : ""}`}
    >
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.avatar_url} alt={comment.user.name} />
          <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-200">{comment.user.name}</span>
            <span className="text-sm text-gray-400">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-200">{comment.content}</p>
          <button
            onClick={() => setReplyTo(prev => prev === comment.id ? null : comment.id)}
            className="text-xl text-amber-200 hover:text-amber-400 mt-1"
          >
            {replyTo === comment.id ? 'Cancel' : 'Reply'}
          </button>
          {replyTo === comment.id && (
            <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-2">
              <Textarea
                value={replyContent[comment.id] || ''}
                onChange={(e) => 
                  setReplyContent(prev => ({
                    ...prev,
                    [comment.id]: e.target.value
                  }))
                }
                placeholder="Write your reply..."
                className="bg-gray-950 font-mono text-gray-200 border-gray-700"
              />
              <div className="mt-2 flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={isReplying[comment.id] || !replyContent[comment.id]?.trim()} 
                  className='font-mono'
                >
                  {isReplying[comment.id] ? "Posting..." : "Post Reply"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setReplyTo(null);
                    setReplyContent(prev => ({ ...prev, [comment.id]: "" }));
                  }}
                  disabled={isReplying[comment.id]}
                  className="bg-gray-400 text-black font-mono border-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
          {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
        </div>
      </div>
    </div >
  );

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-200 mb-4">Comments</h2>
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            className="bg-gray-950 text-2xl font-mono text-gray-200 border-gray-700"
          />
          <Button
            type="submit"
            disabled={isLoading || !newComment.trim()}
            className="mt-2 font-mono"
          >
            {isLoading ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      ) : (
        <p className="text-gray-400 mb-6">Please log in to post a comment.</p>
      )}
      {comments.length > 0 ? (
        comments.map((comment) => renderComment(comment))
      ) : (
        <p className="text-gray-400">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
}
