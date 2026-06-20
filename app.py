from io import BytesIO
import logging
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError
from werkzeug.exceptions import RequestEntityTooLarge
from transformers import BlipForConditionalGeneration, BlipProcessor


MODEL_NAME = "Salesforce/blip-image-captioning-base"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp"}
MAX_CONTENT_LENGTH = 5 * 1024 * 1024
MAX_IMAGE_PIXELS = 20_000_000
BASE_DIR = Path(__file__).resolve().parent


app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

logging.basicConfig(level=logging.INFO)

processor = BlipProcessor.from_pretrained(MODEL_NAME)
model = BlipForConditionalGeneration.from_pretrained(MODEL_NAME)


def make_response(success, message=None, status=200, **payload):
    body = {"success": success}

    if message:
        body["message"] = message

    body.update(payload)
    return jsonify(body), status


def allowed_file(filename):
    return bool(filename and "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS)


def validate_upload(file):
    if not file or file.filename == "":
        return "No image uploaded"

    if not allowed_file(file.filename):
        return "Invalid file type. Please upload a PNG, JPG, JPEG, or BMP image."

    if not file.mimetype or not file.mimetype.startswith("image/"):
        return "Uploaded file is not an image."

    return None


def load_image(file):
    image_bytes = file.read()

    if not image_bytes:
        raise ValueError("Uploaded image is empty.")

    try:
        image = Image.open(BytesIO(image_bytes))
        image.verify()
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except UnidentifiedImageError as exc:
        raise ValueError("The uploaded file is not a valid image.") from exc

    width, height = image.size
    if width * height > MAX_IMAGE_PIXELS:
        raise ValueError("Image dimensions are too large. Please upload a smaller image.")

    return image


def generate_caption(image):
    inputs = processor(images=image, return_tensors="pt")
    output = model.generate(**inputs)
    return processor.decode(output[0], skip_special_tokens=True)


@app.errorhandler(RequestEntityTooLarge)
def handle_large_file(_error):
    return make_response(False, "Image is too large. Please upload a file under 5 MB.", 413)


@app.errorhandler(404)
def handle_not_found(_error):
    return make_response(False, "Endpoint not found.", 404)


@app.errorhandler(405)
def handle_method_not_allowed(_error):
    return make_response(False, "Method not allowed for this endpoint.", 405)


@app.errorhandler(Exception)
def handle_unexpected_error(error):
    logging.exception("Unhandled server error: %s", error)
    return make_response(False, "Unexpected server error. Please try again later.", 500)


@app.route("/", methods=["GET"])
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/style.css", methods=["GET"])
def styles():
    return send_from_directory(BASE_DIR, "style.css")


@app.route("/script.js", methods=["GET"])
def scripts():
    return send_from_directory(BASE_DIR, "script.js")


@app.route("/assets/<path:filename>", methods=["GET"])
def assets(filename):
    return send_from_directory(BASE_DIR / "assets", filename)


@app.route("/caption", methods=["POST"])
def caption_image():
    if "image" not in request.files:
        return make_response(False, "No image uploaded", 400)

    file = request.files["image"]
    validation_error = validate_upload(file)

    if validation_error:
        return make_response(False, validation_error, 400)

    try:
        image = load_image(file)
        caption = generate_caption(image)
    except ValueError as exc:
        return make_response(False, str(exc), 400)
    except Exception:
        logging.exception("Failed to process uploaded image")
        return make_response(False, "Could not generate a caption for this image.", 500)

    return make_response(True, caption=caption)


@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "BLIP model is loaded and ready"})


if __name__ == "__main__":
    app.run(debug=True)
