[![Build Status](https://travis-ci.org/andela-vnwaiwu/document-management-system.svg?branch=development)](https://travis-ci.org/andela-vnwaiwu/document-management-system)
[![Coverage Status](https://coveralls.io/repos/github/andela-vnwaiwu/document-management-system/badge.svg?branch=development)](https://coveralls.io/github/andela-vnwaiwu/document-management-system?branch=development)
[![Code Climate](https://codeclimate.com/github/andela-vnwaiwu/document-management-system/badges/gpa.svg)](https://codeclimate.com/github/andela-vnwaiwu/document-management-system)
[![Issue Count](https://codeclimate.com/github/andela-vnwaiwu/document-management-system/badges/issue_count.svg)](https://codeclimate.com/github/andela-vnwaiwu/document-management-system)


## Document Management Systems
This a Javascript implemented document management api with access levels, roles and priviledges.
Each document defines access rights; the document defines which roles can access it. Also, each document specifies the date it was published.
Users are categorized by roles.

#### Postman Collection
Run the App on `POSTMAN`.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/17ff3534f814ceda8a62)
#### *Features*

1. **Authentication**
- It uses JWT for authentication.  
- It generates a token and returns to the client.  
- It verifies the token on every request to authenticated endpoints.

2. **Users**
- It allows users to be created.  
- It sets a newly created user's role to `regular` by default.   
- It allows only the created user and the admin to edit, and update its information.   
- All registered users can be retrieved by the admin user.

3. **Roles**
- It ensures that users have a role.   
- It ensures users roles could be `admin` or `regular`.   
- It ensures new roles can be created, updated and deleted by an admin user.   
- It returns all roles to an admin user.

4. **Documents**
- It allows new documents to be created/saved by users.  
- It ensures all documents have an access defined (default access is `public`).  
- It allows only admin users to retrieve all documents regardless of the document access.  
- It ensures ONLY the user's private and others publicly accessed documents to be retrieved by the user.     
- It ensures only authenticated users can delete, edit and update documents they own.   
- It allows admin to delete any document regardless of the document access level.   

#### *API Endpoints*
| **HTTP Verb** | **Endpoint** | **Functionality**|
|------|-------|-----------------|
| **POST** | /api/users/login | Logs a user in and returns a token which should be subsequently used to access authenticated endpoints |
| **POST** | /api/users/logout | Logs a user out |
| **POST** | /api/users/signup | Creates a new user. Required attributes are `firstName`, `lastName`, `email`, `password`. If a `role` is not specified, a defualt role of `regular` created |
| **GET** | /api/users/ | Fetch all registered users (`admin` privilege required) |
| **GET** | /api/users/:id | Fetch a user by specific id (`admin` privilege required) |
| **PUT** | /api/users/:id | Update a specific user (by id) attributes|
| **DELETE** | /api/users/:id |Delete a specific user by id. (`admin` privilege required |
| **POST** | /api/documents/ | Creates a new document instance. Required attributes are `title` and `content`. If an `access` is NOT specified, the document is marked  _public_ |
| **GET** | /api/documents/ | Fetch all documents (returns all documents based on each document access right and the requesters role) |
| **GET** | /api/documents/:id | Fectch a specific document by it's id |
| **PUT** | /api/documents/:id | Update specific document attributes by it's id |
| **DELETE** | /api/documents/:id | Delete a specific document by it's id |
| **GET** | /api/users/:id/documents | Find all documents belonging to the specified user |
| **POST** | /api/roles/ | Create a new role (`admin` privilege required) |
| **GET** | /api/roles/ | Fetches all roles (`admin privilege required`) |
| **GET** | /api/roles/:id | Find a role by id (`admin privilege required`) |
| **PUT** | /api/roles/:id | Update role attributes (`admin privilege required`) |
| **DELETE** | /api/delete/:id | Delete role (`admin privilege required`) |

#### *Contributing*
1. Fork this repository to your GitHub account
2. Clone the forked repository
3. Create your feature branch
4. Commit your changes
5. Push to the remote branch
6. Open a Pull Request

#### *Technologies*
Technologies Used in the development of this api include the following
* [node.js] - evented I/O for the backend
* [babel-cli] - Babel Command line interface 
* [babel-core] - Babel Core for javascript transpiling
* [babel-loader] - Adds Babel support to Webpack
* [babel-preset-es2015] - Babel preset for ES2015
* [babel-register] - Register Babel to transpile our Mocha tests]
* [eslint] - Lints JavaScript
* [expect] - Assertion library for use with Mocha
* [express] - Serves development and production builds]
* [mocha] - JavaScript testing library


   [mocha]: <https://mochajs.org>
   [node.js]: <http://nodejs.org>
   [Gulp]: <http://gulpjs.com>
   [babel-cli]: <https://babeljs.io/>
   [babel-core]: <https://babeljs.io/>
   [babel-loader]: <https://babeljs.io/>
   [babel-preset-es2015]: <https://babeljs.io/>
   [babel-register]: <https://babeljs.io/>
   [eslint]: <http://eslint.org/>
   [expect]: <http://chaijs.com/api/bdd/>
   [express]: <http://expressjs.com/>
   [mocha]: <https://mochajs.org/>
   [npm-run-all]: <https://www.npmjs.com/package/npm-run-all>

#### *Limitations*
The limitations of the API are:
* Users cannot delete themselves using the API
* Documents are not unique (A user can create a document with the same title)
* Users logging out is dependent on the time the token expires
   
# LICENSE
 © `Victor Nwaiwu`
