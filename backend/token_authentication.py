import time
import threading


# token dictionary class

class TokenAuthenticator():

    def __init__(self) -> None:
        """creates a new TokenAuthenticator Object"""
        self.data = {}
        self._lock = threading.Lock()

    async def get_data(self):
        """retrieves the data dictionary if the lock is acquired"""
        with self._lock:
            return self.data

    async def add_token(self, hash, auth_token_dict):
        """adds the given hash and token dictionary (token, time) if a lock is acquired"""
        with self._lock:
            self.data[f"{hash}"] = auth_token_dict
        return "success"

    async def remove_token(self, hash):
        """removes the given hash and token dictionary if a lock is acquired"""
        with self._lock:
            if hash not in self.data:
                return "failure"
            del self.data[f"{hash}"]
        return "success"
    
    async def get_token_dict(self, hash):
        """retrieves token dictionary (token, time) for a given hash if a lock is acquired"""
        with self._lock:
            if hash not in self.data:
                return "failure"
            token_dict = self.data[f"{hash}"]
        return token_dict

    async def verify_token(self, hash, token):
        """verifies that the hash and the token are valid if a lock is acquired"""
        with self._lock:
            if hash not in self.data:
                return "failure"
            token_dict = self.data[f"{hash}"]
        if token == token_dict["token"]:
            return "success"
        else:
            return "failure"
            
    async def check_time(self, hash):
        """checks the elapsed time on the token for a hash if a lock is acquired"""
        with self._lock:
            if hash not in self.data:
                return False
            token_dict = self.data[f"{hash}"]
            token_time = token_dict["time"]
        if (time.time() - token_time) >= 300.0:
            return True
        else:
            return False
            
    async def update_time(self, hash):
        """updates the token time for a hash if a lock is acquired"""
        with self._lock:
            if hash not in self.data:
                return "failure"
            token_dict = self.data[f"{hash}"]
            token_dict["time"] = time.time()
        return "success"

            