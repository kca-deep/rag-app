import os
import uvicorn
from pathlib import Path

# Ensure we're in the correct directory for .env file
script_dir = Path(__file__).parent
os.chdir(script_dir)

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Set default values if not provided
if not os.getenv("SECRET_KEY"):
    os.environ["SECRET_KEY"] = "super-secret-development-key-change-in-production-123456789"

if not os.getenv("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = "placeholder-openai-key-for-development"

from app.main import app

if __name__ == "__main__":
    print("🚀 Starting RAG Pipeline Backend...")
    print(f"   • API Server: http://localhost:8000")
    print(f"   • API Docs: http://localhost:8000/api/v1/docs")
    print(f"   • Health Check: http://localhost:8000/health")
    print()

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )