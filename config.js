const databaseConnect = () => {
    let connectionInfo = {
        host: '127.0.0.1',
        user: 'root',
        password: "12345@Riyaz",
        port: "3306",
        database: "pos-system",
        multipleStatements: true
    };

    return connectionInfo;
};

module.exports = { databaseConnect: databaseConnect };
