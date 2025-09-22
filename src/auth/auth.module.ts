import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { SessionModule } from './contracts/session.module';
import { HashPasswordModule } from 'src/security/hash-password.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionStrategy } from './guards/session.strategy';
import { AuthGuard } from './guards/auth.guard';
import { BruteForceProtectionMiddleware } from './protection/brute-force-protection.middleware';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SessionModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || '3600',
        },
      }),
    }),
    HashPasswordModule,
    EventEmitterModule.forRoot(),
  ],
  providers: [AuthService, SessionStrategy, AuthGuard],
  controllers: [AuthController],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BruteForceProtectionMiddleware).forRoutes('api/auth/login');
  }
}
