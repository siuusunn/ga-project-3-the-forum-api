import Post from '../models/post.js';

async function createComment(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .send({ message: `Post with id ${req.params.id} not found` });
    }
    console.log('req is', req.body);

    const newComment = {
      ...req.body,
      addedBy: req.currentUser._id
    };

    post.comments.push(newComment);

    const savedPost = await post.save();

    return res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
}

async function updateComment(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .send({ message: `No post found with id ${req.params.id}` });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).send({ message: 'No comment found' });
    }

    if (!comment.addedBy.equals(req.currentUser._id)) {
      return res.status(301).send({
        message: 'Unauthorized: can not update other users comment'
      });
    }

    comment.set(req.body);

    const savedPost = await post.save();

    return res.status(200).json(savedPost);
  } catch (error) {
    next(error);
  }
}

async function deleteComment(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .send({ message: `No post found with id ${req.params.id}` });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).send({ message: 'Comment  not found' });
    }
    if (
      !comment.addedBy.equals(req.currentUser._id) ||
      !req.currentUser.isAdmin
    ) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    comment.remove();

    const savedPost = await post.save();

    return res.status(200).json(savedPost);
  } catch (error) {
    next(error);
  }
}

export default { createComment, updateComment, deleteComment };
