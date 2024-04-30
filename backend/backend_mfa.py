import pyotp
import qrcode

"""
MFA module for login authentication.
You will mostly be using verify(), but createAuthenticator() will be used when MFA is enabled for the account.
Intended use is with google authenticator app, I have not tested with anything else.
"""

def verify(secret: str, code: str) -> bool:
    """
    Verifies an MFA code.
    
    Args:
        secret: generated when authenticator is created, stored in db as a string
        code: 6 digit number in string format sent by the frontend. This code is entered by the user
                ex. "245818"

    Returns:
        result: boolean confirming if the code was correct
    """
    totp = pyotp.TOTP(secret)

    return totp.verify(code)


def createAuthenticator(email: str) -> tuple[str, str]:
    """
    Creates authenticator
    
    Args:
        email: user email

    Returns:
        url: Url to be sent to the frontend. Allows user to create authenticator on authenticator app. Will need to be rendered on the client side as a QR code
        secret: Secret used to create authenticator. Should be stored in the database and used by verify()
    """
    secret = pyotp.random_base32()
    url = pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name='Password Manager')       
    
    return (url, secret)


def create_qr_code(url):
    """
    Used for debugging, renders a QR code of a url locally
    """
    qr = qrcode.QRCode(version=3, box_size=20, border=10)
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save("qr_code.png")
    

if __name__ == "__main__":
    # url, secret = createAuthenticator("demo@gmail.com")
    # print(url)

    # print(verify("7BQQT4HYJSN5ZSBBAISISWHSDC37LOH6", input("Enter code: ")))
    # 7BQQT4HYJSN5ZSBBAISISWHSDC37LOH6
    pass