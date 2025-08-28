import os
import time
import random
import hmac
import hashlib
import base64
import requests
from Cryptodome.Cipher import AES
from Cryptodome.Util.Padding import pad, unpad

# 🔑 **Rolling Secret Key (3 Random Words)**
SECRET_WORDS_LIST = [
    "active", "breeze", "candle", "dancer", "effort", "forest", "gentle", "harbor", "insect", "jigsaw",
    "kidnap", "laptop", "magnet", "nectar", "oracle", "pencil", "quench", "rescue", "shelter", "tunnel",
    "unique", "vacuum", "wander", "yellow", "zigzag", "anchor", "bright", "create", "desert", "embark",
    "famous", "guitar", "honest", "ignite", "jockey", "kernel", "launch", "mantle", "narrow", "outset",
    "pastel", "quaint", "ripple", "sprint", "timber", "uphold", "vortex", "whisky", "xenial", "yonder",
    "abacus", "bucket", "carpet", "dental", "empire", "fabric", "gospel", "hunger", "impact", "jigsaw",
    "kidney", "lawyer", "mosaic", "nugget", "octave", "puddle", "quiver", "reboot", "sierra", "thread",
    "urgent", "violet", "wealth", "xeroxs", "yammer", "abrupt", "buckle", "cactus", "decade", "exceed",
    "fossil", "growth", "humble", "insult", "jungle", "kindle", "luxury", "muscle", "napkin", "orphan",
    "patent", "quasar", "rocket", "sizzle", "theory", "unfold", "volume", "wisdom", "xylotl", "zephyr"
]

LAST_GENERATED_TIME = 0
CURRENT_SECRET_WORDS = []

# 🚀 **Rolling Code Counter (Based on time)**
def get_rolling_counter() -> int:
    return int(time.time() // 30)  # Rolling key updates every 30 sec

# 🔄 **Generate New Rolling Secret Words**
def generate_secret_words():
    global CURRENT_SECRET_WORDS, LAST_GENERATED_TIME
    LAST_GENERATED_TIME = get_rolling_counter()
    CURRENT_SECRET_WORDS = random.sample(SECRET_WORDS_LIST, 3)  # Pick 3 random words
    print(f"🔑 Generated Secret Words: {CURRENT_SECRET_WORDS}")
    return CURRENT_SECRET_WORDS

# 🔑 **Rolling Key Generation (HMAC-SHA256)**
def generate_rolling_key(counter: int) -> bytes:
    words_str = " ".join(CURRENT_SECRET_WORDS).encode()  # Convert words to bytes
    rolling_key = hmac.new(words_str, str(counter).encode(), hashlib.sha256).digest()
    print(f"🔄 Generated Rolling Key: {rolling_key.hex()}")
    return rolling_key

# 🔐 **AES-256 Encryption**
def encrypt_rolling_key(rolling_key: bytes) -> str:
    """Encrypt the rolling key using AES-256."""
    iv = os.urandom(16)  # Generate a random IV
    cipher = AES.new(words_to_bytes(CURRENT_SECRET_WORDS), AES.MODE_CBC, iv)
    encrypted_data = cipher.encrypt(pad(rolling_key, AES.block_size))
    encrypted_output = base64.b64encode(iv + encrypted_data).decode()
    
    print(f"🔐 IV for Encryption: {iv.hex()}")
    print(f"🔒 Encrypted Rolling Key: {encrypted_output}")
    return encrypted_output

# 🔓 **AES-256 Decryption & Verification**
def decrypt_rolling_key(encrypted_data: str, counter: int) -> bool:
    """Decrypt and validate the rolling key on the bike."""
    encrypted_data = base64.b64decode(encrypted_data)
    iv, encrypted_key = encrypted_data[:16], encrypted_data[16:]

    print(f"🔑 IV for Decryption: {iv.hex()}")
    
    cipher = AES.new(words_to_bytes(CURRENT_SECRET_WORDS), AES.MODE_CBC, iv)
    rolling_key = unpad(cipher.decrypt(encrypted_key), AES.block_size)

    print(f"🔓 Decrypted Rolling Key: {rolling_key.hex()}")
    
    expected_key = generate_rolling_key(counter)
    is_valid = rolling_key == expected_key
    
    if is_valid:
        print("✅ Rolling Key Verification: MATCH ✅")
    else:
        print("❌ Rolling Key Verification: MISMATCH ❌")
    
    return is_valid

# 🔢 **Convert Secret Words to a Fixed 32-Byte Key**
def words_to_bytes(words):
    key = hashlib.sha256(" ".join(words).encode()).digest()
    print(f"🔑 Derived 32-Byte Key from Words: {key.hex()}")
    return key

# 🚲 **Authentication Attempt**
def attempt_unlock(user_input_words):
    print(f"\n🔑 User Entered Words: {user_input_words}")
    
    if user_input_words != CURRENT_SECRET_WORDS:
        print("❌ Authentication Failed: Incorrect Secret Words.")
        activate_anti_theft()
        return

    counter = get_rolling_counter()
    
    # 📲 **Generate & Encrypt Rolling Key**
    rolling_key = generate_rolling_key(counter)
    encrypted_key = encrypt_rolling_key(rolling_key)
    
    # 🚲 **Verify on Bike**
    if decrypt_rolling_key(encrypted_key, counter):
        print("✅ Bike locked! The location is sent now. 🏍️")
    else:
        print("⛔ Unlock Failed: Invalid or Expired Key")
        activate_anti_theft()

# 🚨 **Anti-Theft Mode**
def activate_anti_theft():
    print("🚨 ALERT! Unauthorized access detected!")
    print("🔒 Locking Regenerative Braking...")
    print("❌ Disabling Throttle...")

    if is_internet_available():
        send_theft_alert()
    else:
        print("⚠️ No Internet! Auto-locking bike in 5 seconds...")
        time.sleep(5)
        print("🔒 Bike Locked.")

# 🌐 **Check Internet Connection**
def is_internet_available():
    try:
        requests.get("https://www.google.com", timeout=3)
        print("🌐 Internet Check: Connected ✅")
        return True
    except requests.ConnectionError:
        print("🌐 Internet Check: No Connection ❌")
        return False

# 📩 **Send Theft Alert**
def send_theft_alert():
    print("📡 Sending Theft Alert to User's Mobile App... 🚀")
    print("📨 Theft alert sent!")

# 🔥 **Main Simulation**
if __name__ == "__main__":
    generate_secret_words()  # Generate first rolling words

    print("\n🚀 Welcome to EV Bike Anti-Theft System")
    print(f"🔑 Your current secret words: {CURRENT_SECRET_WORDS}")
    print("🕒 These words will expire in 30 seconds...")

    # Simulate user entering words for authentication
    user_input = input("\n🔐 Enter your 3 secret words (space-separated): ").strip().split()
    attempt_unlock(user_input)
