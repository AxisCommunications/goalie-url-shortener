FROM python:3.6-stretch

WORKDIR /usr/src/app

# Create the group and user to be used in this container
RUN groupadd flaskgroup && useradd -m -g flaskgroup -s /bin/bash flask

# Install required dependencies (includes Flask and uWSGI)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port where uWSGI will run
EXPOSE 5001

# Copy application source to container image
COPY run.py api.py settings.py ./

# Change owner of application files
RUN chown -R flask:flaskgroup /usr/src/app

# Change user
USER flask

# If running this app behind a webserver using the uwsgi protocol (like nginx),
# then use --socket.  Otherwise run with --http to run as a full http server.
CMD ["uwsgi", "--socket", ":5001", \
    "--wsgi-file", "run.py", \
    "--callable", "app", \
    "--processes",  "1", \
    "--threads", "10", \
    "--master"]