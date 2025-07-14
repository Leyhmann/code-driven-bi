import { Module } from '@nestjs/common';
import { HashPasswordService } from './hash-password.service';

@Module({ providers: [HashPasswordService], exports: [HashPasswordService] })
export class HashPasswordModule {}
