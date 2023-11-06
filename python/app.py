from flask import Flask, request, jsonify
import tiktoken

app = Flask(__name__)

@app.route('/tokenize', methods=['POST'])
def tokenize():
    data = request.json
    text = data['text']
    model = data.get('model', 'gpt-4')

    # Initialize the tokenizer for the specified model
    enc = tiktoken.encoding_for_model(model)
    
    # Tokenize the text
    tokens = enc.encode(text)
    token_count = len(tokens)

    return jsonify({'token_count': token_count})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
