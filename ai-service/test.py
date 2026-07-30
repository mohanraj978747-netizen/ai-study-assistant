import os
from dotenv import load_dotenv
from google import genai

# Load .env
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ GEMINI_API_KEY not found!")
    exit()

client = genai.Client(api_key=api_key)

print("=" * 60)
print("AVAILABLE MODELS")
print("=" * 60)

try:
    for model in client.models.list():
        print(model.name)
except Exception as e:
    print("Could not list models:", e)

print("\n" + "=" * 60)
print("TESTING MODELS")
print("=" * 60)

models = [
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-pro-latest",
]

for model in models:
    print(f"\n🧪 Testing: {model}")

    try:
        response = client.models.generate_content(
            model=model,
            contents="Say hello in one sentence."
        )

        print("✅ SUCCESS")
        print(response.text)
        print(f"\n🎉 Use this model in Render:")
        print(f"GEMINI_MODEL={model}")
        break

    except Exception as e:
        print("❌ FAILED")
        print(e)