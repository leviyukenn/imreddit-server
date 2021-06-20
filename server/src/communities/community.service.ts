import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

@Injectable()
export class CommunityService {
  constructor(private connection: Connection) {}

  // async createCommunity(
  // ): Promise<Community | undefined> {
  //   const queryRunner = this.connection.createQueryRunner();

  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //   try {
  //     const newPost = await Community.create({
  //       ...createPostInput,
  //       parent: { id: createPostInput.parentId },
  //       creator: { id: createPostInput.creatorId },
  //     });

  //     const savedPost = await queryRunner.manager.save(newPost);

  //     if (createPostInput.images) {
  //       createPostInput.images.forEach(async (img) => {
  //         const newImage = await Image.create({
  //           ...img,
  //           post: { id: savedPost.id },
  //         });
  //         await queryRunner.manager.save(newImage);
  //       });
  //     }

  //     await queryRunner.commitTransaction();
  //     const post = Post.findOne(savedPost.id);
  //     return post;
  //   } catch (err) {
  //     // since we have errors lets rollback the changes we made
  //     await queryRunner.rollbackTransaction();
  //     throw new Error(err);
  //   } finally {
  //     // you need to release a queryRunner which was manually instantiated
  //     await queryRunner.release();
  //   }
  // }
}
