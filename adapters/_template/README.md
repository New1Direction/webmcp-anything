# _template/

Copy this directory to start a new adapter:

```bash
cp -r adapters/_template adapters/mysite
# rename the file inside and edit
mv adapters/mysite/adapter.js adapters/mysite.js
rmdir adapters/mysite
```

Then open `adapter.js` (now `mysite.js`) and fill in every `TODO`. Read [../CONTRACT.md](../CONTRACT.md) for the interface details and look at `../shopify.js` for a complete working example.
