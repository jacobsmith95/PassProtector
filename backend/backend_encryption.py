from argon2 import PasswordHasher, exceptions

"""
Backend password hasher and verifier.
Output from generateSaltedHash() should be directly put in the db without changes.
Form is compatible with Argon2 verifier in verifyPassword().
Passwords are automatically salted using secure RNG.
Argon2 options are set to default. We can change them if we want but default is probably ok for now.
"""

ph = PasswordHasher()

def generateSaltedHash(password: str) -> str:
    """
    Generates salted hash from a password input
    
    Args:
        password: string form of password
    
    Returns:
        str: hash of password
    """
    return(ph.hash(password))

def verifyPassword(hash: str, password:str) -> bool:
    """
    Verifies salted hash against a given password.
    
    Args:
        hash: hash of password from DB 
        password: string form of password
    
    Returns:
        bool: result of verification
    """
    try:
        ph.verify(hash, password)
    except exceptions.VerifyMismatchError:
        return False
    
    return True




if __name__ == "__main__":
    print("Hashing same password produces different hashes due to random seed:")
    hash = generateSaltedHash("LongPassword")
    print(hash)
    hash = generateSaltedHash("LongPassword")
    print(hash)
    print("\n")

    print("Password verification returns a bool of result:")
    print(verifyPassword(hash, "LongPassword"))     # True
    print(verifyPassword(hash, "LongPassword "))    # False
    print(verifyPassword(hash, "ShortPassword"))    # False