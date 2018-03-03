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
