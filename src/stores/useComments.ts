import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import Gun from 'gun'

export interface Comment {
  id: string
  articleId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: number
  upvotes: number
  downvotes: number
  parentId?: string // For threaded replies
  replies?: Comment[]
  isEdited?: boolean
  editedAt?: number
}

export interface CommentVote {
  commentId: string
  userId: string
  type: 'upvote' | 'downvote'
}

/**
 * Comments Store - Manages article comments with Gun.js P2P storage
 *
 * Features:
 * - Post/Edit/Delete comments
 * - Threaded replies
 * - Upvote/Downvote system
 * - Real-time updates via Gun.js
 * - Local caching for performance
 */
export const useComments = defineStore('comments', () => {
  // Gun.js instance
  const gun = Gun(['https://gun-manhattan.herokuapp.com/gun'])

  // State
  const comments = ref<Map<string, Comment[]>>(new Map()) // articleId => Comment[]
  const votes = ref<Map<string, CommentVote>>(new Map()) // commentId => Vote
  const loading = ref<Map<string, boolean>>(new Map()) // articleId => loading state

  // Current user (from localStorage or session)
  const getCurrentUser = () => {
    if (typeof localStorage !== 'undefined') {
      return {
        id: localStorage.getItem('userId') || `user_${Date.now()}`,
        name: localStorage.getItem('userName') || 'Anonymous',
        avatar: localStorage.getItem('userAvatar') || undefined
      }
    }
    return {
      id: `user_${Date.now()}`,
      name: 'Anonymous',
      avatar: undefined
    }
  }

  /**
   * Get comments for an article
   */
  const getComments = (articleId: string): Comment[] => {
    return comments.value.get(articleId) || []
  }

  /**
   * Get comment count for an article
   */
  const getCommentCount = (articleId: string): number => {
    const articleComments = comments.value.get(articleId) || []
    return articleComments.length + articleComments.reduce((count, comment) =>
      count + (comment.replies?.length || 0), 0
    )
  }

  /**
   * Check if article is loading comments
   */
  const isLoading = (articleId: string): boolean => {
    return loading.value.get(articleId) || false
  }

  /**
   * Load comments for an article from Gun.js
   */
  const loadComments = async (articleId: string): Promise<void> => {
    loading.value.set(articleId, true)

    try {
      const commentsData: Comment[] = []

      // Query Gun.js for comments
      await new Promise<void>((resolve) => {
        gun.get('news_plugin')
          .get('comments')
          .get(articleId)
          .map()
          .once((data, key) => {
            if (data && typeof data === 'object' && key) {
              const comment: Comment = {
                id: key,
                articleId: data.articleId || articleId,
                userId: data.userId || 'unknown',
                userName: data.userName || 'Anonymous',
                userAvatar: data.userAvatar,
                content: data.content || '',
                timestamp: data.timestamp || Date.now(),
                upvotes: data.upvotes || 0,
                downvotes: data.downvotes || 0,
                parentId: data.parentId,
                isEdited: data.isEdited || false,
                editedAt: data.editedAt
              }
              commentsData.push(comment)
            }
          })

        // Wait a bit for Gun.js to fetch data
        setTimeout(() => resolve(), 1000)
      })

      // Sort by timestamp (newest first)
      commentsData.sort((a, b) => b.timestamp - a.timestamp)

      // Build threaded structure
      const rootComments: Comment[] = []
      const commentMap = new Map<string, Comment>()

      // First pass: create map
      commentsData.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] })
      })

      // Second pass: build tree
      commentsData.forEach(comment => {
        const commentWithReplies = commentMap.get(comment.id)
        if (commentWithReplies) {
          if (comment.parentId) {
            const parent = commentMap.get(comment.parentId)
            if (parent) {
              parent.replies = parent.replies || []
              parent.replies.push(commentWithReplies)
            } else {
              rootComments.push(commentWithReplies)
            }
          } else {
            rootComments.push(commentWithReplies)
          }
        }
      })

      comments.value.set(articleId, rootComments)
      console.log(`✅ Loaded ${rootComments.length} comments for article ${articleId}`)

    } catch (error) {
      console.error(`❌ Failed to load comments for ${articleId}:`, error)
    } finally {
      loading.value.set(articleId, false)
    }
  }

  /**
   * Post a new comment
   */
  const postComment = async (
    articleId: string,
    content: string,
    parentId?: string
  ): Promise<Comment | null> => {
    try {
      const user = getCurrentUser()
      const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const comment: Comment = {
        id: commentId,
        articleId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content,
        timestamp: Date.now(),
        upvotes: 0,
        downvotes: 0,
        parentId,
        isEdited: false
      }

      // Store in Gun.js
      await new Promise<void>((resolve, reject) => {
        gun.get('news_plugin')
          .get('comments')
          .get(articleId)
          .get(commentId)
          .put(comment, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err))
            } else {
              resolve()
            }
          })
      })

      // Add to local state
      if (parentId) {
        // Add as reply
        const articleComments = comments.value.get(articleId) || []
        const addReply = (comments: Comment[]): boolean => {
          for (const c of comments) {
            if (c.id === parentId) {
              c.replies = c.replies || []
              c.replies.push(comment)
              return true
            }
            if (c.replies && addReply(c.replies)) {
              return true
            }
          }
          return false
        }
        addReply(articleComments)
        comments.value.set(articleId, [...articleComments])
      } else {
        // Add as root comment
        const articleComments = comments.value.get(articleId) || []
        comments.value.set(articleId, [comment, ...articleComments])
      }

      console.log(`✅ Posted comment ${commentId} for article ${articleId}`)
      return comment

    } catch (error) {
      console.error('❌ Failed to post comment:', error)
      return null
    }
  }

  /**
   * Edit a comment
   */
  const editComment = async (
    articleId: string,
    commentId: string,
    newContent: string
  ): Promise<boolean> => {
    try {
      const user = getCurrentUser()

      // Update in Gun.js
      await new Promise<void>((resolve, reject) => {
        gun.get('news_plugin')
          .get('comments')
          .get(articleId)
          .get(commentId)
          .get('content')
          .put(newContent, (ack: any) => {
            if (ack.err) reject(new Error(ack.err))
            else resolve()
          })
      })

      await new Promise<void>((resolve) => {
        gun.get('news_plugin')
          .get('comments')
          .get(articleId)
          .get(commentId)
          .get('isEdited')
          .put(true, () => resolve())
      })

      await new Promise<void>((resolve) => {
        gun.get('news_plugin')
          .get('comments')
          .get(articleId)
          .get(commentId)
          .get('editedAt')
          .put(Date.now(), () => resolve())
      })

      // Update local state
      const articleComments = comments.value.get(articleId) || []
      const updateComment = (comments: Comment[]): boolean => {
        for (const c of comments) {
          if (c.id === commentId && c.userId === user.id) {
            c.content = newContent
            c.isEdited = true
            c.editedAt = Date.now()
            return true
          }
          if (c.replies && updateComment(c.replies)) {
            return true
          }
        }
        return false
      }
      updateComment(articleComments)
      comments.value.set(articleId, [...articleComments])

      console.log(`✅ Edited comment ${commentId}`)
      return true

    } catch (error) {
      console.error('❌ Failed to edit comment:', error)
      return false
    }
  }

  /**
   * Delete a comment
   */
  const deleteComment = async (
    articleId: string,
    commentId: string
  ): Promise<boolean> => {
    try {
      const user = getCurrentUser()

      // Remove from Gun.js
      await new Promise<void>((resolve) => {
        gun.get('news_plugin')
          .get('comments')
          .get(articleId)
          .get(commentId)
          .put(null, () => resolve())
      })

      // Remove from local state
      const articleComments = comments.value.get(articleId) || []
      const removeComment = (comments: Comment[]): Comment[] => {
        return comments.filter(c => {
          if (c.id === commentId && c.userId === user.id) {
            return false
          }
          if (c.replies) {
            c.replies = removeComment(c.replies)
          }
          return true
        })
      }
      comments.value.set(articleId, removeComment(articleComments))

      console.log(`✅ Deleted comment ${commentId}`)
      return true

    } catch (error) {
      console.error('❌ Failed to delete comment:', error)
      return false
    }
  }

  /**
   * Vote on a comment
   */
  const voteComment = async (
    articleId: string,
    commentId: string,
    voteType: 'upvote' | 'downvote'
  ): Promise<boolean> => {
    try {
      const user = getCurrentUser()
      const voteKey = `${user.id}_${commentId}`
      const existingVote = votes.value.get(commentId)

      // Toggle vote if same type, otherwise change vote
      let newVoteType: 'upvote' | 'downvote' | null = voteType
      if (existingVote?.type === voteType) {
        newVoteType = null // Remove vote
      }

      // Update vote count in Gun.js
      const articleComments = comments.value.get(articleId) || []
      const updateVote = (comments: Comment[]): boolean => {
        for (const c of comments) {
          if (c.id === commentId) {
            // Adjust counts
            if (existingVote) {
              if (existingVote.type === 'upvote') c.upvotes--
              else c.downvotes--
            }
            if (newVoteType) {
              if (newVoteType === 'upvote') c.upvotes++
              else c.downvotes++
            }

            // Store in Gun.js
            gun.get('news_plugin')
              .get('comments')
              .get(articleId)
              .get(commentId)
              .get('upvotes')
              .put(c.upvotes)

            gun.get('news_plugin')
              .get('comments')
              .get(articleId)
              .get(commentId)
              .get('downvotes')
              .put(c.downvotes)

            return true
          }
          if (c.replies && updateVote(c.replies)) {
            return true
          }
        }
        return false
      }
      updateVote(articleComments)
      comments.value.set(articleId, [...articleComments])

      // Update local votes
      if (newVoteType) {
        votes.value.set(commentId, {
          commentId,
          userId: user.id,
          type: newVoteType
        })
      } else {
        votes.value.delete(commentId)
      }

      console.log(`✅ Voted ${newVoteType || 'removed'} on comment ${commentId}`)
      return true

    } catch (error) {
      console.error('❌ Failed to vote on comment:', error)
      return false
    }
  }

  /**
   * Get user's vote for a comment
   */
  const getUserVote = (commentId: string): 'upvote' | 'downvote' | null => {
    const vote = votes.value.get(commentId)
    return vote?.type || null
  }

  return {
    // State
    comments,
    loading,

    // Getters
    getComments,
    getCommentCount,
    isLoading,
    getUserVote,

    // Actions
    loadComments,
    postComment,
    editComment,
    deleteComment,
    voteComment
  }
})
