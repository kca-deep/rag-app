#!/usr/bin/env python3
"""
LLM Endpoint Test Script
Tests the LLM endpoint at http://112.173.179.199:8080
"""

import requests
import json
import time
from typing import Dict, Any, Optional

class LLMEndpointTester:
    def __init__(self, base_url: str = "http://112.173.179.199:8080"):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "User-Agent": "LLM-Endpoint-Tester/1.0"
        })

    def test_health(self) -> bool:
        """Test if the endpoint is reachable"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            print(f"Health check: {response.status_code}")
            return response.status_code == 200
        except requests.exceptions.RequestException as e:
            print(f"Health check failed: {e}")
            return False

    def test_completion(self, prompt: str, model: Optional[str] = None, max_tokens: int = 500) -> Dict[str, Any]:
        """Test completion endpoint"""
        payload = {
            "prompt": prompt,
            "max_tokens": max_tokens,
            "temperature": 0.7
        }

        if model:
            payload["model"] = model

        try:
            start_time = time.time()
            response = self.session.post(
                f"{self.base_url}/v1/completions",
                json=payload,
                timeout=60
            )
            end_time = time.time()

            result = {
                "status_code": response.status_code,
                "response_time": end_time - start_time,
                "success": response.status_code == 200
            }

            if response.status_code == 200:
                result["response"] = response.json()
            else:
                result["error"] = response.text

            return result

        except requests.exceptions.RequestException as e:
            return {
                "status_code": None,
                "response_time": None,
                "success": False,
                "error": str(e)
            }

    def test_chat_completion(self, messages: list, model: Optional[str] = None, max_tokens: int = 500) -> Dict[str, Any]:
        """Test chat completion endpoint"""
        payload = {
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.7
        }

        if model:
            payload["model"] = model

        try:
            start_time = time.time()
            response = self.session.post(
                f"{self.base_url}/v1/chat/completions",
                json=payload,
                timeout=60
            )
            end_time = time.time()

            result = {
                "status_code": response.status_code,
                "response_time": end_time - start_time,
                "success": response.status_code == 200
            }

            if response.status_code == 200:
                result["response"] = response.json()
            else:
                result["error"] = response.text

            return result

        except requests.exceptions.RequestException as e:
            return {
                "status_code": None,
                "response_time": None,
                "success": False,
                "error": str(e)
            }

    def test_models(self) -> Dict[str, Any]:
        """Test models endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/v1/models", timeout=10)
            result = {
                "status_code": response.status_code,
                "success": response.status_code == 200
            }

            if response.status_code == 200:
                result["models"] = response.json()
            else:
                result["error"] = response.text

            return result

        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e)
            }

    def run_all_tests(self):
        """Run all tests and print results"""
        print("=" * 60)
        print("LLM Endpoint Test Results")
        print("=" * 60)
        print(f"Testing endpoint: {self.base_url}")
        print()

        # Test 1: Health check
        print("1. Health Check")
        print("-" * 30)
        health_ok = self.test_health()
        print(f"Status: {'PASS' if health_ok else 'FAIL'}")
        print()

        # Test 2: Models endpoint
        print("2. Models Endpoint")
        print("-" * 30)
        models_result = self.test_models()
        print(f"Status: {'PASS' if models_result['success'] else 'FAIL'}")
        if models_result['success']:
            models = models_result.get('models', {}).get('data', [])
            print(f"Available models: {len(models)}")
            for model in models[:3]:  # Show first 3 models
                print(f"  - {model.get('id', 'Unknown')}")
        else:
            print(f"Error: {models_result.get('error', 'Unknown error')}")
        print()

        # Test 3: LLM Quantization Completion Test
        print("3. LLM Quantization Completion Test")
        print("-" * 50)
        quantization_prompt = "LLM 모델 양자화에 대해 설명해줘"
        completion_result = self.test_completion(quantization_prompt, max_tokens=1000)
        print(f"Status: {'PASS' if completion_result['success'] else 'FAIL'}")
        if completion_result['success']:
            print(f"Response time: {completion_result['response_time']:.2f}s")
            response_text = completion_result['response'].get('choices', [{}])[0].get('text', 'No text')
            print(f"Full Response:")
            print("=" * 80)
            print(response_text)
            print("=" * 80)
        else:
            print(f"Error: {completion_result.get('error', 'Unknown error')}")
        print()

        # Test 4: LLM Quantization Chat Completion Test
        print("4. LLM Quantization Chat Completion Test")
        print("-" * 50)
        chat_messages = [
            {"role": "user", "content": "LLM 모델 양자화에 대해 설명해줘"}
        ]
        chat_result = self.test_chat_completion(chat_messages, max_tokens=1000)
        print(f"Status: {'PASS' if chat_result['success'] else 'FAIL'}")
        if chat_result['success']:
            print(f"Response time: {chat_result['response_time']:.2f}s")
            message_content = chat_result['response'].get('choices', [{}])[0].get('message', {}).get('content', 'No content')
            print(f"Full Response:")
            print("=" * 80)
            print(message_content)
            print("=" * 80)
        else:
            print(f"Error: {chat_result.get('error', 'Unknown error')}")
        print()

        print("=" * 60)
        print("Test Summary")
        print("=" * 60)
        total_tests = 4
        passed_tests = sum([
            health_ok,
            models_result['success'],
            completion_result['success'],
            chat_result['success']
        ])
        print(f"Tests passed: {passed_tests}/{total_tests}")
        print(f"Overall status: {'PASS' if passed_tests == total_tests else 'FAIL'}")

def main():
    """Main function to run the tests"""
    import sys
    import io

    # Set UTF-8 encoding for Windows console
    if sys.platform.startswith('win'):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    tester = LLMEndpointTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()