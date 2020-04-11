const users = []



//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room}) => {
    //clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    //check for exsiting users
    const exisitingUser = users.find((user) => {
        return user.room === room && user.username === username
    });

    if (exisitingUser) {
        return {
            error: 'Username is in use'
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user);
    return { user };
};


//remove a user by id
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    });

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

//get a user by id
const getUser = (id) => {
    return user = users.find((user) => {
        return user.id === id
    });

}


// //getUsersInRoom
const getUsersInRoom = (room) => {
    return roomUsers = users.filter((user) => {
        return user.room === room
    })
}

module.exports = {
    addUser, removeUser, getUser, getUsersInRoom
}
