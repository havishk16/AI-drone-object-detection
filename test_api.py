"""
Simple script to test the backend API.
Run after starting the services with docker compose up.
"""

import requests
import sys

API_BASE = "http://localhost:8000"

def test_health():
    """Test health check endpoint."""
    print("Testing health check...")
    try:
        response = requests.get(f"{API_BASE}/")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_history():
    """Test history endpoint."""
    print("\nTesting history endpoint...")
    try:
        response = requests.get(f"{API_BASE}/history")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ History endpoint working")
            print(f"   Found {len(data)} detection(s)")
            return True
        else:
            print(f"❌ History endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ History endpoint failed: {e}")
        return False

def test_predict(image_path):
    """Test prediction endpoint with an image."""
    print(f"\nTesting prediction with {image_path}...")
    try:
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{API_BASE}/predict", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Prediction successful")
            print(f"   Detected {data['total_objects']} objects")
            for det in data['detections'][:5]:  # Show first 5
                print(f"   - {det['class_name']}: {det['confidence']:.2%}")
            return True
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            print(f"   {response.text}")
            return False
    except FileNotFoundError:
        print(f"❌ Image file not found: {image_path}")
        return False
    except Exception as e:
        print(f"❌ Prediction failed: {e}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("API Health Check")
    print("="*60)
    
    # Test health
    if not test_health():
        print("\n❌ Backend is not responding. Make sure services are running:")
        print("   docker compose up")
        sys.exit(1)
    
    # Test history
    test_history()
    
    # Test prediction if image provided
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        test_predict(image_path)
    else:
        print("\n💡 To test prediction, run:")
        print("   python test_api.py path/to/your/image.jpg")
    
    print("\n" + "="*60)
    print("✅ All basic tests passed!")
    print("="*60)
