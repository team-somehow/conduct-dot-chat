from flask import Flask
from routes.hello import hello_bp

app = Flask(__name__)

# Register blueprints
app.register_blueprint(hello_bp, url_prefix="/api")

@app.route("/")
def home():
    return {"message": "Hello from Flask!"}

if __name__ == "__main__":
    app.run(debug=True)
