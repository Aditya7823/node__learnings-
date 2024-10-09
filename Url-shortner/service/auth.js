const sessionIdTOUserMap = new Map();

function setuser(id, user) {
    sessionIdTOUserMap.set(id, user);
}

function getuser(id) {
    return sessionIdTOUserMap.get(id);
}

module.exports = {
    setuser,
    getuser,
};
