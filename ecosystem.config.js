module.exports = {
    apps: [
    {
        name: 'phone-validator-api',
        script: '/home/ubuntu/PhoneValidatorJavaApp/venv/bin/python',
        args: '-m uvicorn api.main:app --host 0.0.0.0 --port 8000',
        cwd: '/home/ubuntu/PhoneValidatorJavaApp',
        env: {
            PATH: '/home/ubuntu/PhoneValidatorJavaApp/venv/bin:$PATH'
        },
        error_file: './logs/api-error.log',
        out_file: './logs/api.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',
        watch: false,
        instances: 1
    },
    {
        name: 'phone-validator-queue-worker',
        script: '/home/ubuntu/PhoneValidatorJavaApp/start_rq_worker.py',
        interpreter: '/home/ubuntu/PhoneValidatorJavaApp/venv/bin/python3',
        exec_mode: 'fork',
        cwd: '/home/ubuntu/PhoneValidatorJavaApp',
        env: {
            PATH: '/home/ubuntu/PhoneValidatorJavaApp/venv/bin:$PATH'
        },
        error_file: './logs/worker-error.log',
        out_file: './logs/worker.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',
        watch: false,
        instances: 1
    },
    {
        name: 'phone-validator-frontend',
        script: 'npm',
        args: 'run dev',
        cwd: '/home/ubuntu/PhoneValidatorJavaApp/my-frontend',
        error_file: '../logs/frontend-error.log',
        out_file: '../logs/frontend.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',
        watch: false,
        instances: 1
    }
    ]
  };