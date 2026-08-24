import urllib.request, json

data = json.dumps({"message": "Привет, хочу сайт для кафе"}).encode()
req = urllib.request.Request(
    "http://127.0.0.1:3003/api/chat",
    data=data,
    headers={"Content-Type": "application/json"},
)
try:
    resp = urllib.request.urlopen(req, timeout=30)
    print(resp.read().decode())
except Exception as e:
    print("ERROR:", e)
    try:
        print(e.read().decode())
    except:
        pass
