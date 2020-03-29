<h1 align="center"></h1>

<div align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="150" alt="Nest Logo" />
  </a>
</div>

<h3 align="center">NestJS NextGuard</h3>

<div align="center">
  <a href="https://nestjs.com" target="_blank">
    <img src="https://img.shields.io/badge/built%20with-NestJs-red.svg" alt="Built with NestJS">
  </a>
</div>

## Introduction

This is simple guard wich can protect your routes by Role (RBAC) and also as the ability to check the ownership chain of the requested entity.

## Example

As an example consider that you are a user belonging to an organization which has some books associated. Now if you request a book by id this guard will check if the book that you are trying to fetch belongs to the organization that you are associated and so on you only need pass the models chain as awell as the property chain.

## Installation

<!-- 1. npm i @nextnm/nestjs-next-guard -->

```bash
npm i @nextnm/nestjs-next-guard
```

## Usage

## Caveats

1. You must be sure that in every request that the guard is used there is a user property in the request with an array of roles.
2. It will only comtemplates situations where you a have an id as resquest param (GET ("/:id")) or in the body (PUT udapdting object {\_id:"...", "property1":....})
   <!-- 1. npm i @nextnm/nestjs-next-guard -->

### Interface Decorator

```typescript
export interface ICheckOwnerShip {
  requestParam: string; // name of param that has the id mentioned in caveat 2
  modelChain: string[]; // the chain of owernship between models
  propertyChain: string[]; // array of the properties that link the models
  godRole?: string; // the role that will overcome the verification
}
```

### Importing module

```typescript
import * as mongoose from 'mongoose';
import { NestjsNextGuardModule } from '@nextnm/nestjs-next-guard';
// Temporary solution to pass connection to the guard
mongoose.connect('<YOUR_CONNECTION_STRING>')

...
@Module({
  imports: [
    DbModule,
    NestjsNextGuardModule.forRoot({
      models: [
        { token: 'Site', model: mongoose.model('site', SiteSchema)},
        { token: 'Page', model: mongoose.model('page', PageSchema) },
        { token: 'User', model: mongoose.model('user', UserSchema) },
      ],
    }),
  ],
  controllers: [],
  providers: [],
  exports: [NestjsNextGuardModule],
})
export class YOURModule {}
```

### Using decorators

```typescript
  @CheckOwnerShip({
    requestParam: 'modelId',
    propertyChain: ['site', 'user'],
    modelChain: ['Page','Site'],
    godRole: ExistingRoles.ADMIN,
  })
  @Roles(ExistingRoles.USER, ExistingRoles.ADMIN)
  @UseGuards(NextGuard)
  @Get(':modelId')
  async findById(@Param('id') id: string) {
    //...
  }
```

<!-- ## Change Log

See [Changelog](CHANGELOG.md) for more information. -->

<!-- ## Change Log

See [Changelog](CHANGELOG.md) for more information. -->

## Contributing

Contributions welcome!

## Next steps

1. Add some tests using Jest and supertest
2. Find a way to pass Mongoose Models to the module, to void calling "mongoose.connect(...)"
3. Add support do many to many relatioships betwenn models
4. Build Policy Based Guard

<!-- See [Contributing](CONTRIBUTING.md). -->

## Author

**Nuno Carvalhão (nextnm)**

## License

Licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
