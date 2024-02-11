import { Test, TestingModule } from '@nestjs/testing';
import { AssistantService } from '~/vendors/openai/assistant/assistant.service';

describe('AssistantService', () => {
  let service: AssistantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssistantService],
    }).compile();

    service = module.get<AssistantService>(AssistantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
