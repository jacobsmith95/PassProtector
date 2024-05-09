import time


# token dictionary class

class TokenAuthenticator():

    def __init__(self) -> None:
        self.data = {}

    def add_token(self, hash, auth_token_dict):
        self.data[f"{hash}"] = auth_token_dict
        return "success"

    def remove_token(self, hash):
        if hash not in self.data:
            return "failure"
        del self.data[f"{hash}"]
        return "success"
    
    def get_token_dict(self, hash):
        if hash not in self.data:
            return "failure"
        token_dict = self.data[f"{hash}"]
        return token_dict

    async def verify_token(self, hash, token):
        if hash not in self.data:
            return "failure"
        token_dict = self.data[f"{hash}"]
        if token == token_dict["token"]:
            return "success"
        else:
            return "failure"

        
