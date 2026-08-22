import urllib.request, json

data = json.dumps({"name": "Test", "contact": "+79990000000", "comment": "Test lead"}).encode()
req = urllib.request.Request("http://127.0.0.1:3003/api/leads", data=data, headers={"Content-Type": "application/json"})
resp = urllib.request.urlopen(req)
print("POST result:", resp.read().decode())
