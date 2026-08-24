import urllib.request, json, time

SID = None

def send(msg):
    global SID
    data = json.dumps({"message": msg, "sessionId": SID}).encode()
    req = urllib.request.Request(
        "http://127.0.0.1:3003/api/chat",
        data=data,
        headers={"Content-Type": "application/json"},
    )
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        result = json.loads(resp.read().decode())
        SID = result.get("sessionId")
        print(f"USER: {msg}")
        print(f"AI: {result.get('reply', '')}")
        print(f"leadCreated: {result.get('leadCreated', False)}")
        print()
        return result
    except Exception as e:
        print("ERROR:", e)
        try:
            print(e.read().decode())
        except:
            pass

print("=== Message 1 ===")
send("Здравствуйте, какие кейсы у вас есть?")

time.sleep(1)

print("=== Message 2 ===")
send("Расскажите подробнее про ZetronixDocs, меня зовут Алексей, мой телефон +79001234567")

time.sleep(1)

print("=== Message 3 ===")
send("Да, хочу заказать такой продукт для своей компании")
