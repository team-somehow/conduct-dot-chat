from flask import Blueprint, request, jsonify

hello_bp = Blueprint("hello", __name__)

@hello_bp.route("/hello", methods=["GET"])
def hello_get():
    return {"message": "Hello from /api/hello (GET)"}

@hello_bp.route("/hello", methods=["POST"])
def hello_post():
    data = request.get_json()
    name = data.get("name", "Anonymous")
    return jsonify({"message": f"Hello, {name}!"})
