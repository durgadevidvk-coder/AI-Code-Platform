import os
import time
from google import genai


def generate_code(prompt):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured")

    client = genai.Client(api_key=api_key)

    max_retries = 3

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=f"""
You are an AI coding assistant.

Generate clean, production-quality code based on the user's request.

Important rules:
1. Return ONLY the code.
2. Do NOT include Markdown code fences.
3. Do NOT include explanations.
4. Do NOT include headings.
5. Do NOT say "Here is the code".
6. Make the code ready to copy directly into a source file.

User request:
{prompt}
""",
            )

            return response.text

        except Exception as e:
            error_message = str(e)

            print(
                f"Gemini attempt {attempt + 1}/{max_retries} failed:"
            )
            print(error_message)

            # Retry temporary 503/high-demand errors
            if "503" in error_message or "UNAVAILABLE" in error_message:

                if attempt < max_retries - 1:
                    wait_time = 3 * (attempt + 1)

                    print(
                        f"Gemini temporarily unavailable. "
                        f"Retrying in {wait_time} seconds..."
                    )

                    time.sleep(wait_time)
                    continue

            # For other errors, stop immediately
            raise e

    raise Exception(
        "Gemini AI service is temporarily unavailable. "
        "Please try again later."
    )