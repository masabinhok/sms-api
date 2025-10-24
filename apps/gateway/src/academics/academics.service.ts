import { Inject, Injectable } from '@nestjs/common';
import { ClientKafkaProxy } from '@nestjs/microservices';
import { UpdateSchoolDto } from 'apps/libs/dtos/update-school.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AcademicsService {
    private isClientReady = false;

    constructor(@Inject('ACADEMICS_CLIENT') private academicsClient: ClientKafkaProxy) {}

    async onModuleInit(){
        try {
            this.academicsClient.subscribeToResponseOf('school.update');
            await this.academicsClient.connect();

            await new Promise(resolve => setTimeout(resolve, 1000))
            this.isClientReady = true;
            console.log('Academics service client is ready');
        } catch (error) {
            console.error('Error initializing Academics service client', error);
        }
    }

    async updateSchool(updateSchoolDto: UpdateSchoolDto){
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('school.update', updateSchoolDto));
    }
}
