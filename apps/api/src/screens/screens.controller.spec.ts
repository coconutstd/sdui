import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ScreensController } from './screens.controller';
import { ScreensService } from './screens.service';
import type { SDUIScreen } from '@sdui/schema';

const mockScreen: SDUIScreen = {
  version: '1.0',
  screenId: 'home',
  root: { id: 'root', type: 'text', props: { content: '테스트' } },
};

const mockMeta = [{ id: 'home', screenId: 'home', description: '홈 화면' }];

const mockScreensService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

describe('ScreensController', () => {
  let controller: ScreensController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScreensController],
      providers: [{ provide: ScreensService, useValue: mockScreensService }],
    }).compile();

    controller = module.get<ScreensController>(ScreensController);
  });

  describe('findAll()', () => {
    it('service.findAll() 결과를 그대로 반환한다', () => {
      mockScreensService.findAll.mockReturnValue(mockMeta);
      expect(controller.findAll()).toEqual(mockMeta);
      expect(mockScreensService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne()', () => {
    it('screenId를 service.findOne()에 전달하고 결과를 반환한다', () => {
      mockScreensService.findOne.mockReturnValue(mockScreen);
      expect(controller.findOne('home')).toEqual(mockScreen);
      expect(mockScreensService.findOne).toHaveBeenCalledWith('home');
    });

    it('service가 NotFoundException을 던지면 그대로 전파한다', () => {
      mockScreensService.findOne.mockImplementation(() => {
        throw new NotFoundException('없음');
      });
      expect(() => controller.findOne('unknown')).toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('screenId와 body를 service.update()에 전달하고 결과를 반환한다', () => {
      mockScreensService.update.mockReturnValue(mockScreen);
      expect(controller.update('home', mockScreen)).toEqual(mockScreen);
      expect(mockScreensService.update).toHaveBeenCalledWith('home', mockScreen);
    });

    it('service가 NotFoundException을 던지면 그대로 전파한다', () => {
      mockScreensService.update.mockImplementation(() => {
        throw new NotFoundException('없음');
      });
      expect(() => controller.update('ghost', mockScreen)).toThrow(NotFoundException);
    });
  });
});
