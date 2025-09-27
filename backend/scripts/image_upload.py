import base64
from openai import OpenAI
from config import OPENAI_KEY

client = OpenAI(api_key=OPENAI_KEY)

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


image_path = "/Users/sarinali/Desktop/Screenshot 2025-09-26 at 14.19.35.png"

base64_image = encode_image(image_path)

print(base64_image)


response = client.responses.create(
    model="gpt-4.1",
    input=[
        {
            "role": "user",
            "content": [
                { "type": "input_text", "text": "what's in this image?" },
                {
                    "type": "input_image",
                    "image_url": f"data:image/png;base64,{base64_image}",
                },
            ],
        }
    ],
)

print(response.output_text)