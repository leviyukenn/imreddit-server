import { Injectable } from '@nestjs/common';
import { Post } from 'src/posts/post.entity';
import { Connection } from 'typeorm';
import { Upvote } from './upvote.entity';

@Injectable()
export class UpvotesService {
  constructor(private connection: Connection) {}
  async vote(userId: string, postId: string, value: number, points: number) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newUpvote = new Upvote();
      newUpvote.userId = userId;
      newUpvote.postId = postId;
      newUpvote.value = value;

      await queryRunner.manager.save(newUpvote);
      await queryRunner.manager.increment(
        Post,
        { id: postId },
        'points',
        points,
      );

      await queryRunner.commitTransaction();
      return points;
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
      return 0;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  async findUpvote(
    userId: string,
    postId: string,
  ): Promise<Upvote | undefined> {
    return Upvote.findOne({ userId, postId });
  }

  async findUserUpvotePost(userId: string, value: number): Promise<string[]> {
    const upvotes = await Upvote.find({ where: { userId, value: value } });
    return upvotes.map((upvote) => upvote.postId);
  }
}
