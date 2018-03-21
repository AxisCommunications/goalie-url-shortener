
FROM python:3.6-stretch

WORKDIR /usr/src/app

# Create the group and user to be used in this container
RUN groupadd flaskgroup && useradd -m -g flaskgroup -s /bin/bash flask

# Install required dependencies (includes Flask and uWSGI)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application to container image
COPY . .
RUN chown -R flask:flaskgroup /usr/src/app

# Create a symlink with a unique name to the Flask app's static resources.
# This volume can then get mounted and used by another container.
RUN ln -s /usr/src/app /usr/api
VOLUME /usr/api

# Expose the port where uWSGI will run
EXPOSE 5001

# Change user
USER flask

# If running this app behind a webserver using the uwsgi protocol (like nginx),
# then use --socket.  Otherwise run with --http to run as a full http server.
CMD ["uwsgi", "--socket", ":5001", "--wsgi-file", "run.py", "--callable", "app", "--processes",  "1", "--threads", "2", "--master"]