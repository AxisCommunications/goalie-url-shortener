Goalie - A _go/_ Short-Link Service Implementation
===============================================

This is an implementation of _go/_ links which makes it simple to access
internal web assets and share them on a corporate network.

![Demo Animation](../assets/images/demo.gif?raw=true)

Goalie was initially developed by Anton Friberg together with Oscar Svensson,
who are both part time student employees at [Axis Communications]. The backend
is written in [Python], using a [Flask] framework called [Eve], and stores the
shortcuts in a [mongoDB] database. The frontend utilizes [React.js] and [Redux]
to make it easy to edit shortcuts. The entire application is deployed using
[Docker].

[Axis Communications]: https://www.axis.com
[python]: https://github.com/python
[flask]: https://github.com/pallets/flask
[eve]: https://github.com/pyeve/eve
[mongodb]: https://github.com/mongodb/mongo
[react.js]: https://github.com/facebook/react
[redux]: https://github.com/reduxjs/redux
[docker]: https://github.com/docker/docker-ce

Table of Contents
=================

   * [Goalie](#goalie---a-go-short-link-service-implementation)
   * [Table of Contents](#table-of-contents)
   * [Background](#background)
   * [Notable Features](#notable-features)
   * [Advanced Features](#advanced-features)
      * [Single Target for Multiple Patterns](#single-target-for-multiple-patterns)
      * [Match Multiple Forms of Spelling](#match-multiple-forms-of-spelling)
      * [Capture Groups Inserted Into Target](#capture-groups-inserted-into-target)
      * [Wildcards](#wildcards)
      * [Ranking](#ranking)
   * [Setup](#setup)
      * [Initial Setup](#initial-setup)
      * [Development Environment](#development-environment)
      * [Production Hardening](#production-hardening)
   * [Troubleshooting](#troubleshooting)
   * [Contributors & Maintainers](#contributors--maintainers)
      * [Maintainers](#maintainers)
      * [Contributors](#contributors)


Background
==========

_go/_ links is a service that is believed to have originated at Google according
to [this blog post] and [this GitHub repository]. The idea is that people on the
corporate network can easily navigate between internal services by directing
their browser to http://go/service-name.

For example, if we want to be redirected towards information of our internal git
repo we visit http://go/git.

These days it is common to see similar services at many large IT companies.

[this blog post]: http://blog.goatcodes.com/2018/04/18/go-origin
[this GitHub repository]: https://github.com/kellegous/go

Notable Features
================

- Easily create and modify shortcuts for web URLs.
- LDAP/AD authentication.
- Immediate availability of shortcuts to all employees.
- Shortcuts are viewable and searchable by all employees.
- Only an administrator or the owner of the shortcut is able to modify or
  delete it.

As we have been using this service it has proven to be useful on multiple
occasions, for example:

- To avoid having to remember complicated URLs to things such as team meeting
  slides, documentation pages, important resources and internal services.
- Making it easier to share scattered web resources with new colleagues.
- As a searchable index of available internal web resources.
- As a DNS service for testing environments.
- Sending vanity URLs, instead of complex and hard-to-read URLs, will allow the
  receiver to more quickly grasp what service or resource the URL provides.

Advanced Features
=================

It may not be apparent at first glance, but the pattern field for a new shortcut
actually accepts a regex value. This provides the service with many additional
features. We will provide a brief overview by presenting some examples.

Single Target for Multiple Patterns
-----------------------------------

This allows both `go/git` and `go/gerrit` to direct the user to the internal
git resource without the need for multiple shortcut entries.

| Pattern        | Target                  |
|----------------|-------------------------|
| `(git\|gerrit)`| https://git.example.com |

Match Multiple Forms of Spelling
--------------------------------

This pattern matches `color-code-search`, `colour-code-search`, `color-code`
and `colour-code`.

| Pattern                  | Target                    |
|--------------------------|---------------------------|
| `colou?r-code(-search)?` | https://color.example.com |

Capture Groups Inserted Into Target
-----------------------------------

This example in particular is very interesting. The first entry allow users to
enter `go/git/search_string`, in the web browser, which then redirects to a
search for `search_string` on the internal git website. However, the second
entry allow them to enter `go/git/303492/1`, which then points to the first
patch set of the git commit with the ID `303492`.

| Pattern            | Target                         |
|--------------------|--------------------------------|
| `git/(.+)`         | https://git.example.com/q/\1   |
| `git/(\d+)(/\d+)?` | https://git.example.com/q/\1\2 |

Wildcards
---------

Some readers probably realize that these regex features are easy to abuse. On
inserts we only check for uniqueness, i.e. that the pattern is not already used
by another shortcut. We *do* actually allow wildcard patterns like this:

| Pattern | Target                             |
|:--------|:-----------------------------------|
| `(.+)`  | https://www.google.com/search?q=\1 |

This would potentially clash with all other shortcuts, and to handle cases such
as this we rank shortcuts and try to find the most specific one to redirect
the visitor towards.

Ranking
-------

If multiple patterns match the incoming URL string the most specific pattern
that matches should be returned. Currently this ranking looks like the
following, taking the acronym `atf` as an example:

| Rank | Target                       |
|------|------------------------------|
| 1.   | `atf`                        |
| 2.   | `(atf)`                      |
| 3.   | `at\w`                       |
| 4.   | `at.`                        |
| 5.   | `at.?`                       |
| 6.   | `at[a-z]`                    |
| 7.   | `(a\|atf\|a-test-framework)` |
| 8.   | `(atf)(.*)`                  |
| 9.   | `at.+`                       |
| 10.  | `.+`                         |
| 11.  | `.*`                         |

This ranking might not be perfect since `at[a-z]` (at number 6) is probably
considered more specific than `at.` by many users.

Setup
=====

Initial Setup
-------------

Before initial setup you must create a file called `jwt_secret` in a directory
called `.secrets` at the root of the project files. This will contain a 32 byte
long random string that is used for token signing. Keep this file secret.

```
$ mkdir .secrets
$ openssl rand -base64 32 > .secrets/jwt_secret
$ cat .secrets/jwt_secret
Pnpz+WN1fNBv8jFgQ4vFiXECAb+6aASG6Zv7bGrEdIg=
```

If you have a need to add your own CA certificate for the LDAP endpoint you can
do it by placing the CA certificate in a file called `ldap_ca_crt` in the
`.secrets` folder. You may then simply uncomment the relevant lines in the
[docker-compose.yml](docker-compose.yml) file.

In order to login to the service you need to configure your LDAP connection.
This is done in the [.env](.env) file. Here you can also configure the host
mount for the database files and other configurations.

With all configurations in place you may simply start the application with
`docker-compose`.

```
$ docker-compose up -d --build
```

Development Environment
-----------------------

During development you may wish to have the application auto-reload changes,
which is possible by starting the application using the development compose
[file](docker-compose.dev.yml).

```
$ docker-compose -f docker-compose.dev.yml up --build
```

### Python Development

Recommended Python development environment is to utilize a virtual Python
environment separate from the system (i.e. pyenv, virtualenv, etc.) with linting
provided by PyLint and automatic code formatting by utilizing Black.

| Name          | Version       |
| ------------- |:-------------:|
| [Python]      | `3.6`         |
| [PyLint]      | `2.3.1`       |
| [Black]       | `19.3`        |

[Python]: https://docs.python.org/3.6/
[PyLint]: https://www.pylint.org/
[Black]: https://github.com/ambv/black

### Javascript Development

Recommended Javascript development is to have linting provided with ESLint (with
React, Airbnb and Prettier plugins) and formatting by Prettier. The recommended
package manager is Yarn.

| Name          | Version       |
| ------------- |:-------------:|
| [Yarn]        | `1.15`        |
| [ESLint]      | `4.19`        |
| [Prettier]    | `1.13`        |

[Yarn]: https://yarnpkg.com/
[ESLint]: https://eslint.org/
[Prettier]: https://prettier.io/

Production Hardening
--------------------

If you wish to deploy the application to production it is recommended to look at
the [nginx production configuration file](frontend/nginx/nginx.production.conf),
which enables SSL encryption among other things. The file needs to be configured
for your own host and domain. Either replace the existing
[nginx.conf](frontend/nginx/nginx.production.conf) file or change the
[Dockerfile](frontend/Dockerfile) reference.

You place the key and certificate in files named `go_https_key` and
`go_https_crt` in the `.secrets` folder. Then you can simply uncomment the
relevant secrets in the [docker-compose](docker-compose.yml) file.

Troubleshooting
===============

If you encounter any problems during setup or development please create an
issue and we will try to answer as soon as possible.

Contributors & Maintainers
==========================

Maintainers
-----------

- [Anton Friberg]

Contributors
------------

- [Anton Friberg]
- [Oscar Svensson]

[Anton Friberg]: https://github.com/AntonFriberg
[Oscar Svensson]: https://github.com/wogscpar
