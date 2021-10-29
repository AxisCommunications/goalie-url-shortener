FROM python:3.9-alpine

WORKDIR /usr/src/app
COPY requirements.txt ./
# Install run dependencies
RUN apk add --update pcre-dev \
    # Install build dependencies
    && apk add --update --virtual build-dependencies python3-dev build-base linux-headers \
    # Create the group and user to be used in this container
    && addgroup flaskgroup \
    && adduser -G flaskgroup -s /bin/ash -S flask \
    # Install required dependencies (includes Flask and uWSGI)
    && pip install --no-cache-dir -r requirements.txt \
    # Remove build dependencies and cache
    && apk del build-dependencies \
    && rm -rf /var/cache/apk/*

# Expose the port where uWSGI will run
EXPOSE 5001

# Copy application source to container image
COPY run.py auth.py validator.py settings.py ./

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
