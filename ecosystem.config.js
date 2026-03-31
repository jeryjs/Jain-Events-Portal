module.exports = {
    apps: [
        {
            name: "fet-hub-backend",
            cwd: "./backend",
            script: "pnpm",
            args: "start",
            env: {
                PORT: 3101,
                NODE_ENV: "production"
            }
        },
        // {
        //     name: "fet-hub-clientview",
        //     cwd: "./clientview",
        //     script: "pnpm",
        //     args: "start",
        //     env: {
        //         NODE_ENV: "production"
        //     }
        // }
    ]
};