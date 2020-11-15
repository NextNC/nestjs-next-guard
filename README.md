<h1 align="center"></h1>

<div align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="150" alt="Nest Logo" />
  </a>
</div>

<h3 align="center">NestJS NextGuard</h3>
<a href="https://www.npmjs.com/package/@nextnm/nestjs-next-guard"><img src="https://img.shields.io/npm/v/@nextnm/nestjs-next-guard.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/@nextnm/nestjs-next-guard"><img src="https://img.shields.io/npm/l/@nextnm/nestjs-next-guard.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/@nextnm/nestjs-next-guard"><img src="https://img.shields.io/npm/dm/@nextnm/nestjs-next-guard.svg" alt="NPM Downloads" /></a>

<div align="center">
  <a href="https://nestjs.com" target="_blank">
    <img src="https://img.shields.io/badge/built%20with-NestJs-red.svg" alt="Built with NestJS">
  </a>
</div>

## Introduction

This is simple guard which can protect your routes by Role (RBAC) and also has the ability to check the ownership chain of the requested entity.

## Example

As an example consider that you are a user belonging to an organization which has some books associated. Now, if you request a book by id this guard will check if the book that you are trying to fetch belongs to the organization that you are associated and so on. You only need to pass the models chain as well as the property chain.

## Installation

<!-- 1. npm i @nextnm/nestjs-next-guard -->

```bash
npm i @nextnm/nestjs-next-guard
```

## Usage

### Caveats
1. We only support applications using mongodb.
2. You must be sure that in every request that the guard is used there is a user property in the request with an array of roles.
3. It will only contemplates situations where you a have an id as request param (GET ("/:id")) or in the body (PUT updating object {\_id:"...", "property1":....})

### Interface Decorator

```typescript
export interface ICheckOwnerShip {
  requestParam: string; // name of param that has the id mentioned in caveat 3
  modelChain: string[]; // the chain of ownership between models
  propertyChain: string[]; // array of the properties that link the models
  godRole?: string; // the role that will overcome the verification
}
```

### Importing module

```typescript
import * as mongoose from 'mongoose';
import { NextGuardModule } from '@nextnm/nestjs-next-guard';

...
@Module({
  imports: [
    DbModule,
    NextGuardModule.forRoot(),
  ],
  controllers: [],
  providers: [],
  exports: [NestjsNextGuardModule],
})
export class YOURModule {}
```
### Importing module (Redis integration)
We support Redis cache to improve performance when we have multiple chain nodes to verify ownership

```typescript
import * as mongoose from 'mongoose';
import { NextGuardModule } from '@nextnm/nestjs-next-guard';

...
@Module({
  imports: [
    DbModule,
    NextGuardModule.forRoot(
      {
        redisConfiguration: {
          host: 'localhost',
          port: 6379,
          ttl: 60 * 60 * 24,
          retry_strategy: () => 1000,
          mongooseInstance: mongoose,
        },
      }
    ),
  ],
  controllers: [],
  providers: [],
  exports: [NestjsNextGuardModule],
})
export class YOURModule {}
```


### Using decorators

Be aware that both decorators (Roles and CheckOwnerShip) are optional so use them as you want.

#### 1. Use Case

```
User:
{
  _id:ObjectId
}

Site:
{
  _id:ObjectId,
  user:ObjectId
}

Page:
{
  _id:ObjectId,
  site:ObjectId
}
```
##### Description (A user belongs to an Site)
1. The guard will take a look if you have role based permission to use this route
2. The guard will look for an "Page" (modelChain[0]) by id equals to the request param;
3. From the found Page it will try to grab the property 'site' (propertyChain[0]) and find a Site (modelChain[1]) by id equal to that property (propertyChain[0]).
4. From the Site found it will check if the property "user" matches the id of the user making the request.
```typescript
  import { CheckOwnerShip, Roles } from '@nextnm/nestjs-next-guard';

  ...

  @CheckOwnerShip({
    requestParam: 'modelId',
    propertyChain: ['site', 'user'], // The last property will be compared with the Id of the user making the request
    modelChain: ['Page','Site'],
    godRole: ExistingRoles.SYS_ADMIN, // If the user has this role not check will be done by the guard
  })
  @Roles(ExistingRoles.USER, ExistingRoles.ADMIN) // Provide the roles that you allow to execute this method,example: 'USER', 'ADMIN'
  @UseGuards(NextGuard)
  @Get(':modelId')
  async findPageById(@Param('id') id: string) {
    //...
  }
```

#### 2. Use case

```
User:
{
_id:ObjectId,
organization:ObjectId
}


Organization:
{
  _id:ObjectId
}
```

##### Description (A user belongs to an organization)
1. The guard will take a look if you have role based permission to use this route
2. The guard will look for an Organization (modelChain[0]) by id equals to the request param;
3. From the found Organization it will try to grab the property '_id' (propertyChain[0]) and find a User (modelChain[1]) by id equal to the that property (propertyChain[0]).
4. Since there isn't any, it will try to find a User with a property "organization" (propertyChain[1]) equals to the organization "_id" property(propertyChain[0])
5. From the User found it will check if the property "_id" matches the id of the user making the request.
```typescript
  import { CheckOwnerShip, Roles } from '@nextnm/nestjs-next-guard';

    ...

    @CheckOwnerShip({
    requestParam: 'id',
    propertyChain: ['_id','organization','_id'], // The last property will be compared with the Id of the user making the request
    modelChain: ['Organization','User'],
    godRole: ExistingRoles.SYS_ADMIN, // If the user has this role not check will be done by the guard
  })
  @Roles(ExistingRoles.USER, ExistingRoles.ADMIN) // Provide the roles that you allow to execute this method,example: 'USER', 'ADMIN'
  @UseGuards(AuthGuard('jwt'),NextGuard)
  @Get('/:id')
  findOrganizationById(@Param() params): Promise<ReadOrganizationDto> {
    //...
  }
```

<!-- ## Change Log

See [Changelog](CHANGELOG.md) for more information. -->

<!-- ## Change Log

See [Changelog](CHANGELOG.md) for more information. -->

## Contributing

Contributions are welcome! See [Contributing](CONTRIBUTING.md).

## Next steps

1. Improve documentation
2. Add some tests using Jest and supertest
3. Add full support do many to many relationships between models (it doesn't alow having array of ids as relationships)
4. Build Policy Based Guard

<!-- See [Contributing](CONTRIBUTING.md). -->

## Author

**Nuno Carvalhão (nextnm/nextNC) [Site](https://nunocarvalhao.com)**

## License

Licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
