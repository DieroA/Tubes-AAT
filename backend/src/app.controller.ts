import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Post,
} from '@nestjs/common';
import {
  ClientKafka,
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController implements OnModuleInit {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  async createReport(@Body() body: any) {
    this.logger.log(`Received report from user: ${body.title}`);

    // Db tidak diimplementasikan jadi id random
    const eventData = {
      id: Math.floor(Math.random() * 1000),
      ...body,
      timestamp: new Date().toISOString(),
    };

    this.kafkaClient.emit('citizen.report.created', eventData);

    return {
      status: 'success',
      message: 'Report accepted and queued for processing',
      data: eventData,
    };
  }

  @EventPattern('citizen.report.created')
  handleReportCreated(@Payload() message: any, @Ctx() context: KafkaContext) {
    const topic = context.getTopic();
    const serviceName = process.env.SERVICE_TYPE || 'UNKNOWN';

    if (serviceName === 'HTTP') {
      return;
    }

    this.logger.log(
      `[${serviceName}] Event Received: citizen.report.created ${topic}`,
    );

    if (serviceName === 'WORKFLOW') {
      this.logger.log(
        `[WORKFLOW]  Validating report location: ${message.location}`,
      );
      this.logger.log(
        `[WORKFLOW] Auto-assigning ticket #${message.id} to Dinas Pekerjaan Umum...`,
      );
      this.logger.log(`[WORKFLOW]  Status updated to "IN_PROGRESS"`);
    } else if (serviceName === 'NOTIFICATION') {
      this.logger.log(`[NOTIFICATION] Detecting user device...`);
      this.logger.log(
        `[NOTIFICATION] Sending Push Notification: "Laporan '${message.title}' telah diterima."`,
      );
      this.logger.log(`[NOTIFICATION] Emailing summary to test@kota.go.id`);
    }
  }
}
