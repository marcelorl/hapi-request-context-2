#hapi-request-context

Sets values form the HTTP headers on the CLS conext for each request

Make sure that you require the module the first time in yor index.js (or however your applicatioon entrypoint is named) to make sure that the context gets created correctly

```
'use strict';

require('hapi-request-context');

// The rest of your app startup code
var hapi = require('hapi');


```

License: BSD
