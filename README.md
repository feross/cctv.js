# CCTV.js

Watch live visitors using your website.

Copyright (c) 2012 [Feross Aboukhadijeh](http://feross.org) and John Hiesey. All rights reserved. No free software license (for now).

Built in 12 hours for the Stanford ACM Hackathon.

## Usage

### Run as standalone demo

```
node server.js
```

Visit `http://localhost:4000/admin.html` and `http://localhost:4000/sample`.

### Integrate into a node app as a module

```
var cctv = require('./node_modules/cctv')
  , http = require('http')
  , express = require('express')
  , app = express()
  , server = http.createServer(app)

cctv.listen(app, server)
```
