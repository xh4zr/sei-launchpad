# sei-email-integration

1. Install app dependencies
```
npm install
```

2. create config.json
```javascript
{
    "SEI_ID": "<your-key-here>",
    "SEI_SECRET": "<your-secret-here>",
    "SEI_BASE": "<env-url>",
    "REDIS_URL": "<redis-url>",
}
```

3. OPTIONAL: create keys
```
openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365
openssl rsa -in keytmp.pem -out key.pem
```

4. run app
```
npm run watch
```

5. Go to page
```
https://localhost:8080/
```