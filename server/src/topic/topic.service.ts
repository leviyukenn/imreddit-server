import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Topic } from './topic.entity';

@Injectable()
export class TopicService {
  constructor(private connection: Connection) {}

  async createTopic(title: string, creatorId: string): Promise<Topic> {
    return Topic.create({ title, creator: { id: creatorId } }).save();
  }

  async findById(topicId: string) {
    return Topic.findOne(topicId);
  }
}
