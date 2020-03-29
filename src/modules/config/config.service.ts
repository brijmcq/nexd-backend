import { DotenvParseOutput, parse } from 'dotenv';
import { readFileSync } from 'fs';
import * as Joi from 'joi';

export class ConfigService {
  private readonly envConfig: DotenvParseOutput;

  constructor(filePath: string) {
    const parsedConfig = parse(readFileSync(filePath));
    this.envConfig = this.validateInput(parsedConfig);
  }

  /**
   * Getters for each environment variable
   */
  public get isDev() {
    return process.env.NODE_ENV === 'development';
  }

  public get isProd() {
    return process.env.NODE_ENV === 'production';
  }

  public get isTest() {
    return process.env.NODE_ENV === 'test';
  }

  public get databaseType() {
    return this.envConfig.DATABASE_TYPE;
  }

  public get databaseHost() {
    return this.envConfig.DATABASE_HOST;
  }

  public get databasePort() {
    return Number(this.envConfig.DATABASE_PORT);
  }

  public get databaseUsername() {
    return this.envConfig.DATABASE_USERNAME;
  }

  public get databasePassword() {
    return this.envConfig.DATABASE_PASSWORD;
  }

  public get databaseName() {
    return this.envConfig.DATABASE_NAME;
  }

  public get jwtSecret() {
    return this.envConfig.JWT_SECRET;
  }

  public get googleauthClientId() {
    return this.envConfig.GOOGLEAUTH_CLIENT_ID;
  }

  public get googleauthClientSecret() {
    return this.envConfig.GOOGLEAUTH_CLIENT_SECRET;
  }

  public get googleauthRedirectUri() {
    return this.envConfig.GOOGLEAUTH_REDIRECT_URI;
  }

  public get twillioAccountSSID() {
    return this.envConfig.TWILIO_ACCOUNT_SSID;
  }

  public get twillioAuthtoken() {
    return this.envConfig.TWILIO_ACCOUNT_SSID;
  }

  /**
   * Generic getter
   */
  get(key: string) {
    return this.envConfig[key];
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(parsedConfig: DotenvParseOutput) {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid(['development', 'production', 'test', 'provision', 'staging'])
        .default('development'),
      DATABASE_TYPE: Joi.string()
        .valid([
          'cockroachdb',
          'cordova',
          'mariadb',
          'mongodb',
          'mssql',
          'mysql',
          'nativescript',
          'oracle',
          'postgres',
          'react-native',
          'sqlite',
          'sqljs',
        ])
        .required(),
      PORT: Joi.number(),
      // API_AUTH_ENABLED: Joi.boolean()
      //   .required()
      //   .default(true),
      // add more validation rules ...
    });

    const validationOptions: Joi.ValidationOptions = { allowUnknown: true };

    const { error, value: validatedEnvConfig } = Joi.validate(
      parsedConfig,
      envVarsSchema,
      validationOptions,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }
}
