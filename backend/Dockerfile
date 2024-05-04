FROM python:3.11.4-slim

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt 

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./main.py /code/
COPY ./models.py /code/
COPY ./backend_encryption.py /code/
COPY ./database.py /code/
COPY ./backend_mfa.py /code/

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]