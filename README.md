# openai-demos

### Run the Python backend

```
$ cd python
$ /usr/local/bin/python3.12 -m venv venv
$ source venv/bin/activate
$ pip install flask tiktoken
$ python app.py
```

### Run the Node backend

You need to have a local `.env` which contains `OPENAI_API_KEY`.

```
$ cd backend
$ npm install
$ node server.js
```

### Run the frontend

```
$ yarn
$ yarn start
```

Then you could launch `http://localhost:3000` in a browser.
