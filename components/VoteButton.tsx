"use client";

import { useState, useEffect } from "react";
import { ArrowBigUpDash, ArrowBigDownDash } from "lucide-react";
import { HyperText } from "./magicui/hyper-text";

type VoteStatus = 'liked' | 'disliked' | null;

interface VoteButtonProps {
  blogId: string;
  initialVotes: number;
}

export function VoteButton({ blogId, initialVotes }: VoteButtonProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [voteStatus, setVoteStatus] = useState<VoteStatus>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check localStorage for existing vote when component mounts
  useEffect(() => {
    const savedVote = localStorage.getItem(`vote_${blogId}`) as VoteStatus;
    if (savedVote) {
      setVoteStatus(savedVote);
      // Update the vote count based on saved status
      setVotes(prev => savedVote === 'liked' ? prev + 1 : savedVote === 'disliked' ? prev - 1 : prev);
    }
  }, [blogId]);

  // Handle vote (upvote or downvote)
  const handleVote = async (isUpvote: boolean) => {
    // Check current vote status
    const currentVote = voteStatus;
    let newVoteStatus: VoteStatus = null;
    let voteChange = 0;

    // Determine the new vote status and vote change
    if (currentVote === null) {
      // New vote
      newVoteStatus = isUpvote ? 'liked' : 'disliked';
      voteChange = isUpvote ? 1 : -1;
    } else if (currentVote === 'liked') {
      // Toggle off like or switch to dislike
      if (isUpvote) {
        newVoteStatus = null;
        voteChange = -1;
      } else {
        newVoteStatus = 'disliked';
        voteChange = -2; // Remove like and add dislike
      }
    } else { // currentVote === 'disliked'
      // Toggle off dislike or switch to like
      if (!isUpvote) {
        newVoteStatus = null;
        voteChange = 1;
      } else {
        newVoteStatus = 'liked';
        voteChange = 2; // Remove dislike and add like
      }
    }

    // Update local state immediately for better UX
    setVoteStatus(newVoteStatus);
    setVotes(prev => prev + voteChange);
    
    // Save to localStorage
    if (newVoteStatus) {
      localStorage.setItem(`vote_${blogId}`, newVoteStatus);
    } else {
      localStorage.removeItem(`vote_${blogId}`);
    }

    // Optional: Sync with server in the background
    syncWithServer(initialVotes + voteChange).catch(console.error);
  };

  // Optional: Sync the vote with the server in the background
  const syncWithServer = async (newVoteCount: number) => {
    try {
      const response = await fetch(`/api/blog/like/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId, votes: newVoteCount }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update votes');
      }
    } catch (error) {
      console.error('Error syncing votes with server:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote(true)}
        disabled={isLoading}
        aria-label="Upvote"
      >
        <ArrowBigUpDash className="w-6 h-6 text-gray-200 hover:text-amber-200" />
      </button>
      <span className="text-lg font-mono text-gray-200 min-w-[20px] text-center">
        <HyperText>{String(votes)}</HyperText>
      </span>
      <button
        onClick={() => handleVote(false)}
        disabled={isLoading}
        aria-label="Downvote"
      >
        <ArrowBigDownDash className="w-6 h-6 text-gray-200 hover:text-amber-200" />
      </button>
    </div>
  );
}
