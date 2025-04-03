FROM python:3.9

WORKDIR /app

COPY init.py .

RUN pip install requests psycopg2-binary

CMD ["python", "init.py"] 