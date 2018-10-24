# Goalie - A go short-link service implementation

This is an implementation of _go/_ links that makes it simple to access
internal web assets and share them on a coorporate network.

![Demo Animation](../assets/images/demo.gif?raw=true)

Goalie was initially developed by Anton Friberg together with Oscar Svensson
both part time student employees at [Axis Communications]. The backend is
written in [Python] using a [Flask] framework called [Eve] and stores the
shortcuts in a [mongoDB] database. The frontend utilizes [React.js] and [Redux]
to make it easy to edit shortcuts. The entire application is deployed using
[Docker].

[python]:(https://github.com/python)
[flask]:(https://github.com/pallets/flask)
[eve]:(https://github.com/pyeve/eve)
[mongodb]:(https://github.com/mongodb/mongo)
[react.js]:(https://github.com/facebook/react)
[redux]:(https://github.com/reduxjs/redux)
[docker]:(https://github.com/docker/docker-ce)

## Background

_go/_ links is a service that is believed to have originated at Google according
to [this blog post] and [this github repo]. The idea is that people on the
coorporate network can easily navigate between internal services by directing
their browser to http://go/service-name.

For example, if we want to be redirected towards information of our internal git
repo we visit http://go/git.

These days it is common to see similar services at many large IT companies.

[this blog post]: (http://blog.goatcodes.com/2018/04/18/go-origin)
[this github repo]:(https://github.com/kellegous/go)

## Notable Features

- Easily create and modify shortcuts for web URLs.
- LDAP/AD authentication.
- Immediate availability of shortcuts to all employees.
- Shortcuts are viewable and searchable by all employees.
- Only an administrator or the owner of the shortcut is able to modify or
  delete it.

As we have been using this service it has proven to be useful on multiple
occasions, for example:

- To avoid having to remember complicated URLs such as team meeting slides,
  documentation pages, important resources and internal services.
- Making it easier to share scattered web resources with new colleagues.
- As a searchable index of available internal web resources.
- As a DNS service for testing environments.
- Sending vanity urls in-place of complex and hard-to-read URLs will allow the
  receiver to more quickly grasp what service or resource the URL provides.

## Advanced Features
It may not be apparent at first glance but the pattern field for a new shortcut
actually accepts a regex value. This provides the service with many additional
features. We will provide a brief overview by presenting some examples.

### Single target for multiple patterns
This allows both `go/git` and `go/gerrit` to direct the user to the internal
git resource without the need for multiple shortcut entries.

| Pattern        | Target                  |
|----------------|-------------------------|
| `(git\|gerrit)`| https://git.example.com |

### Match multiple forms of spelling
This pattern matches `color-code-search`, `colour-code-search`, `color-code`
and `colour-code`.

| Pattern                  | Target                    |
|--------------------------|---------------------------|
| `colou?r-code(-search)?` | https://color.example.com |

### Capture groups inserted into target
This example in particular is very interesting. The first entry allow users to
enter `go/git/search_string` in the web browser and be redirected to a search
for `search_string` on the internal git website. The second entry allows
`go/git/303492/1` which points to the first patch set of the git commit with
the id `303492`.

| Pattern            | Target                         |
|--------------------|--------------------------------|
| `git/(.+)`         | https://git.example.com/q/\1   |
| `git/(\d+)(/\d+)?` | https://git.example.com/q/\1\2 |

### Wildcards
Some readers probably realize that the regex features are easy to abuse. On
inserts we only check for uniqueness i.e. that the pattern is not already used
by another shortcut. We *do* actually allow wildcard patterns like this:

| Pattern | Target                             |
|:--------|:-----------------------------------|
| `(.+)`  | https://www.google.com/search?q=\1 |

This would potentially clash with all other shortcuts and to handle cases such
as this we rank shortcuts and try to find the most specific one to redirect
the visitor towards.

### Ranking
If multiple patterns match the incomming URL string the most specific pattern
that matches should be returned. Currently this ranking looks like the
following. Taking the acronym `atf` as an exampel.

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

This ranking might not be perfect since `at[a-z]` at number 6 is probably considered more specific than `at.` by many users.

## Contributers & Maintainers

### Maintainer

- [Anton Friberg]

### Contributers

- [Anton Friberg]
- [Oscar Svensson]

[Anton Friberg]:(https://github.com/AntonFriberg)
[Oscar Svensson]:(https://github.com/wogscpar)