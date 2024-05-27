from token_authentication import TokenAuthenticator
from time import sleep



async def check_time_thread(tokens: TokenAuthenticator):
    """
    This function checks the elapsed time of a token in the given tokens: TokenAuthenticator object
    It sleeps for 10 seconds before accessing the data in the tokens object
    For each key (hash) in tokens, it runs the TokenAuthenticator method check_time()
    If the method returns True, the token is older than 5 minutes and the token is removed
    Otherwise, the function passes
    """
    while True:
        sleep(10)
        data = await tokens.get_data()
        for key in data:
            check_time = await tokens.check_time(key)
            if check_time is True:
                remove_token = await tokens.remove_token(key)
                if remove_token != "success":
                    pass