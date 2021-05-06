const users =[]

// addUSer, removeUser, getUser, getUsersInRoom

const addUser = ({id,username,room})=>
{
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data
    if(!username || !room)
    {
        return {
            error: 'Username and room are required!'
        }
    }
    
    // check for existing user
    const existingUser = users.find((user)=>
    {
        return user.room === room && user.username === username
    })

    // validate username
    if(existingUser)
    {
        return {
            error: 'Username is in use'
        }
    }

    // stroe user
    const user = {id,username,room}
    users.push(user)
    return {user}
}

const removeUser = (id)=>
{
    // -1 = no match
    // 0 or greater if there is a match (the index itself)
    const index = users.findIndex((user)=> {
        return user.id === id
    })

    if (index !== -1)
    {
        return users.splice(index,1)[0]
    }
}

const getUser = (id)=>
{
    const index = users.findIndex((user)=> {
        return user.id === id
    })

    if (index !== -1)
    {
        return users[index]
    }
    return undefined
}

const getUsersInRoom = (room)=>
{
    room = room.trim().toLowerCase()
    return users.filter((user)=> user.room === room)
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}