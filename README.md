# hapi-request-context-2

Sets values on the CLS context for each request.

It means:

 - You also have the ability to set values from Http Header directly in the plugin setup;
 - Or set a context value at any moment in your request lifecycle

Make sure that you require the module the first time in yor index.js (or however your applicatioon entrypoint is named) to make sure that the context gets created correctly.

## Installation
 
```
$ npm i hapi-request-context-2 --save
```

## Usage

```
const hapiRequestContext = require('hapi-request-context-2');

// hapi plugin installation
{
  register: hapiRequestContext,
  options: {
    mapHeaders: ['authorization'] // it will store 'authorization' in your context
  }
},

// Also, if you want to set an id for each request
server.ext('onPreHandler', (request, reply) => {
  hapiRequestContext.context().set('requestId', shortid.generate())

  return reply.continue()
})

// Then whenever you want to recover it
hapiRequestContext.context().get('authorization')
hapiRequestContext.context().get('requestId')
```

Play with it!!!11! =)

## Credits

I have copied this code from [hapi-request-context](https://bitbucket.org/trigo/hapi-request-context) package. I have applied few fixed to the code, since it seems the package
is not mantained anymore and I needed it to work properly.

ps. I couldn't fork it because the original repo is placed on bitbucket =/. 

### What did I do?

 - Replaced `continuous-local-storage` package to `cls-hooked`. `cls` has some known issues with async/await requests where 
 the data set with it gets lost and doesnt travel through the entire request proccess.
 - Better README.md

License: BSD
