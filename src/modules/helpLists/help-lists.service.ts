import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HelpList } from './help-list.entity';
import { HelpRequest } from '../helpRequests/help-request.entity';
import { HelpListCreateDto } from './dto/help-list-create.dto';
import { HelpListStatus } from './help-list-status';

@Injectable()
export class HelpListsService {
  static LOGGER = new Logger('HelpLists', true);

  constructor(
    @InjectRepository(HelpList)
    private readonly helpListsRepository: Repository<HelpList>,
    @InjectRepository(HelpRequest)
    private readonly requestRepository: Repository<HelpRequest>,
  ) {}

  async getById(
    userId: string,
    helpListId: number,
    options: {
      checkOwner: boolean;
    } = { checkOwner: true },
  ) {
    const where: any = {};
    if (options.checkOwner) {
      where.ownerId = userId;
    }
    const helpLists = await this.helpListsRepository.findOne(helpListId, {
      where,
      relations: [
        'helpRequests',
        'helpRequests.articles',
        'helpRequests.articles.article',
      ],
    });
    if (!helpLists) {
      throw new NotFoundException('Help List not found');
    }
    return helpLists;
  }

  async create(userId: string, createRequestDto: HelpListCreateDto) {
    const helpList = new HelpList();
    if (createRequestDto.helpRequestsIds) {
      helpList.helpRequests = createRequestDto.helpRequestsIds.map(h => ({
        id: h,
      }));
    }
    helpList.ownerId = userId;
    helpList.status = HelpListStatus.ACTIVE;

    return this.helpListsRepository.save(helpList);
  }

  async getAllByUser(userId: string) {
    return await this.helpListsRepository.find({
      where: { ownerId: userId },
      relations: ['helpRequests'],
    });
  }

  async update(
    userId: string,
    helpList: HelpList,
    helpListUpdate: HelpListCreateDto,
  ): Promise<HelpList> {
    if (userId !== helpList.ownerId) {
      throw new ForbiddenException('The help list does not belong to you');
    }
    if (helpListUpdate.status) {
      helpList.status = helpListUpdate.status;
    }
    if (helpListUpdate.helpRequestsIds) {
      helpList.helpRequests = helpListUpdate.helpRequestsIds.map(id => {
        const re = new HelpRequest();
        re.id = id;
        return re;
      });
    }
    return await this.helpListsRepository.save(helpList);
  }

  async addRequest(
    userId: string,
    helpList: HelpList,
    helpRequest: HelpRequest,
  ): Promise<HelpList> {
    if (userId !== helpList.ownerId) {
      throw new ForbiddenException('The help list does not belong to you');
    }
    helpList.helpRequests.push(helpRequest);
    return await this.helpListsRepository.save(helpList);
  }

  async removeRequest(
    userId: string,
    helpList: HelpList,
    helpRequest: HelpRequest,
  ): Promise<HelpList> {
    if (userId !== helpList.ownerId) {
      throw new ForbiddenException('The help list does not belong to you');
    }
    helpList.helpRequests = helpList.helpRequests.filter(
      request => request.id != helpRequest.id,
    );
    return await this.helpListsRepository.save(helpList);
  }
}