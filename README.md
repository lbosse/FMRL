# Project #1: Chat Server  
**CS 455/555 Distributed Systems**  
**Spring 2018**  
**Authors:** Jake Carns, Luke Bosse  

## Distributed Socket.io chat server
*An example of a distributed chat system using Socket.io and Redis.*  

## Installing Dependencies
**Note: Running the server requires that your MongoDB and Redis instances are already running. See the instructions below for directions on how to install and run MongoDB and Redis:

### Installing Node.js
* [OSX/Windows](https://nodejs.org/en/download/)
* [*nix](https://nodejs.org/en/download/package-manager/)

### Installing MongoDB and Redis
* MongoDB
  * [OSX](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
  * [RedHat/CentOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat/)
  * [Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
  * [Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
* Redis
  * [*nix](https://redis.io/topics/quickstart)
  * [Windows (not recommended)](https://stackoverflow.com/questions/6476945/how-do-i-run-redis-on-windows/20200022#20200022)
  
### Running MongoDB and Redis
To run MongoDB and Redis, simply enter the following commands in your terminal:
* MongoDB: `mongod`
* Redis: `redis-server`

## Running the Server
1. Make sure Redis and MongoDB are already running. Don't worry about whether or not the database exists yet, MongoDB will take care of that for you.
2. Navigate to the project folder. Run `npm install` to install dependencies.
3. Copy the sample configuration file (sample-server.config.js) into server.config.js using the command `cp sample-server.config.js server.config.js`.
4. Note that Redis and database connection information are contained in the configuration file and can be edited if necessary. Default values are given for localhost.
5. Run the chat server using the following command: `./ChatServer -p <port#> -d <debug-level>`
6. Navigate to **https://localhost:<port#>** in your browser to log in and connect to the server.

## Observation and Reflection
Most of the project was written using a paired programming style over the course of several gatherings in the CS building. When programming individually Jake focused on the front end / user experience, and connecting the front end components to the backend socket handling. Luke, in turn, focused on login/register/logout functionality, storing information about the user, command interaction with the database, and testing. Most of the paired programming was used to develop the socket portion of the back end.

One of the biggest challenges that we faced during this project was solving the limited multithreading problems presented by Node.js. Unlike Java, node does not have true support for threads and handles all of its threading through child processes. The problem this creates is the limited ability to share information acrossed your process nodes. To solve this issue, we implemented support for an in memory store, Redis. This allowed us to persist socket and session information across all of our compute nodes, allowing them to work in unison across one port. Given our limited knowledge of Redis, we were able to allow basic functionality across the sockets, but struggled to share customized information across the nodes, making commands like the list command difficult. We hope to improve our understanding of Redis in the future to allow for more feature rich application devleopment.

One of the other major challenges we faced was the the learning curve of using a technology stack that we are much less familiar with. Although the experience was overwhelmingly pleasant, there was some difficulty in sifting through information in the documentation and other online tutorials and resources.

Finally, because we decided to use a web-based client with sessions, testing our chat server proved to be an interesting problem as well. Because a session cookie is needed to connect to the server, we had to create a separate testing page on the server that could be navigated to after login that then loaded a testing script. Given more time, we would likely create a way to test the server with a headless test script (without a browser).
