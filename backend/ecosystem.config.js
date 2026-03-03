module.exports = {
    apps: [
        {
            name: 'stock-options-api',
            script: './dist/server.js',
            instances: 'max', // Leverage all CPUs
            exec_mode: 'cluster', // Enable cluster mode
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
            max_memory_restart: '700M', // Scale based on Memory constraints (> 70% threshold loosely)
        },
    ],
};
