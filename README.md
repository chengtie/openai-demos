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

You need to have a local `.env` which contains `OPENAI_API_KEY`. We can use Node.js `14.21.3`.

```
$ cd backend
$ npm install
$ node server.js
```

### Run the frontend

We can use Node.js `16.13.2`.

```
$ yarn
$ yarn start
```

Then you could launch `http://localhost:3000` in a browser.
